import {useEffect, useRef, useState} from "react";
import cx from "../../lib/cx";
import {saveHighScore} from "../../lib/highScores";
import {randomBetween, shuffle} from "../../lib/random";
import style from "./games.module.css";
import {GameButton, Stat, Stats, Status} from "./kit";
import af from "./auraFarm.module.css";

// Aura Farm: aura only comes from composure. Keep the pointer (or a held finger) perfectly still on the field
// and aura builds at your composure multiplier. Every few seconds life hands you a moment: the main clock
// freezes and you get a shrinking few seconds to choose. A good call doubles the multiplier; a bad call (or
// freezing up) resets it to ×1. Some cards are bait (the loud option is the trap), others are judgment calls
// where the bold move is the aura move. Hot pockets of aura double your gain while you rest inside them, and
// catching the gold ring ("the nod") doubles the multiplier too. Reaching either means moving, which pauses
// your gains.

const ROUND_MS = 45000;
const TICK_MS = 100;
const STILL_AFTER_MS = 250;
// Resting inside a hot pocket multiplies gains by this, on top of composure.
const POCKET_BONUS = 2;
const POCKET_RADIUS = 0.14;
// Decisions are on a clock of their own while the main one is frozen, and each one gives you less time:
// 5s, then 15% less every card, down to 1.5s.
const FIRST_DECISION_MS = 5000;
const DECISION_SPEEDUP = 0.85;
const FASTEST_DECISION_MS = 1500;
const BEST_KEY = "games.aura.best";

// Each decision is a little app card with two choices. `bait` marks the option dressed up to be clicked
// (it pulses gold) and it's always the losing one; cards without bait show two identical buttons, in random
// order, so you have to actually judge. `typo` gets a red spell-check squiggle. `why` is the floater text.
const DECISIONS = [
    {app: "MESSAGE", text: "your so right lol", typo: "your", bait: 0, options: [
        {label: "Fix it: you're", aura: -1, why: "you corrected them"},
        {label: "Let it slide", aura: 1, why: "unbothered"}]},
    {app: "MESSAGE", text: "its giving main character", typo: "its", bait: 0, options: [
        {label: "Fix it: it's", aura: -1, why: "grammar police"},
        {label: "Heart it", aura: 1, why: "gracious"}]},
    {app: "MESSAGE", text: "could of been worse tbh", typo: "could of", bait: 0, options: [
        {label: "Fix it: could have", aura: -1, why: "you corrected them"},
        {label: "Reply \"fr\"", aura: 1, why: "unbothered"}]},
    {app: "GROUP CHAT", text: "me and him went their yesterday", typo: "their", bait: 0, options: [
        {label: "Fix it: there", aura: -1, why: "nobody asked"},
        {label: "Leave it", aura: 1, why: "unbothered"}]},
    {app: "STORY", text: "Your ex viewed your story", bait: 0, options: [
        {label: "See who else did", aura: -1, why: "you checked"},
        {label: "Close the app", aura: 1, why: "didn't even look"}]},
    {app: "CHAT", text: "Delivered · 2h ago", bait: 0, options: [
        {label: "Double text", aura: -1, why: "you double texted"},
        {label: "Wait", aura: 1, why: "patience"}]},
    {app: "CHAT", text: "them: \"wait what do you mean\"", bait: 0, options: [
        {label: "Explain the joke", aura: -1, why: "you explained the joke"},
        {label: "\"never mind\"", aura: 1, why: "mysterious"}]},
    {app: "OFFER", text: "Free aura. Ends in 3s.", bait: 0, options: [
        {label: "Claim now", aura: -1, why: "aura can't be claimed"},
        {label: "Ignore", aura: 1, why: "unbothered"}]},
    {app: "MEETING", text: "\"Any questions before we wrap?\"", bait: 0, options: [
        {label: "Mention your 5am routine", aura: -1, why: "you mentioned it"},
        {label: "Let everyone go", aura: 1, why: "read the room"}]},
    // Judgment calls: no bait styling, and the bolder option is usually the aura move.
    {app: "STREET", text: "You tripped in front of everyone", options: [
        {label: "Laugh it off", aura: 1, why: "owning it"},
        {label: "Act like it didn't happen", aura: -1, why: "everyone saw"}]},
    {app: "RESTAURANT", text: "They brought you the wrong order", options: [
        {label: "Politely send it back", aura: 1, why: "calm and clear"},
        {label: "Eat it anyway", aura: -1, why: "pushover"}]},
    {app: "CHAT", text: "Your crush: \"hey\"", options: [
        {label: "Reply \"hey!\"", aura: 1, why: "just be normal"},
        {label: "Leave them on read", aura: -1, why: "fake cool"}]},
    {app: "CONVERSATION", text: "They used a word you don't know", options: [
        {label: "Ask what it means", aura: 1, why: "secure"},
        {label: "Nod along", aura: -1, why: "you nodded along"}]},
    {app: "PARTY", text: "Your favourite song comes on", options: [
        {label: "Dance", aura: 1, why: "main character"},
        {label: "Stay still, look cool", aura: -1, why: "trying hard to not try"}]},
    {app: "WORK", text: "Someone pitched your idea as theirs", options: [
        {label: "\"Glad you liked my idea\"", aura: 1, why: "calm and clear"},
        {label: "Let it go", aura: -1, why: "pushover"}]},
    {app: "PHOTO", text: "You blinked in the group photo", options: [
        {label: "Post it anyway", aura: 1, why: "unbothered"},
        {label: "Ask for a retake", aura: -1, why: "vanity"}]},
    {app: "GYM", text: "Someone's waiting for your machine", options: [
        {label: "Offer to share sets", aura: 1, why: "generous"},
        {label: "Put headphones in", aura: -1, why: "awkward"}]},
    {app: "CLASS", text: "The teacher asks a question you can answer", options: [
        {label: "Answer it", aura: 1, why: "quietly sharp"},
        {label: "Stay quiet to seem chill", aura: -1, why: "fake cool"}]},
];

