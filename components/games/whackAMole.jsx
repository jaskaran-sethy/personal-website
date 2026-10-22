import {useEffect, useRef, useState} from "react";
import cx from "../../lib/cx";
import {useHighScore} from "../../lib/highScores";
import {randomBetween, randomInt} from "../../lib/random";
import style from "./games.module.css";
import {useGameKeys} from "./hooks";
import {GameButton, Stat, Stats, Status} from "./kit";
import wm from "./whackAMole.module.css";

const HOLES = 9;
const ROUND_MS = 30000;
const BEST_KEY = "games.moles.best";

export default function WhackAMole() {
    const [running, setRunning] = useState(false);
    const [played, setPlayed] = useState(false);
    const [mole, setMole] = useState(null);
    const [whacked, setWhacked] = useState(null);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(ROUND_MS);
    const [best, recordBest] = useHighScore(BEST_KEY);
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

    useEffect(() => stopTimers, []);

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
        do index = randomInt(HOLES);
        while (index === moleRef.current);
        showMole(index);
        moleTimer.current = setTimeout(hide, 1000 - progress * 550);
    }

    function hide() {
        showMole(null);
        moleTimer.current = setTimeout(spawn, randomBetween(150, 500));
    }

    function finish() {
        stopTimers();
        showMole(null);
        setWhacked(null);
        setRunning(false);
        setTimeLeft(0);
        recordBest(scoreRef.current);
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
        moleTimer.current = setTimeout(spawn, randomBetween(200, 450));
    }

    // Keys 1–9 hit the holes, left to right, top to bottom.
    useGameKeys((key) => {
        if (/^[1-9]$/.test(key)) hit(Number(key) - 1);
    });

    const seconds = Math.ceil(timeLeft / 1000);
    let status;
    if (running) status = "Whack the moles!";
    else if (played) status = <>Time's up: <em>{score}</em> {score === 1 ? "hit" : "hits"}</>;
    else status = "Hit as many as you can in 30s";

    return (
        <div className={style.game}>
            <Status>{status}</Status>
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
            <Stats>
                <Stat value={score} label="SCORE"/>
                <Stat value={seconds} label="SECONDS"/>
                <Stat value={best ?? "–"} label="BEST"/>
            </Stats>
            <GameButton onClick={start}>
                {running ? "Restart" : played ? "Play again" : "Start"}
            </GameButton>
        </div>
    );
}
