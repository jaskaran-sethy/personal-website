import {useEffect, useRef, useState} from "react";
import cx from "../../lib/cx";
import style from "./games.module.css";
import own from "./game2048.module.css";

const BEST_KEY = "games.2048.best";
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

let nextId = 1;

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

// Tiles are objects with a stable id, so React keeps the same element and CSS can animate it to its new square.
// A merge slides both tiles onto the same square, marks them `gone`, and adds a new doubled tile there that pops in.
// `gone` tiles stay rendered underneath until the next move, which is when they're dropped.
function liveTiles(tiles) {
    return tiles.filter((t) => !t.gone);
}

function toBoard(tiles) {
    const board = Array(16).fill(null);
    for (const t of liveTiles(tiles)) board[t.pos] = t;
    return board;
}

function slide(tiles, dir) {
    const board = toBoard(tiles);
    const out = [];
    let gained = 0;
    let moved = false;
    for (const line of LINES[dir]) {
        const row = line.map((i) => board[i]).filter(Boolean);
        let k = 0;
        for (let j = 0; j < row.length; j++) {
            const target = line[k++];
            const tile = row[j];
            const partner = row[j + 1];
            if (partner && partner.value === tile.value) {
                out.push({...tile, pos: target, gone: true}, {...partner, pos: target, gone: true});
                out.push({id: nextId++, value: tile.value * 2, pos: target, merged: true});
                gained += tile.value * 2;
                moved = true;
                j++;
            } else {
                if (tile.pos !== target) moved = true;
                out.push({...tile, pos: target, merged: false, fresh: false});
            }
        }
    }
    return {tiles: out, gained, moved};
}

// Drops a 2 (or, one time in ten, a 4) on a random empty square.
function addTile(tiles) {
    const taken = new Set(liveTiles(tiles).map((t) => t.pos));
    const empty = [...Array(16).keys()].filter((i) => !taken.has(i));
    const pos = empty[Math.floor(Math.random() * empty.length)];
    return [...tiles, {id: nextId++, value: Math.random() < 0.1 ? 4 : 2, pos, fresh: true}];
}

function canMove(tiles) {
    const board = toBoard(tiles).map((t) => t?.value ?? 0);
    if (board.includes(0)) return true;
    return board.some((v, i) => (i % 4 < 3 && v === board[i + 1]) || (i < 12 && v === board[i + 4]));
}

function freshGame() {
    return {tiles: addTile(addTile([])), score: 0, gained: 0, turn: 0};
}

export default function Game2048() {
    // Tiles are dealt in an effect, so the server render and first client render agree.
    const [game, setGame] = useState({tiles: [], score: 0, gained: 0, turn: 0});
    const [keepGoing, setKeepGoing] = useState(false);
    const [best, setBest] = useState(0);
    const swipe = useRef(null);

    const live = liveTiles(game.tiles);
    const started = live.length > 0;
    const won = !keepGoing && live.some((t) => t.value === 2048);
    const lost = started && !canMove(game.tiles);
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
        const result = slide(game.tiles, dir);
        if (!result.moved) return;
        const score = game.score + result.gained;
        setGame({tiles: addTile(result.tiles), score, gained: result.gained, turn: game.turn + 1});
        if (score > best) {
            setBest(score);
            try {
                localStorage.setItem(BEST_KEY, String(score));
            } catch {
                // Best score just won't persist.
            }
        }
    }

    swipe.current = move;

    function newGame() {
        setGame(freshGame());
        setKeepGoing(false);
    }

    // Swipes: one handler for mouse drags, touch and pens. The release is watched on window, so a drag that
    // ends outside the board still counts. Presses on the overlay's buttons aren't swipes.
    function onPointerDown(e) {
        if (e.button !== 0 || e.target.closest("button")) return;
        const start = {x: e.clientX, y: e.clientY};
        function onUp(up) {
            window.removeEventListener("pointerup", onUp);
            window.removeEventListener("pointercancel", onUp);
            if (up.type === "pointercancel") return;
            const dx = up.clientX - start.x;
            const dy = up.clientY - start.y;
            if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
            if (Math.abs(dx) > Math.abs(dy)) swipe.current(dx > 0 ? "right" : "left");
            else swipe.current(dy > 0 ? "down" : "up");
        }
        window.addEventListener("pointerup", onUp);
        window.addEventListener("pointercancel", onUp);
    }

    let status;
    if (won) status = <>You made <em>2048!</em></>;
    else if (lost) status = "No moves left";
    else status = "Slide to merge the tiles";

    return (
        <div className={style.game}>
            <p className={style.status} aria-live="polite">{status}</p>
            <div className={own.board} onPointerDown={onPointerDown}
                 role="group" aria-label="2048 board">
                {Array.from({length: 16}, (_, i) => <div key={i} className={own.cell}/>)}
                <div className={own.tiles}>
                    {game.tiles.map((t) => (
                        <div key={t.id} style={{"--x": t.pos % 4, "--y": Math.floor(t.pos / 4)}}
                             className={cx(own.tile, t.gone && own.gone)}>
                            <span className={cx(own.face, own[`v${t.value}`] || own.vBig,
                                own[`digits${String(t.value).length}`], t.fresh && own.fresh, t.merged && own.merged)}>
                                {t.value}
                            </span>
                        </div>
                    ))}
                </div>
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
                <span className={cx(style.score, own.scoreBox)}>
                    <strong>{game.score.toLocaleString()}</strong>SCORE
                    {game.gained ? <span key={game.turn} className={own.gain}>+{game.gained}</span> : null}
                </span>
                <span className={style.score}><strong>{best ? best.toLocaleString() : "–"}</strong>BEST</span>
            </div>
            <button type="button" className={style.button} onClick={newGame}>New game</button>
        </div>
    );
}
