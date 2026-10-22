import {useEffect, useRef, useState} from "react";
import cx from "../../lib/cx";
import style from "./games.module.css";
import wm from "./whackAMole.module.css";

const HOLES = 9;
const ROUND_MS = 30000;
const BEST_KEY = "games.moles.best";

function readBest() {
    try {
        return Number(localStorage.getItem(BEST_KEY)) || 0;
    } catch {
        return 0;
    }
}

export default function WhackAMole() {
    const [running, setRunning] = useState(false);
    const [played, setPlayed] = useState(false);
    const [mole, setMole] = useState(null);
    const [whacked, setWhacked] = useState(null);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(ROUND_MS);
    const [best, setBest] = useState(0);
    const endAt = useRef(0);
    const moleRef = useRef(null);
    const scoreRef = useRef(0);
    const moleTimer = useRef(null);
    const whackTimer = useRef(null);
    const ticker = useRef(null);

    function stopTimers() {
        clearTimeout(moleTimer.current);
        clearTimeout(whackTimer.current);
        clearInterval(ticker.current);
    }

    useEffect(() => {
        setBest(readBest());
        return stopTimers;
    }, []);

    function showMole(index) {
        moleRef.current = index;
        setMole(index);
    }

    // Pops a mole up somewhere new. It stays up for less time as the round goes on.
    function spawn() {
        const left = endAt.current - performance.now();
        if (left <= 0) return;
        const progress = 1 - left / ROUND_MS;
        let index;
        do index = Math.floor(Math.random() * HOLES);
        while (index === moleRef.current);
        showMole(index);
        moleTimer.current = setTimeout(hide, 1000 - progress * 550);
    }

    function hide() {
        showMole(null);
        moleTimer.current = setTimeout(spawn, 150 + Math.random() * 350);
    }

    function finish() {
        stopTimers();
        showMole(null);
        setWhacked(null);
        setRunning(false);
        setTimeLeft(0);
        const final = scoreRef.current;
        if (final > readBest()) {
            setBest((b) => Math.max(b, final));
            try {
                localStorage.setItem(BEST_KEY, String(final));
            } catch {
                // Best score just won't persist.
            }
        }
    }

    function start() {
        stopTimers();
        scoreRef.current = 0;
        setScore(0);
        setWhacked(null);
        setRunning(true);
        setPlayed(true);
        setTimeLeft(ROUND_MS);
        endAt.current = performance.now() + ROUND_MS;
        ticker.current = setInterval(() => {
            const left = endAt.current - performance.now();
            if (left <= 0) finish();
            else setTimeLeft(left);
        }, 100);
        moleTimer.current = setTimeout(spawn, 500);
    }

    function hit(index) {
        if (!running || index !== moleRef.current) return;
        clearTimeout(moleTimer.current);
        clearTimeout(whackTimer.current);
        scoreRef.current += 1;
        setScore(scoreRef.current);
        setWhacked(index);
        whackTimer.current = setTimeout(() => setWhacked(null), 200);
        showMole(null);
        moleTimer.current = setTimeout(spawn, 200 + Math.random() * 250);
    }

    // Keys 1–9 hit the holes, left to right, top to bottom.
    useEffect(() => {
        function onKey(e) {
            if (e.ctrlKey || e.metaKey || e.altKey) return;
            if (e.target instanceof Element && e.target.closest("input, textarea")) return;
            if (/^[1-9]$/.test(e.key)) hit(Number(e.key) - 1);
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    });

    const seconds = Math.ceil(timeLeft / 1000);
    let status;
    if (running) status = "Whack the moles!";
    else if (played) status = <>Time's up: <em>{score}</em> {score === 1 ? "hit" : "hits"}</>;
    else status = "Hit as many as you can in 30s";

    return (
        <div className={style.game}>
            <p className={style.status} aria-live="polite">{status}</p>
            <div className={cx(wm.board, running && wm.running)}>
                {Array.from({length: HOLES}, (_, i) => (
                    <button key={i} type="button" aria-label={mole === i ? `Hole ${i + 1}, mole!` : `Hole ${i + 1}`}
                            className={cx(wm.hole, mole === i && wm.up, whacked === i && wm.whacked)}
                            onPointerDown={(e) => {
                                e.preventDefault();
                                hit(i);
                            }}
                            onKeyDown={(e) => (e.key === " " || e.key === "Enter") && (e.preventDefault(), hit(i))}>
                        <span className={wm.mole} aria-hidden="true"/>
                    </button>
                ))}
            </div>
            <div className={style.scores}>
                <span className={style.score}><strong>{score}</strong>SCORE</span>
                <span className={style.score}><strong>{seconds}</strong>SECONDS</span>
                <span className={style.score}><strong>{best || "–"}</strong>BEST</span>
            </div>
            <button type="button" className={style.button} onClick={start}>
                {running ? "Restart" : played ? "Play again" : "Start"}
            </button>
        </div>
    );
}
