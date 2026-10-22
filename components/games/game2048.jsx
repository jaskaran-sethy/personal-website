import {useEffect, useRef, useState} from "react";
import cx from "../../lib/cx";
import style from "./games.module.css";
import own from "./game2048.module.css";

const BEST_KEY = "games.2048.best";
const EMPTY = Array(16).fill(0);
const ROWS = [0, 1, 2, 3].map((r) => [0, 1, 2, 3].map((c) => r * 4 + c));
const COLS = [0, 1, 2, 3].map((c) => [0, 1, 2, 3].map((r) => r * 4 + c));
// Each line is listed in the order tiles slide towards, so index 0 is the wall they pile against.
const LINES = {
    left: ROWS,
    right: ROWS.map((line) => [...line].reverse()),
    up: COLS,
    down: COLS.map((line) => [...line].reverse()),
};
const KEYS = {
    ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
    w: "up", s: "down", a: "left", d: "right",
};

function readBest() {
    try {
        return Number(localStorage.getItem(BEST_KEY)) || 0;
    } catch {
        return 0;
    }
}

function isTyping(target) {
    return target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable;
}

// Slides every line one way, merging each pair once. Returns the new board, points gained and merged squares.
function slide(board, dir) {
    const next = [...board];
    const merged = [];
    let gained = 0;
    for (const line of LINES[dir]) {
        const values = line.map((i) => board[i]).filter(Boolean);
        const out = [];
        for (let k = 0; k < values.length; k++) {
            if (values[k] === values[k + 1]) {
                out.push(values[k] * 2);
                gained += values[k] * 2;
                merged.push(line[out.length - 1]);
                k++;
            } else {
                out.push(values[k]);
            }
        }
        line.forEach((square, k) => {
            next[square] = out[k] ?? 0;
        });
    }
    return {board: next, gained, merged, moved: next.some((v, i) => v !== board[i])};
}

// Drops a 2 (or, one time in ten, a 4) on a random empty square.
function addTile(board) {
    const empty = board.flatMap((v, i) => v ? [] : [i]);
    const index = empty[Math.floor(Math.random() * empty.length)];
    return {board: board.map((v, i) => i === index ? (Math.random() < 0.1 ? 4 : 2) : v), index};
}

function canMove(board) {
    if (board.includes(0)) return true;
    return board.some((v, i) => (i % 4 < 3 && v === board[i + 1]) || (i < 12 && v === board[i + 4]));
}

function freshGame() {
    const first = addTile(EMPTY);
    const second = addTile(first.board);
    return {board: second.board, score: 0, fresh: [first.index, second.index], merged: [], turn: 0};
}

export default function Game2048() {
    // Tiles are dealt in an effect, so the server render and first client render agree.
    const [game, setGame] = useState({board: EMPTY, score: 0, fresh: [], merged: [], turn: 0});
    const [keepGoing, setKeepGoing] = useState(false);
    const [best, setBest] = useState(0);
    const touch = useRef(null);

    const won = !keepGoing && game.board.includes(2048);
    const lost = !canMove(game.board);
    const blocked = won || lost;

    useEffect(() => {
        setGame(freshGame());
        setBest(readBest());
    }, []);

    useEffect(() => {
        function onKey(e) {
            if (isTyping(e.target) || e.ctrlKey || e.metaKey || e.altKey || blocked) return;
            const dir = KEYS[e.key.length === 1 ? e.key.toLowerCase() : e.key];
            if (!dir) return;
            e.preventDefault();
            move(dir);
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [game, blocked, best]);

    function move(dir) {
        if (blocked) return;
        const result = slide(game.board, dir);
        if (!result.moved) return;
        const added = addTile(result.board);
        const score = game.score + result.gained;
        setGame({board: added.board, score, fresh: [added.index], merged: result.merged, turn: game.turn + 1});
        if (score > best) {
            setBest(score);
            try {
                localStorage.setItem(BEST_KEY, String(score));
            } catch {
                // Best score just won't persist.
            }
        }
    }

    function newGame() {
        setGame(freshGame());
        setKeepGoing(false);
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
        if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? "right" : "left");
        else move(dy > 0 ? "down" : "up");
    }

    let status;
    if (won) status = <>You made <em>2048!</em></>;
    else if (lost) status = "No moves left";
    else status = "Slide to merge the tiles";

    return (
        <div className={style.game}>
            <p className={style.status} aria-live="polite">{status}</p>
            <div className={own.board} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
                 role="group" aria-label="2048 board">
                {game.board.map((value, i) => {
                    // Re-keying a tile that just appeared or merged replays its animation.
                    const fresh = game.fresh.includes(i);
                    const merged = game.merged.includes(i);
                    return (
                        <div key={fresh || merged ? `${i}-${game.turn}` : i}
                             className={cx(own.tile, value && (own[`v${value}`] || own.vBig),
                                 value && own[`digits${String(value).length}`], fresh && own.fresh, merged && own.merged)}>
                            {value || null}
                        </div>
                    );
                })}
                {blocked ? (
                    <div className={own.overlay}>
                        <p>{won ? "You win!" : "Game over"}</p>
                        <div className={style.controls}>
                            {won ? (
                                <button type="button" className={cx(style.button, style.buttonActive)}
                                        onClick={() => setKeepGoing(true)}>Keep going</button>
                            ) : null}
                            <button type="button" className={style.button} onClick={newGame}>New game</button>
                        </div>
                    </div>
                ) : null}
            </div>
            <div className={style.scores}>
                <span className={style.score}><strong>{game.score}</strong>SCORE</span>
                <span className={style.score}><strong>{best || "–"}</strong>BEST</span>
            </div>
            <button type="button" className={style.button} onClick={newGame}>New game</button>
        </div>
    );
}