// Doubling multipliers make scores grow exponentially: a flawless round (every call right, every nod caught,
// every hot pocket used) lands around 300,000, while one bad call late in a round can cost most of that.
const RANKS = [
    [100000, "Ascended"],
    [25000, "Aura farmer"],
    [5000, "Main character"],
    [0, "NPC"],
    [-Infinity, "Negative aura"],
];
// The meter is logarithmic up to a little past a flawless round, so each rank gets a fair share of its height.
const METER_MAX = 400000;
const meterAt = (aura) => Math.max(0, Math.min(1, Math.log10(1 + Math.max(0, aura)) / Math.log10(1 + METER_MAX)));

function rankFor(aura) {
    return RANKS.find(([min]) => aura >= min)[1];
}

// 0 = Negative aura … 4 = Ascended, for the avatar.
function levelFor(aura) {
    return RANKS.length - 1 - RANKS.findIndex(([min]) => aura >= min);
}

function inPocket(pocket, p) {
    return Boolean(pocket) && Math.hypot(p.x - pocket.x, p.y - pocket.y) < POCKET_RADIUS;
}

// `clock` is active play time: it stops while a decision is on screen, and the timer, nods and the next
// decision all run off it. Floaters and avatar reactions use real time, so they still animate during a freeze.
function freshRound() {
    return {
        clock: 0, aura: 0, mult: 1, moved: 0, lastFidget: 0, pocket: null, nextPocket: randomBetween(5000, 8000),
        decision: null, decisionsSeen: 0, moment: null, floaters: [], reaction: null, deck: [],
        nextDecision: randomBetween(3000, 4500), nextMoment: randomBetween(6000, 9000), nextId: 1,
    };
}

// Deals decisions without repeats until the deck runs out, then reshuffles.
function draw(g) {
    if (!g.deck.length) g.deck = shuffle(DECISIONS);
    const card = g.deck.pop();
    const order = card.bait === undefined && Math.random() < 0.5 ? [1, 0] : [0, 1];
    const limit = Math.max(FASTEST_DECISION_MS, FIRST_DECISION_MS * DECISION_SPEEDUP ** g.decisionsSeen++);
    return {...card, id: g.nextId++, order, limit, deadline: performance.now() + limit};
}

