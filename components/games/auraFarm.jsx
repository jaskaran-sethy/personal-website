import {useEffect, useRef, useState} from "react";
import cx from "../../lib/cx";
import {saveHighScore} from "../../lib/highScores";
import style from "./games.module.css";
import af from "./auraFarm.module.css";

// Aura Farm: aura comes from composure. Keep the pointer (or a held finger) perfectly still on the field and
// aura builds, with a multiplier that climbs the longer you hold. Tryhard temptations float by: clicking one
// costs aura, ignoring it earns some. Now and then a gold ring offers "the nod", a big payout at your current
// multiplier, but reaching it means moving, which cools your composure.

const ROUND_MS = 45000;
const TICK_MS = 100;
const STILL_AFTER_MS = 250;
const LEVEL_MS = 2000;
const MAX_MULT = 5;
const BEST_KEY = "games.aura.best";

const TEMPTATIONS = [
    ["Explain the joke", "you explained the joke"],
    ["Double text", "you double texted"],
    ["Ask if they saw your story", "you asked"],
    ["Laugh at your own joke", "you laughed first"],
    ["Say \"no offense\"", "offense was taken"],
    ["Check who viewed it", "you checked"],
    ["Announce you're leaving", "nobody asked"],
    ["Over-explain", "you over-explained"],
    ["Post a gym selfie", "you posted it"],
    ["Correct their grammar", "you corrected them"],
    ["Mention your 5am routine", "you mentioned it"],
    ["Reply in 4 seconds", "too eager"],
];

// A perfectly still round that takes every nod lands around 7,000, so Ascended is near-flawless play.
const RANKS = [
    [6000, "Ascended"],
    [4000, "Aura farmer"],
    [2000, "Main character"],
    [0, "NPC"],
    [-Infinity, "Negative aura"],
];

function rankFor(aura) {
    return RANKS.find(([min]) => aura >= min)[1];
}

const random = (min, max) => min + Math.random() * (max - min);

function freshRound(now) {
    return {
        startedAt: now, aura: 0, stillFor: 0, moved: 0, lastFidget: 0,
        temptations: [], moment: null, floaters: [],
        nextTempt: now + random(2500, 4000), nextMoment: now + random(6000, 9000), nextId: 1,
    };
}

