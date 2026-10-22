import {useEffect, useRef, useState} from "react";
import cx from "../../lib/cx";
import {readJSON, writeJSON} from "../../lib/storage";
import {GameButton, Stat, Stats, Toggle} from "./kit";
import style from "./games.module.css";
import ai from "./auraIdle.module.css";

// Aura Farm Idle: the slow-burn sibling of Aura Farm. Tap the orb for aura, spend it on habits that farm aura on
// their own, and buy upgrades that multiply it all. Past a million aura you can touch grass: start over in
// exchange for grass, which permanently boosts everything. Progress saves to this browser and keeps farming while
// you're away (up to 8 hours). It never ends, so like the other endless games it has no high score.

const SAVE_KEY = "games.auraidle.save";
const TICK_MS = 100;
const SAVE_EVERY_MS = 5000;
const OFFLINE_CAP_S = 8 * 3600;
const PRICE_GROWTH = 1.15;
const GRASS_BONUS = 0.1;
const GRASS_UNLOCK = 1e6;

// Habits: each produces `rate` aura per second, and costs 15% more for every one you own.
const HABITS = [
    {id: "stare", name: "Unbothered stare", flavor: "Look at nothing in particular.", cost: 15, rate: 0.1},
    {id: "shades", name: "Sunglasses indoors", flavor: "The lights are not the point.", cost: 100, rate: 1},
    {id: "walk", name: "Main character walk", flavor: "Slightly slower than everyone else.", cost: 1100, rate: 8},
    {id: "gym", name: "Silent gym grind", flavor: "No mirror selfies. Ever.", cost: 12000, rate: 47},
    {id: "captions", name: "Mysterious captions", flavor: "Just a full stop.", cost: 130000, rate: 260},
    {id: "read", name: "Leaving on read", flavor: "Replying when it suits you.", cost: 1.4e6, rate: 1400},
    {id: "monk", name: "Monk mode", flavor: "Gone for a month. Back glowing.", cost: 2e7, rate: 7800},
    {id: "ascended", name: "Ascended", flavor: "Aura generates aura.", cost: 3.3e8, rate: 44000},
];

// One-off upgrades. `tap` doubles tap power, `all` doubles all production, `echo` adds 1% of aura/s to every tap.
const UPGRADES = [
    {id: "posture", name: "Better posture", effect: "Taps ×2", kind: "tap", cost: 100},
    {id: "jawline", name: "Jawline training", effect: "Taps ×2", kind: "tap", cost: 5000},
    {id: "voice", name: "Deep voice", effect: "Taps also give 1% of aura/s", kind: "echo", cost: 50000},
    {id: "synergy", name: "Quiet confidence", effect: "All habits ×2", kind: "all", cost: 5e5},
    {id: "stoic", name: "Stoicism", effect: "Taps ×2", kind: "tap", cost: 5e6},
    {id: "presence", name: "Presence", effect: "All habits ×2", kind: "all", cost: 5e7},
    {id: "legend", name: "Lore", effect: "All habits ×2", kind: "all", cost: 5e9},
];

const SUFFIXES = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc"];

function format(n) {
    if (n < 1000) return n < 10 && n % 1 ? n.toFixed(1) : Math.floor(n).toLocaleString();
    const tier = Math.min(SUFFIXES.length - 1, Math.floor(Math.log10(n) / 3));
    const scaled = n / 1000 ** tier;
    return `${scaled.toFixed(scaled < 10 ? 2 : scaled < 100 ? 1 : 0)}${SUFFIXES[tier]}`;
}

function duration(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h ? `${h}h ${m}m` : m ? `${m}m` : `${Math.floor(seconds)}s`;
}

function freshSave(grass = 0, allTime = 0) {
    return {aura: 0, runTotal: 0, allTime, grass, owned: {}, upgrades: [], savedAt: Date.now()};
}

// Price of the next `count` of a habit when you already own `owned`.
function priceOf(habit, owned, count) {
    return habit.cost * PRICE_GROWTH ** owned * (PRICE_GROWTH ** count - 1) / (PRICE_GROWTH - 1);
}

// How many of a habit `aura` can buy right now (the inverse of priceOf).
function maxAffordable(habit, owned, aura) {
    const next = habit.cost * PRICE_GROWTH ** owned;
    const n = Math.max(0, Math.floor(Math.log(aura * (PRICE_GROWTH - 1) / next + 1) / Math.log(PRICE_GROWTH)));
    // Floating-point rounding can land one over; step back so the price never exceeds what you have.
    return n > 0 && priceOf(habit, owned, n) > aura ? n - 1 : n;
}

