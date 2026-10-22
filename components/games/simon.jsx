import {useEffect, useRef, useState} from "react";
import cx from "../../lib/cx";
import {useHighScore} from "../../lib/highScores";
import {randomInt} from "../../lib/random";
import style from "./games.module.css";
import {GameButton, Stat, Stats, Status, Toggle} from "./kit";
import sm from "./simon.module.css";

const PADS = [
    {name: "Gold", tone: 329.63, className: sm.gold},
    {name: "Teal", tone: 261.63, className: sm.teal},
    {name: "Rose", tone: 220.0, className: sm.rose},
    {name: "Violet", tone: 164.81, className: sm.violet},
];
const BEST_KEY = "games.simon.best";
const SOUND_OPTIONS = [{value: true, label: "Sound"}, {value: false, label: "Mute"}];

// idle → showing (the game plays the sequence) → input (the player repeats it) → over.
export default function Simon() {
    const [sequence, setSequence] = useState([]);
    const [phase, setPhase] = useState("idle");
    const [step, setStep] = useState(0);
    const [lit, setLit] = useState(null);
    const [score, setScore] = useState(0);
    const [best, recordBest] = useHighScore(BEST_KEY);
    const [muted, setMuted] = useState(false);
    const timers = useRef(new Set());
    const audio = useRef(null);
    const mutedRef = useRef(false);

    useEffect(() => {
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
        const first = [randomInt(PADS.length)];
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
            recordBest(score);
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
        const next = [...sequence, randomInt(PADS.length)];
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
        <div className={style.game} style={{"--board-reserve": "450px"}}>
            <Toggle label="Sound" options={SOUND_OPTIONS} value={!muted} onChange={setSound}/>
            <Status>{status}</Status>
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
            <Stats>
                <Stat value={score} label="SCORE"/>
                <Stat value={best ?? "–"} label="BEST"/>
            </Stats>
            <GameButton onClick={start}>
                {phase === "idle" ? "Start" : phase === "over" ? "Play again" : "Restart"}
            </GameButton>
        </div>
    );
}