export default function AuraFarm() {
    const [phase, setPhase] = useState("idle");
    const [, setFrame] = useState(0);
    const game = useRef(freshRound(0));
    // Where the pointer is (as a fraction of the field), when it last moved, and whether it's on the field.
    const pointer = useRef({x: 0.5, y: 0.5, lastMove: 0, inside: false});
    const field = useRef(null);

    useEffect(() => {
        if (phase !== "playing") return;
        const interval = setInterval(tick, TICK_MS);
        return () => clearInterval(interval);
    }, [phase]);

    function floater(g, text, good, x = pointer.current.x, y = pointer.current.y) {
        g.floaters.push({id: g.nextId++, text, good, x, y, until: performance.now() + 1100});
    }

    function tick() {
        const g = game.current;
        const p = pointer.current;
        const now = performance.now();

        if (now - g.startedAt >= ROUND_MS) {
            setPhase("done");
            // Negative aura is a result, not a high score.
            if (g.aura > 0) saveHighScore(BEST_KEY, Math.round(g.aura));
            return;
        }

        // Composure: still pointer on the field builds aura; moving or leaving cools it off gradually.
        const still = p.inside && now - p.lastMove > STILL_AFTER_MS;
        g.stillFor = still ? g.stillFor + TICK_MS : Math.max(0, g.stillFor - 4 * TICK_MS);
        const mult = Math.min(MAX_MULT, 1 + Math.floor(g.stillFor / LEVEL_MS));
        if (still) g.aura += mult;

        // Fidgeting: a lot of movement within one tick drains aura.
        if (g.moved > 180) {
            g.aura -= 6;
            if (now - g.lastFidget > 1200) {
                floater(g, "−fidgeting", false);
                g.lastFidget = now;
            }
        }
        g.moved = 0;

        // Temptations you outlast pay out.
        for (const t of g.temptations.filter((t) => now > t.until)) {
            g.aura += 50;
            floater(g, "+50 unbothered", true, t.x, t.y);
        }
        g.temptations = g.temptations.filter((t) => now <= t.until);
        if (now > g.nextTempt) {
            const [text, cost] = TEMPTATIONS[Math.floor(Math.random() * TEMPTATIONS.length)];
            g.temptations.push({id: g.nextId++, text, cost, x: random(0.22, 0.78), y: random(0.12, 0.88), until: now + 2600});
            g.nextTempt = now + random(3200, 5200);
        }

        if (g.moment && now > g.moment.until) g.moment = null;
        if (!g.moment && now > g.nextMoment) {
            g.moment = {id: g.nextId++, x: random(0.15, 0.85), y: random(0.15, 0.85), until: now + 1400};
            g.nextMoment = now + random(7000, 10000);
        }

        g.floaters = g.floaters.filter((f) => now < f.until);
        setFrame((n) => n + 1);
    }

    function start() {
        game.current = freshRound(performance.now());
        pointer.current.lastMove = performance.now();
        setPhase("playing");
    }

    function track(e) {
        const box = field.current.getBoundingClientRect();
        const x = (e.clientX - box.left) / box.width;
        const y = (e.clientY - box.top) / box.height;
        const p = pointer.current;
        const dist = Math.hypot((x - p.x) * box.width, (y - p.y) * box.height);
        // Tiny jitter (a resting hand, a finger on glass) doesn't count as moving.
        if (dist > 3) {
            p.lastMove = performance.now();
            game.current.moved += dist;
        }
        p.x = x;
        p.y = y;
    }

    // Mouse: being over the field counts. Touch and pen: only while pressed down on it.
    function onPointerMove(e) {
        if (e.pointerType === "mouse") pointer.current.inside = true;
        track(e);
    }

    function onPointerDown(e) {
        pointer.current.inside = true;
        track(e);
    }

    function onPointerUp(e) {
        if (e.pointerType !== "mouse") pointer.current.inside = false;
    }

    function onPointerLeave(e) {
        if (e.pointerType === "mouse") pointer.current.inside = false;
    }

    function takeTemptation(e, t) {
        e.stopPropagation();
        const g = game.current;
        g.aura -= 150;
        g.temptations = g.temptations.filter((other) => other !== t);
        floater(g, `−150 ${t.cost}`, false, t.x, t.y);
        setFrame((n) => n + 1);
    }

    function takeMoment(e) {
        e.stopPropagation();
        const g = game.current;
        const mult = Math.min(MAX_MULT, 1 + Math.floor(g.stillFor / LEVEL_MS));
        const gain = 200 * mult;
        g.aura += gain;
        floater(g, `+${gain} the nod`, true, g.moment.x, g.moment.y);
        g.moment = null;
        setFrame((n) => n + 1);
    }

    const g = game.current;
    const p = pointer.current;
    const playing = phase === "playing";
    const now = playing ? performance.now() : g.startedAt;
    const mult = Math.min(MAX_MULT, 1 + Math.floor(g.stillFor / LEVEL_MS));
    const still = playing && p.inside && now - p.lastMove > STILL_AFTER_MS;
    const aura = Math.round(g.aura);
    const seconds = playing ? Math.max(0, Math.ceil((ROUND_MS - (now - g.startedAt)) / 1000)) : phase === "done" ? 0 : 45;

    let status;
    if (phase === "idle") status = "Hold still to farm aura";
    else if (phase === "done") status = <>{rankFor(aura)}: <em>{aura.toLocaleString()}</em> aura</>;
    else if (!p.inside) status = "Rest on the field…";
    else if (still && mult > 1) status = <>Composure <em>×{mult}</em></>;
    else if (still) status = "Stay still…";
    else status = "Too much movement";

    return (
        <div className={style.game}>
            <p className={style.status} aria-live="polite">{status}</p>
            <div ref={field} className={cx(af.field, playing && af.live)}
                 style={{"--glow": playing && p.inside ? (still ? mult / MAX_MULT : 0.12) : 0, "--x": p.x, "--y": p.y}}
                 onPointerMove={playing ? onPointerMove : undefined} onPointerDown={playing ? onPointerDown : undefined}
                 onPointerUp={onPointerUp} onPointerCancel={onPointerUp} onPointerLeave={onPointerLeave}
                 role="group" aria-label="Aura field">
                <span className={af.aura} aria-hidden="true"/>
                {g.temptations.map((t) => (
                    <button key={t.id} type="button" className={af.temptation} style={{left: `${t.x * 100}%`, top: `${t.y * 100}%`}}
                            onPointerDown={(e) => takeTemptation(e, t)}>
                        {t.text}
                    </button>
                ))}
                {g.moment ? (
                    <button key={g.moment.id} type="button" className={af.moment} aria-label="The nod"
                            style={{left: `${g.moment.x * 100}%`, top: `${g.moment.y * 100}%`}} onPointerDown={takeMoment}/>
                ) : null}
                {g.floaters.map((f) => (
                    <span key={f.id} className={cx(af.floater, f.good ? af.good : af.bad)} aria-hidden="true"
                          style={{left: `${f.x * 100}%`, top: `${f.y * 100}%`}}>
                        {f.text}
                    </span>
                ))}
                {!playing ? (
                    <div className={af.overlay}>
                        {phase === "done" ? (
                            <p className={af.rank}>{rankFor(aura)}</p>
                        ) : (
                            <p className={af.rules}>
                                Keep still on the field to build aura.<br/>
                                Ignore the temptations. Catch the gold ring for a nod.
                            </p>
                        )}
                        <button type="button" className={cx(style.button, style.buttonActive)} onClick={start}>
                            {phase === "done" ? "Farm again" : "Start farming"}
                        </button>
                    </div>
                ) : null}
            </div>
            <div className={style.scores}>
                <span className={style.score}><strong>{aura.toLocaleString()}</strong>AURA</span>
                <span className={style.score}><strong>×{playing ? mult : 1}</strong>COMPOSURE</span>
                <span className={style.score}><strong>{seconds}</strong>SECONDS</span>
            </div>
        </div>
    );
}