// How many a press buys: 1, 10, or as many as you can afford ("max", at least 1 so the price still shows).
function buyQuantity(buyCount, habit, owned, aura) {
    return buyCount === "max" ? Math.max(1, maxAffordable(habit, owned, aura)) : buyCount;
}

function grassMultiplier(s) {
    return 1 + GRASS_BONUS * s.grass;
}

// What one of a habit produces per second, after "all habits" upgrades and grass.
function habitRate(s, habit) {
    const doubles = UPGRADES.filter((u) => u.kind === "all" && s.upgrades.includes(u.id)).length;
    return habit.rate * 2 ** doubles * grassMultiplier(s);
}

function auraPerSecond(s) {
    return HABITS.reduce((sum, h) => sum + (s.owned[h.id] ?? 0) * habitRate(s, h), 0);
}

function tapPower(s) {
    const doubles = UPGRADES.filter((u) => u.kind === "tap" && s.upgrades.includes(u.id)).length;
    const echo = s.upgrades.includes("voice") ? 0.01 * auraPerSecond(s) : 0;
    return 2 ** doubles * grassMultiplier(s) + echo;
}

// Grass earned by touching grass now: grows with the cube root of this run's aura, so each one costs more.
function grassAvailable(s) {
    return s.runTotal < GRASS_UNLOCK ? 0 : Math.floor(Math.cbrt(s.runTotal / GRASS_UNLOCK));
}

