import {useEffect, useRef, useState} from "react";
import cx from "../../lib/cx";
import style from "./games.module.css";

const ROUNDS = 5;

// idle → waiting (random delay) → go → result; clicking while waiting is "too soon".
export default function ReactionTime() {
    const [phase, setPhase] = useState("idle");
    const [times, setTimes] = useState([]);
    const goAt = useRef(0);
    const timer = useRef(null);

    useEffect(() => () => clearTimeout(timer.current), []);

    const done = times.length === ROUNDS;
    const last = times[times.length - 1];
    const average = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : null;
    const best = times.length ? Math.min(...times) : null;

    function start() {
        setPhase("waiting");
        timer.current = setTimeout(() => {
            goAt.current = performance.now();
            setPhase("go");
        }, 1500 + Math.random() * 2500);
    }

    function handlePress() {
        if (phase === "waiting") {
            clearTimeout(timer.current);
            setPhase("early");
        } else if (phase === "go") {
            setTimes([...times, Math.round(performance.now() - goAt.current)]);
            setPhase("result");
        } else if (done) {
            setTimes([]);
            start();
        } else {
            start();
        }
    }

    const pads = {
        idle: ["Click to start", `${ROUNDS} rounds. Wait for gold, then click as fast as you can.`],
        waiting: ["Wait for it…", "Don't click yet."],
        go: ["Click!", "Now!"],
        early: ["Too soon!", "Click to try that round again."],
        result: done
            ? [`${average} ms average`, "Click to play again."]
            : [`${last} ms`, `Round ${times.length} of ${ROUNDS}. Click to keep going.`],
    };
    const [heading, hint] = pads[phase];

    return (
        <div className={style.game}>
            <button type="button" onPointerDown={handlePress}
                    onKeyDown={(e) => (e.key === " " || e.key === "Enter") && (e.preventDefault(), handlePress())}
                    className={cx(style.reactionPad, phase === "waiting" && style.reactionWaiting,
                        phase === "go" && style.reactionGo, phase === "early" && style.reactionEarly)}>
                <strong aria-live="assertive">{heading}</strong>
                <span>{hint}</span>
            </button>
            <div className={style.scores}>
                <span className={style.score}><strong>{times.length}/{ROUNDS}</strong>ROUND</span>
                <span className={style.score}><strong>{best ?? "–"}</strong>BEST MS</span>
                <span className={style.score}><strong>{average ?? "–"}</strong>AVERAGE MS</span>
            </div>
        </div>
    );
}
