import {useEffect, useRef, useState} from "react";
import cx from "../../lib/cx";
import style from "./games.module.css";
import sm from "./simon.module.css";

const PADS = [
    {name: "Gold", tone: 329.63, className: sm.gold},
    {name: "Teal", tone: 261.63, className: sm.teal},
    {name: "Rose", tone: 220.0, className: sm.rose},
    {name: "Violet", tone: 164.81, className: sm.violet},
];
const BEST_KEY = "games.simon.best";

function readBest() {
    try {
        return Number(localStorage.getItem(BEST_KEY)) || 0;
    } catch {
        return 0;
    }
}

// idle → showing (the game plays the sequence) → input (the player repeats it) → over.
export default function Simon() {
    const [sequence, setSequence] = useState([]);
    const [phase, setPhase] = useState("idle");
    const [step, setStep] = useState(0);
    const [lit, setLit] = useState(null);
    const [score, setScore] = useState(0);
    const [best, setBest] = useState(0);
    const [muted, setMuted] = useState(false);
    const timers = useRef(new Set());
    const audio = useRef(null);
    const mutedRef = useRef(false);

    useEffect(() => {
        setBest(readBest());
        return () => {
            timers.current.forEach(clearTimeout);
            audio.current?.close()?.catch?.(() => {});
        };
    }, []);

    function later(fn, ms) {
        const id = setTimeout(() => {
            timers.current.delete(id);
            fn();
        }, ms);
        timers.current.add(id);
    }

    function clearTimers() {
        timers.current.forEach(clearTimeout);
        timers.current.clear();
    }

    // Created on the first click, since browsers only allow audio after a user gesture.
    function ensureAudio() {
        if (audio.current) return audio.current;
        const Context = typeof window !== "undefined" && (window.AudioContext || window.webkitAudioContext);
        if (!Context) return null;
        try {
            audio.current = new Context();
        } catch {
            return null;
        }
        return audio.current;
    }

    function beep(frequency, ms, type = "sine") {
        const ctx = audio.current;
        if (!ctx || mutedRef.current) return;
        if (ctx.state === "suspended") ctx.resume().catch(() => {});
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const now = ctx.currentTime;
        osc.type = type;
        osc.frequency.value = frequency;
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.2, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + ms / 1000);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + ms / 1000 + 0.05);
    }

    function flash(pad, ms) {
        setLit(pad);
        beep(PADS[pad].tone, ms);
        later(() => setLit(null), ms);
    }

    // Plays the sequence back, a little faster as it grows.
    function playSequence(seq) {
        setPhase("showing");
        setStep(0);
        const on = Math.max(250, 520 - seq.length * 18);
        const gap = Math.max(90, 200 - seq.length * 6);
        seq.forEach((pad, i) => later(() => flash(pad, on), 600 + i * (on + gap)));
        later(() => setPhase("input"), 600 + seq.length * (on + gap));
    }

    function start() {
        ensureAudio();
        clearTimers();
        setLit(null);
        setScore(0);
        const first = [Math.floor(Math.random() * PADS.length)];
        setSequence(first);
        playSequence(first);
    }

    function press(pad) {
        ensureAudio();
        if (phase !== "input") return;
        if (pad !== sequence[step]) {
            setLit(pad);
            beep(110, 500, "square");
            later(() => setLit(null), 300);
            setPhase("over");
            if (score > best) {
                setBest(score);
                try {
                    localStorage.setItem(BEST_KEY, String(score));
                } catch {
                    // Best score just won't persist.
                }
            }
            return;
        }
        flash(pad, 220);
        if (step + 1 < sequence.length) {
            setStep(step + 1);
            return;
        }
        // Round complete: add a pad and play it all again.
        setScore(sequence.length);
        setPhase("showing");
        const next = [...sequence, Math.floor(Math.random() * PADS.length)];
        setSequence(next);
        later(() => playSequence(next), 500);
    }

    function setSound(on) {
        ensureAudio();
        mutedRef.current = !on;
        setMuted(!on);
    }

    let status;
    if (phase === "idle") status = "Watch, then repeat";
    else if (phase === "showing") status = "Watch…";
    else if (phase === "input") status = <>Your turn: <em>{step + 1}</em> of {sequence.length}</>;
    else status = <>Game over after <em>{score}</em> {score === 1 ? "round" : "rounds"}</>;

    return (
        <div className={style.game}>
            <div className={style.toggle} role="group" aria-label="Sound">
                <button type="button" aria-pressed={!muted} className={cx(style.toggleOption, !muted && style.toggleActive)}
                        onClick={() => setSound(true)}>Sound</button>
                <button type="button" aria-pressed={muted} className={cx(style.toggleOption, muted && style.toggleActive)}
                        onClick={() => setSound(false)}>Mute</button>
            </div>
            <p className={style.status} aria-live="polite">{status}</p>
            <div className={cx(sm.board, phase === "input" && sm.playable)}>
                {PADS.map((pad, i) => (
                    <button key={pad.name} type="button" aria-label={`${pad.name} pad`}
                            className={cx(sm.pad, pad.className, lit === i && sm.lit)}
                            disabled={phase !== "input"}
                            onPointerDown={(e) => {
                                e.preventDefault();
                                press(i);
                            }}
                            onKeyDown={(e) => (e.key === " " || e.key === "Enter") && (e.preventDefault(), press(i))}/>
                ))}
            </div>
            <div className={style.scores}>
                <span className={style.score}><strong>{score}</strong>SCORE</span>
                <span className={style.score}><strong>{best || "–"}</strong>BEST</span>
            </div>
            <button type="button" className={style.button} onClick={start}>
                {phase === "idle" ? "Start" : phase === "over" ? "Play again" : "Restart"}
            </button>
        </div>
    );
}
