import {useEffect, useRef, useState} from "react";
import cx from "../../lib/cx";
import {useHighScore} from "../../lib/highScores";
import {pick} from "../../lib/random";
import {DIRECTION_KEYS, useGameKeys, useSwipe} from "./hooks";
import {GameButton, Stat, Stats, Status} from "./kit";
import style from "./games.module.css";
import own from "./snake.module.css";

const SIZE = 16;
const BEST_KEY = "games.snake.best";
const DIRS = {up: {x: 0, y: -1}, down: {x: 0, y: 1}, left: {x: -1, y: 0}, right: {x: 1, y: 0}};
// Fixed start (food included) so the server render and first client render agree.
const START = {snake: [{x: 6, y: 8}, {x: 5, y: 8}, {x: 4, y: 8}], dir: "right", food: {x: 11, y: 8}, score: 0};

// A random free square, or null when the snake fills the board.
function placeFood(snake) {
    const taken = new Set(snake.map((p) => p.y * SIZE + p.x));
    const free = [];
    for (let i = 0; i < SIZE * SIZE; i++) if (!taken.has(i)) free.push(i);
    if (!free.length) return null;
    const i = pick(free);
    return {x: i % SIZE, y: Math.floor(i / SIZE)};
}

export default function Snake() {
    const [game, setGame] = useState(START);
    const [phase, setPhase] = useState("ready"); // ready | running | paused | over
    const [best, recordBest] = useHighScore(BEST_KEY);
    const gameRef = useRef(START);
    const queue = useRef([]); // Turns waiting for the next tick, so quick double-taps aren't lost.

    const running = phase === "running";
    const delay = Math.max(70, 150 - game.score * 4);

    useEffect(() => {
        if (!running) return;
        const timer = setInterval(tick, delay);
        return () => clearInterval(timer);
    }, [running, delay]);

    useGameKeys((key, e) => {
        const dir = DIRECTION_KEYS[key];
        if (dir) {
            e.preventDefault();
            turn(dir);
        } else if (key === " " && e.target.tagName !== "BUTTON") {
            // A focused button handles Space itself (e.g. Pause), so only catch it elsewhere.
            e.preventDefault();
            setPhase("paused");
        }
    }, running);

    // Pause when the tab is hidden, rather than dying off-screen.
    useEffect(() => {
        function onVisibility() {
            if (document.hidden && running) setPhase("paused");
        }
        document.addEventListener("visibilitychange", onVisibility);
        return () => document.removeEventListener("visibilitychange", onVisibility);
    }, [running]);

    useEffect(() => {
        if (phase === "over") recordBest(game.score);
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

    const onSwipe = useSwipe(steer);

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
            <Status>{status}</Status>
            <div className={cx(own.board, phase === "over" && own.boardOver)} role="img"
                 aria-label={`Snake board, score ${game.score}`} onPointerDown={onSwipe}>
                {cells.map((cell, i) => <span key={i} className={cell || undefined}/>)}
            </div>
            <Stats>
                <Stat value={game.score} label="SCORE"/>
                <Stat value={best ?? "–"} label="BEST"/>
            </Stats>
            <div className={own.pad}>
                <button type="button" className={cx(own.arrow, own.up)} aria-label="Up" onClick={() => steer("up")}>▲</button>
                <button type="button" className={cx(own.arrow, own.left)} aria-label="Left" onClick={() => steer("left")}>◀</button>
                <button type="button" className={cx(own.arrow, own.right)} aria-label="Right" onClick={() => steer("right")}>▶</button>
                <button type="button" className={cx(own.arrow, own.down)} aria-label="Down" onClick={() => steer("down")}>▼</button>
            </div>
            <GameButton active={phase === "ready"} onClick={mainAction}>
                {{ready: "Start", running: "Pause", paused: "Resume", over: "Play again"}[phase]}
            </GameButton>
        </div>
    );
}
