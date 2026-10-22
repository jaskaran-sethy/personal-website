import {useEffect, useRef, useState} from "react";
import cx from "../../lib/cx";
import style from "./games.module.css";
import own from "./snake.module.css";

const SIZE = 16;
const BEST_KEY = "games.snake.best";
const DIRS = {up: {x: 0, y: -1}, down: {x: 0, y: 1}, left: {x: -1, y: 0}, right: {x: 1, y: 0}};
const KEYS = {
    ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
    w: "up", s: "down", a: "left", d: "right",
};
// Fixed start (food included) so the server render and first client render agree.
const START = {snake: [{x: 6, y: 8}, {x: 5, y: 8}, {x: 4, y: 8}], dir: "right", food: {x: 11, y: 8}, score: 0};

function readBest() {
    try {
        return Number(localStorage.getItem(BEST_KEY)) || null;
    } catch {
        return null;
    }
}

function isTyping(target) {
    return target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable;
}

// A random free square, or null when the snake fills the board.
function placeFood(snake) {
    const taken = new Set(snake.map((p) => p.y * SIZE + p.x));
    const free = [];
    for (let i = 0; i < SIZE * SIZE; i++) if (!taken.has(i)) free.push(i);
    if (!free.length) return null;
    const i = free[Math.floor(Math.random() * free.length)];
    return {x: i % SIZE, y: Math.floor(i / SIZE)};
}

export default function Snake() {
    const [game, setGame] = useState(START);
    const [phase, setPhase] = useState("ready"); // ready | running | paused | over
    const [best, setBest] = useState(null);
    const gameRef = useRef(START);
    const queue = useRef([]); // Turns waiting for the next tick, so quick double-taps aren't lost.
    const touch = useRef(null);

    const running = phase === "running";
    const delay = Math.max(70, 150 - game.score * 4);

    useEffect(() => {
        setBest(readBest());
    }, []);

    useEffect(() => {
        if (!running) return;
        const timer = setInterval(tick, delay);
        return () => clearInterval(timer);
    }, [running, delay]);

    useEffect(() => {
        function onKey(e) {
            if (isTyping(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;
            const dir = KEYS[e.key.length === 1 ? e.key.toLowerCase() : e.key];
            if (dir && running) {
                e.preventDefault();
                turn(dir);
            } else if (e.key === " " && running && e.target.tagName !== "BUTTON") {
                // A focused button handles Space itself (e.g. Pause), so only catch it elsewhere.
                e.preventDefault();
                setPhase("paused");
            }
        }
        // Pause when the tab is hidden, rather than dying off-screen.
        function onVisibility() {
            if (document.hidden && running) setPhase("paused");
        }
        window.addEventListener("keydown", onKey);
        document.addEventListener("visibilitychange", onVisibility);
        return () => {
            window.removeEventListener("keydown", onKey);
            document.removeEventListener("visibilitychange", onVisibility);
        };
    }, [running]);

    useEffect(() => {
        if (phase !== "over" || (best && game.score <= best)) return;
        setBest(game.score);
        try {
            localStorage.setItem(BEST_KEY, String(game.score));
        } catch {
            // Best score just won't persist.
        }
    }, [phase]);

    function update(next) {
        gameRef.current = next;
        setGame(next);
    }

    function tick() {
        const g = gameRef.current;
        const dir = queue.current.shift() ?? g.dir;
        const head = {x: g.snake[0].x + DIRS[dir].x, y: g.snake[0].y + DIRS[dir].y};
        const eats = head.x === g.food?.x && head.y === g.food?.y;
        const body = eats ? g.snake : g.snake.slice(0, -1);
        const crashed = head.x < 0 || head.y < 0 || head.x >= SIZE || head.y >= SIZE
            || body.some((p) => p.x === head.x && p.y === head.y);
        if (crashed) {
            setPhase("over");
            return;
        }
        const snake = [head, ...body];
        const food = eats ? placeFood(snake) : g.food;
        update({snake, dir, food, score: g.score + (eats ? 1 : 0)});
        if (!food) setPhase("over");
    }

    // Queue a turn, ignoring reversals into the snake's own neck.
    function turn(dir) {
        const q = queue.current;
        const last = q.length ? q[q.length - 1] : gameRef.current.dir;
        const reverse = DIRS[dir].x === -DIRS[last].x && DIRS[dir].y === -DIRS[last].y;
        if (dir !== last && !reverse && q.length < 2) q.push(dir);
    }

    // On-screen arrows and swipes also start or resume the game.
    function steer(dir) {
        if (phase === "over") return;
        turn(dir);
        if (!running) setPhase("running");
    }

    function restart() {
        const snake = START.snake;
        update({...START, food: placeFood(snake)});
        queue.current = [];
        setPhase("running");
    }

    function mainAction() {
        if (phase === "ready" || phase === "over") restart();
        else setPhase(running ? "paused" : "running");
    }

    function onTouchStart(e) {
        const t = e.touches[0];
        touch.current = {x: t.clientX, y: t.clientY};
    }

    function onTouchEnd(e) {
        if (!touch.current) return;
        const t = e.changedTouches[0];
        const dx = t.clientX - touch.current.x;
        const dy = t.clientY - touch.current.y;
        touch.current = null;
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
        if (Math.abs(dx) > Math.abs(dy)) steer(dx > 0 ? "right" : "left");
        else steer(dy > 0 ? "down" : "up");
    }

    const cells = Array(SIZE * SIZE).fill(null);
    game.snake.forEach((p, i) => {
        cells[p.y * SIZE + p.x] = i === 0 ? own.head : own.body;
    });
    if (game.food) cells[game.food.y * SIZE + game.food.x] = own.food;

    let status;
    if (phase === "ready") status = "Press start, then steer";
    else if (phase === "paused") status = "Paused";
    else if (phase === "over" && !game.food) status = <>You filled the board! <em>{game.score}</em></>;
    else if (phase === "over") status = <>Game over: <em>{game.score}</em> {game.score === 1 ? "point" : "points"}</>;
    else status = <>Score <em>{game.score}</em></>;

    return (
        <div className={style.game} style={{"--board-reserve": "480px"}}>
            <p className={style.status} aria-live="polite">{status}</p>
            <div className={cx(own.board, phase === "over" && own.boardOver)} role="img"
                 aria-label={`Snake board, score ${game.score}`} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
                {cells.map((cell, i) => <span key={i} className={cell || undefined}/>)}
            </div>
            <div className={style.scores}>
                <span className={style.score}><strong>{game.score}</strong>SCORE</span>
                <span className={style.score}><strong>{best ?? "–"}</strong>BEST</span>
            </div>
            <div className={own.pad}>
                <button type="button" className={cx(own.arrow, own.up)} aria-label="Up" onClick={() => steer("up")}>▲</button>
                <button type="button" className={cx(own.arrow, own.left)} aria-label="Left" onClick={() => steer("left")}>◀</button>
                <button type="button" className={cx(own.arrow, own.right)} aria-label="Right" onClick={() => steer("right")}>▶</button>
                <button type="button" className={cx(own.arrow, own.down)} aria-label="Down" onClick={() => steer("down")}>▼</button>
            </div>
            <button type="button" className={cx(style.button, phase === "ready" && style.buttonActive)} onClick={mainAction}>
                {{ready: "Start", running: "Pause", paused: "Resume", over: "Play again"}[phase]}
            </button>
        </div>
    );
}