export default function AuraFarm() {
    const [phase, setPhase] = useState("idle");
    const [, setFrame] = useState(0);
    const game = useRef(freshRound());
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
        g.floaters = g.floaters.filter((f) => now < f.until);

        // The main clock is frozen while a decision is up: nothing builds, decays or counts down, except the
        // decision's own timer. Letting it run out costs aura: hesitating isn't aura either.
        if (g.decision) {
            g.moved = 0;
            if (now > g.decision.deadline) resolve(g, false, "froze up");
            setFrame((n) => n + 1);
            return;
        }

        g.clock += TICK_MS;
        if (g.clock >= ROUND_MS) {
            setPhase("done");
            // Negative aura is a result, not a high score.
            if (g.aura > 0) saveHighScore(BEST_KEY, Math.round(g.aura));
            return;
        }

        // The only source of aura: resting still on the field, at the composure multiplier (doubled in a hot pocket).
        const still = p.inside && now - p.lastMove > STILL_AFTER_MS;
        if (still) g.aura += g.mult * (inPocket(g.pocket, p) ? POCKET_BONUS : 1);

        if (g.pocket && g.clock > g.pocket.until) g.pocket = null;
        if (!g.pocket && g.clock > g.nextPocket) {
            g.pocket = {id: g.nextId++, x: randomBetween(0.2, 0.8), y: randomBetween(0.2, 0.8), until: g.clock + 6000};
            g.nextPocket = g.clock + randomBetween(9000, 13000);
        }

        // Fidgeting: a lot of movement within one tick drains aura.
        if (g.moved > 180) {
            g.aura -= 6;
            if (now - g.lastFidget > 1200) {
                floater(g, "−fidgeting", false);
                g.lastFidget = now;
            }
        }
        g.moved = 0;

        if (g.moment && g.clock > g.moment.until) g.moment = null;
        if (!g.moment && g.clock > g.nextMoment) {
            g.moment = {id: g.nextId++, x: randomBetween(0.15, 0.85), y: randomBetween(0.15, 0.85), until: g.clock + 1400};
            g.nextMoment = g.clock + randomBetween(7000, 10000);
        }

        if (g.clock > g.nextDecision && !g.moment) {
            g.decision = draw(g);
            g.nextDecision = g.clock + randomBetween(4500, 6500);
        }

        setFrame((n) => n + 1);
    }

    function start() {
        game.current = freshRound();
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

    // Applies a decision's outcome and unfreezes time: a good call doubles the multiplier, a bad one resets it.
    function resolve(g, good, why) {
        g.mult = good ? g.mult * 2 : 1;
        g.reaction = {type: good ? "nod" : "cringe", until: performance.now() + (good ? 700 : 900)};
        floater(g, `${good ? "×" + g.mult : "back to ×1"} · ${why}`, good, 0.5, 0.5);
        g.decision = null;
        // Moving to the button counted as movement; give the hand a moment to settle before composure resumes.
        pointer.current.lastMove = performance.now();
    }

    function choose(e, option) {
        e.stopPropagation();
        const g = game.current;
        if (!g.decision) return;
        resolve(g, option.aura > 0, option.why);
        setFrame((n) => n + 1);
    }

    function takeMoment(e) {
        e.stopPropagation();
        const g = game.current;
        g.mult *= 2;
        floater(g, `×${g.mult} · the nod`, true, g.moment.x, g.moment.y);
        g.moment = null;
        g.reaction = {type: "nod", until: performance.now() + 700};
        setFrame((n) => n + 1);
    }

    const g = game.current;
    const p = pointer.current;
    const playing = phase === "playing";
    const frozen = playing && Boolean(g.decision);
    const mult = g.mult;
    const pocketed = playing && inPocket(g.pocket, p);
    const still = playing && !frozen && p.inside && performance.now() - p.lastMove > STILL_AFTER_MS;
    const aura = Math.round(g.aura);
    const seconds = phase === "idle" ? 45 : Math.max(0, Math.ceil((ROUND_MS - g.clock) / 1000));
    const level = levelFor(aura);
    const reaction = g.reaction && performance.now() < g.reaction.until ? g.reaction.type : null;

    let status;
    if (phase === "idle") status = "Hold still to farm aura";
    else if (phase === "done") status = <>{rankFor(aura)}: <em>{aura.toLocaleString()}</em> aura</>;
    else if (frozen) status = <>Time <em>frozen</em>. Your call.</>;
    else if (!p.inside) status = "Rest on the field…";
    else if (still && pocketed) status = <>Hot pocket <em>×{POCKET_BONUS}</em> · composure <em>×{mult}</em></>;
    else if (still && mult > 1) status = <>Composure <em>×{mult}</em></>;
    else if (still) status = "Stay still…";
    else status = "Too much movement";

    const d = g.decision;
    return (
        // Wider than the other games: the field plus a side column for the avatar and meter.
        <div className={style.game} style={{maxWidth: 520}}>
            <Status>{status}</Status>
            <div className={af.arena}>
            <div ref={field} className={cx(af.field, playing && af.live, frozen && af.frozen)}
                 style={{"--glow": playing && p.inside ? (still ? Math.min(1, 0.25 + Math.log2(mult) / 6) : 0.12) : 0,
                     "--x": p.x, "--y": p.y}}
                 onPointerMove={playing ? onPointerMove : undefined} onPointerDown={playing ? onPointerDown : undefined}
                 onPointerUp={onPointerUp} onPointerCancel={onPointerUp} onPointerLeave={onPointerLeave}
                 role="group" aria-label="Aura field">
                {g.pocket ? (
                    <span key={g.pocket.id} className={cx(af.pocket, pocketed && af.pocketActive)} aria-hidden="true"
                          style={{left: `${g.pocket.x * 100}%`, top: `${g.pocket.y * 100}%`, width: `${POCKET_RADIUS * 200}%`}}>
                        <span className={af.pocketLabel}>×{POCKET_BONUS}</span>
                    </span>
                ) : null}
                <span className={af.aura} aria-hidden="true"/>
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
                                Keep still on the field to farm aura.<br/>
                                Good calls double your multiplier; bad ones reset it.<br/>
                                Rest in hot pockets for ×2. Catch the gold ring for a nod.
                            </p>
                        )}
                        <GameButton active onClick={start}>
                            {phase === "done" ? "Farm again" : "Start farming"}
                        </GameButton>
                    </div>
                ) : null}
            </div>
            <div className={af.side}>
                <Avatar level={level} reaction={reaction}/>
                <span className={af.rankLabel}>{rankFor(aura)}</span>
                <AuraMeter aura={aura}/>
            </div>
            {/* Over the whole arena (field and side column), so the card has room on phones. */}
            {d ? (
                <div className={af.freeze}>
                    <div key={d.id} className={af.bait} role="dialog" aria-label={`${d.app}: ${d.text}`}>
                        <span className={af.baitApp}><span className={af.dot}/>{d.app}</span>
                        {/* The decision's own countdown: a bar that drains over its time limit. */}
                        <span className={af.countdown} style={{"--limit": `${d.limit}ms`}} aria-hidden="true"/>
                        <span className={af.baitText}><BaitText text={d.text} typo={d.typo}/></span>
                        <div className={af.choices}>
                            {d.order.map((i) => (
                                <button key={i} type="button" className={cx(af.choice, d.bait === i && af.lure)}
                                        onClick={(e) => choose(e, d.options[i])}>
                                    {d.options[i].label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            ) : null}
            </div>
            <Stats>
                <Stat value={aura.toLocaleString()} label="AURA"/>
                <Stat value={`×${playing ? mult : 1}`} label="COMPOSURE"/>
                <Stat value={`×${pocketed ? POCKET_BONUS : 1}`} label="POCKET"/>
                <Stat value={seconds} label="SECONDS"/>
            </Stats>
        </div>
    );
}

// The message text, with the typo (if any) given a red spell-check squiggle.
function BaitText({text, typo}) {
    if (!typo) return text;
    const at = text.indexOf(typo);
    return <>{text.slice(0, at)}<span className={af.typo}>{typo}</span>{text.slice(at + typo.length)}</>;
}

// A vertical, logarithmic meter from 0 to METER_MAX, with a tick at each rank. Negative aura empties it and
// turns the frame red.
function AuraMeter({aura}) {
    const fill = meterAt(aura);
    return (
        <div className={cx(af.meter, aura < 0 && af.meterNegative)} role="meter" aria-label="Aura"
             aria-valuemin={0} aria-valuemax={METER_MAX} aria-valuenow={Math.max(0, aura)}>
            <span className={af.meterFill} style={{height: `${fill * 100}%`}}/>
            {RANKS.slice(0, 3).map(([min, name]) => (
                <span key={name} className={cx(af.tick, aura >= min && af.tickReached)}
                      style={{bottom: `${meterAt(min) * 100}%`}} title={name}/>
            ))}
        </div>
    );
}

const HEAD = ["#5E5E68", "#8A8A93", "#E2CFA0", "#E9D6A6", "#F1DFB0"];
const MOUTHS = ["M25 51q7-5 14 0", "M26 49h12", "M25 47q7 5 14 0", "M27 48q8 3 12-2", "M25 47q8 5 15-2"];

// The farmer. Five looks, one per rank: slumped and sweating, blank NPC, warm smile, sunglasses, then
// sunglasses with a halo and sparkles. Briefly cringes when you take the bait and nods when you catch a nod.
function Avatar({level, reaction}) {
    const cringe = reaction === "cringe";
    const shades = level >= 3 && !cringe;
    return (
        <svg viewBox="0 0 64 72" className={cx(af.avatar, reaction === "nod" && af.nodding)} aria-hidden="true">
            <defs>
                <radialGradient id="aura-glow">
                    <stop offset="0%" stopColor="#F1D98B" stopOpacity="0.9"/>
                    <stop offset="100%" stopColor="#D4AF37" stopOpacity="0"/>
                </radialGradient>
            </defs>
            {level >= 2 ? <circle cx="32" cy="40" r={18 + level * 3} fill="url(#aura-glow)" opacity={level * 0.2}/> : null}
            {level === 4 ? <ellipse cx="32" cy="14" rx="13" ry="3.5" fill="none" stroke="#F1D98B" strokeWidth="2.5" className={af.halo}/> : null}
            <g className={af.head}>
                <circle cx="32" cy="40" r="19" fill={HEAD[level]} stroke={level >= 2 ? "#D4AF37" : "none"} strokeWidth="1.5"/>
                {cringe ? (
                    <path d="M21 35l5 3-5 3M43 35l-5 3 5 3" stroke="#1C1606" strokeWidth="2" fill="none" strokeLinecap="round"/>
                ) : shades ? (
                    <path d="M18 34h28v3c0 4-3 6-6.5 6s-6-2-6.5-5h-2c-.5 3-3 5-6.5 5S18 41 18 37z" fill="#111114"/>
                ) : level === 0 ? (
                    <path d="M22 37l6 1.5M42 37l-6 1.5" stroke="#26262C" strokeWidth="2" strokeLinecap="round"/>
                ) : (
                    <>
                        <circle cx="25" cy="37" r="2.2" fill="#1C1606"/>
                        <circle cx="39" cy="37" r="2.2" fill="#1C1606"/>
                    </>
                )}
                <path d={cringe ? "M24 50q2-2 4 0t4 0 4 0 4 0" : MOUTHS[level]}
                      stroke="#1C1606" strokeWidth="2" fill="none" strokeLinecap="round"/>
                {level === 0 ? <path d="M50 28q3 5 0 7q-3-2 0-7z" fill="#8CB4E8"/> : null}
            </g>
            {level === 4 ? (
                <g fill="#F1D98B" className={af.sparkles}>
                    <path d="M8 24l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5z"/>
                    <path d="M56 50l1 3 3 1-3 1-1 3-1-3-3-1 3-1z"/>
                    <path d="M54 18l1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z"/>
                </g>
            ) : null}
        </svg>
    );
}