export default function AuraIdle() {
    const game = useRef(freshSave());
    const [, setFrame] = useState(0);
    const [loaded, setLoaded] = useState(false);
    const [buyCount, setBuyCount] = useState(1);
    const [welcome, setWelcome] = useState(null);
    const [confirmGrass, setConfirmGrass] = useState(false);
    const [floaters, setFloaters] = useState([]);
    const floaterId = useRef(0);
    const redraw = () => setFrame((n) => n + 1);

    function save() {
        game.current.savedAt = Date.now();
        writeJSON(SAVE_KEY, game.current);
    }

    function earn(amount) {
        const s = game.current;
        s.aura += amount;
        s.runTotal += amount;
        s.allTime += amount;
    }

    // Load the save, then pay out what was farmed while away. Done in an effect so the server render and the
    // first client render agree.
    useEffect(() => {
        const saved = readJSON(SAVE_KEY);
        if (saved) {
            game.current = {...freshSave(), ...saved};
            const away = Math.min(OFFLINE_CAP_S, (Date.now() - (saved.savedAt ?? Date.now())) / 1000);
            const gained = auraPerSecond(game.current) * away;
            if (away > 60 && gained > 0) {
                earn(gained);
                setWelcome({gained, away});
            }
        }
        setLoaded(true);
    }, []);

    // Farm in real time, and save every few seconds and whenever the tab is hidden or the game is left.
    useEffect(() => {
        if (!loaded) return;
        let last = performance.now();
        const tick = setInterval(() => {
            const now = performance.now();
            earn(auraPerSecond(game.current) * (now - last) / 1000);
            last = now;
            redraw();
        }, TICK_MS);
        const saver = setInterval(save, SAVE_EVERY_MS);
        const onHide = () => document.hidden && save();
        document.addEventListener("visibilitychange", onHide);
        window.addEventListener("pagehide", save);
        return () => {
            clearInterval(tick);
            clearInterval(saver);
            document.removeEventListener("visibilitychange", onHide);
            window.removeEventListener("pagehide", save);
            save();
        };
    }, [loaded]);

    function tap(e) {
        const gain = tapPower(game.current);
        earn(gain);
        const box = e.currentTarget.getBoundingClientRect();
        const id = ++floaterId.current;
        const x = e.clientX ? e.clientX - box.left : box.width / 2;
        const y = e.clientY ? e.clientY - box.top : box.height / 2;
        setFloaters((f) => [...f.slice(-8), {id, x, y, text: `+${format(gain)}`}]);
        setTimeout(() => setFloaters((f) => f.filter((fl) => fl.id !== id)), 900);
        redraw();
    }

    function buyHabit(habit) {
        const s = game.current;
        const owned = s.owned[habit.id] ?? 0;
        const count = buyQuantity(buyCount, habit, owned, s.aura);
        const price = priceOf(habit, owned, count);
        if (s.aura < price) return;
        s.aura -= price;
        s.owned = {...s.owned, [habit.id]: owned + count};
        save();
        redraw();
    }

    function buyUpgrade(upgrade) {
        const s = game.current;
        if (s.aura < upgrade.cost || s.upgrades.includes(upgrade.id)) return;
        s.aura -= upgrade.cost;
        s.upgrades = [...s.upgrades, upgrade.id];
        save();
        redraw();
    }

    function touchGrass() {
        const s = game.current;
        const gained = grassAvailable(s);
        if (!gained) return;
        if (!confirmGrass) {
            setConfirmGrass(true);
            return;
        }
        game.current = freshSave(s.grass + gained, s.allTime);
        setConfirmGrass(false);
        save();
        redraw();
    }

    const s = game.current;
    const rate = auraPerSecond(s);
    const nextUpgrades = UPGRADES.filter((u) => !s.upgrades.includes(u.id)).slice(0, 3);
    const grass = grassAvailable(s);
    // Habits appear one at a time: everything you own, plus the next one once you're close to affording it.
    const visibleHabits = HABITS.filter((h, i) => i === 0 || (s.owned[h.id] ?? 0) > 0 ||
        (s.owned[HABITS[i - 1].id] ?? 0) > 0 || s.allTime >= h.cost * 0.5);

    return (
        <div className={style.game} style={{maxWidth: 520}}>
            {welcome ? (
                <p className={ai.welcome} role="status">
                    While you were away ({duration(welcome.away)}) you farmed <em>{format(welcome.gained)}</em> aura.
                    <button type="button" className={ai.dismiss} onClick={() => setWelcome(null)} aria-label="Dismiss">×</button>
                </p>
            ) : null}

            <div className={ai.total}>
                <strong>{format(s.aura)}</strong>
                <span>aura · {format(rate)} per second</span>
            </div>

            <button type="button" className={ai.orb} onClick={tap} aria-label={`Farm aura (+${format(tapPower(s))})`}>
                <span className={ai.orbCore} style={{"--glow": Math.min(1, 0.25 + Math.log10(1 + rate) / 8)}}/>
                {floaters.map((f) => (
                    <span key={f.id} className={ai.floater} style={{left: f.x, top: f.y}} aria-hidden="true">{f.text}</span>
                ))}
            </button>

            <Stats>
                <Stat value={`+${format(tapPower(s))}`} label="PER TAP"/>
                <Stat value={format(rate)} label="PER SECOND"/>
                <Stat value={s.grass} label="GRASS"/>
            </Stats>

            {nextUpgrades.length ? (
                <section className={ai.section} aria-label="Upgrades">
                    <h3 className={ai.heading}>Upgrades</h3>
                    <div className={ai.upgrades}>
                        {nextUpgrades.map((u) => (
                            <button key={u.id} type="button" className={ai.upgrade} disabled={s.aura < u.cost}
                                    onClick={() => buyUpgrade(u)}>
                                <span className={ai.upgradeName}>{u.name}</span>
                                <span className={ai.upgradeEffect}>{u.effect}</span>
                                <span className={ai.cost}>{format(u.cost)}</span>
                            </button>
                        ))}
                    </div>
                </section>
            ) : null}

            <section className={ai.section} aria-label="Habits">
                <div className={ai.headingRow}>
                    <h3 className={ai.heading}>Habits</h3>
                    <Toggle label="Buy amount" value={buyCount} onChange={setBuyCount}
                            options={[{value: 1, label: "×1"}, {value: 10, label: "×10"}, {value: "max", label: "Max"}]}/>
                </div>
                <ul className={ai.habits}>
                    {visibleHabits.map((h) => {
                        const owned = s.owned[h.id] ?? 0;
                        const count = buyQuantity(buyCount, h, owned, s.aura);
                        const price = priceOf(h, owned, count);
                        return (
                            <li key={h.id}>
                                <button type="button" className={ai.habit} disabled={s.aura < price} onClick={() => buyHabit(h)}>
                                    <span className={ai.habitText}>
                                        <span className={ai.habitName}>{h.name}</span>
                                        <span className={ai.habitFlavor}>{h.flavor} +{format(habitRate(s, h))}/s each</span>
                                    </span>
                                    <span className={ai.owned}>{owned}</span>
                                    <span className={ai.cost}>
                                        {/* On Max, say how many a press will buy. */}
                                        {buyCount === "max" && count > 1 ? <span className={ai.count}>×{count}</span> : null}
                                        {format(price)}
                                    </span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </section>

            <section className={cx(ai.section, ai.grass)} aria-label="Touch grass">
                <p>
                    <strong>Touch grass.</strong> Start over for grass: each one is +10% to everything, forever.
                    {s.runTotal < GRASS_UNLOCK ? ` Unlocks at ${format(GRASS_UNLOCK)} aura this run.` : null}
                </p>
                <GameButton active={confirmGrass} disabled={!grass} onClick={touchGrass}
                            onBlur={() => setConfirmGrass(false)}>
                    {confirmGrass ? `Sure? Reset for ${grass} grass` : `Touch grass (+${grass})`}
                </GameButton>
            </section>
        </div>
    );
}
