import {useEffect, useRef, useState} from "react";
import cx from "../../lib/cx";
import style from "./games.module.css";
import own from "./minesweeper.module.css";

const SIZE = 9;
const MINES = 10;
const BEST_KEY = "games.minesweeper.best";
const NEIGHBOURS = Array.from({length: SIZE * SIZE}, (_, i) => {
    const row = Math.floor(i / SIZE);
    const col = i % SIZE;
    const out = [];
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            const r = row + dr;
            const c = col + dc;
            if ((dr || dc) && r >= 0 && r < SIZE && c >= 0 && c < SIZE) out.push(r * SIZE + c);
        }
    }
    return out;
});

function blankBoard() {
    return Array.from({length: SIZE * SIZE}, () => ({mine: false, adj: 0, revealed: false, flagged: false}));
}

function readBest() {
    try {
        return Number(localStorage.getItem(BEST_KEY)) || null;
    } catch {
        return null;
    }
}

// Mines are laid on the first dig, away from that square and its neighbours, so it always opens a patch.
function layMines(board, safe) {
    const banned = new Set([safe, ...NEIGHBOURS[safe]]);
    const pool = board.flatMap((_, i) => banned.has(i) ? [] : [i]);
    for (let n = 0; n < MINES; n++) {
        const pick = Math.floor(Math.random() * (pool.length - n)) + n;
        [pool[n], pool[pick]] = [pool[pick], pool[n]];
        board[pool[n]].mine = true;
    }
    board.forEach((cell, i) => {
        cell.adj = NEIGHBOURS[i].filter((j) => board[j].mine).length;
    });
}

// Reveals a square; zeros spread to their neighbours. Mutates the board copy it's given.
function flood(board, start) {
    const stack = [start];
    while (stack.length) {
        const i = stack.pop();
        const cell = board[i];
        if (cell.revealed || cell.flagged) continue;
        cell.revealed = true;
        if (cell.adj === 0) stack.push(...NEIGHBOURS[i]);
    }
}

export default function Minesweeper() {
    const [board, setBoard] = useState(blankBoard);
    const [phase, setPhase] = useState("ready"); // ready | playing | won | lost
    const [flagMode, setFlagMode] = useState(false);
    const [exploded, setExploded] = useState(null);
    const [elapsed, setElapsed] = useState(0);
    const [best, setBest] = useState(null);
    const startedAt = useRef(0);

    const over = phase === "won" || phase === "lost";
    const flags = board.filter((c) => c.flagged).length;

    useEffect(() => {
        setBest(readBest());
    }, []);

    useEffect(() => {
        if (phase !== "playing") return;
        const timer = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt.current) / 1000)), 250);
        return () => clearInterval(timer);
    }, [phase]);

    function dig(index) {
        if (over || board[index].flagged) return;
        const next = board.map((c) => ({...c}));
        if (phase === "ready") {
            layMines(next, index);
            startedAt.current = Date.now();
            setPhase("playing");
        }
        // Digging an open number whose flags are all placed opens the rest of its neighbours.
        let targets = [index];
        if (next[index].revealed) {
            const around = NEIGHBOURS[index];
            if (!next[index].adj || around.filter((j) => next[j].flagged).length !== next[index].adj) return;
            targets = around.filter((j) => !next[j].revealed && !next[j].flagged);
        }
        const hit = targets.find((j) => next[j].mine);
        if (hit !== undefined) {
            next.forEach((c) => {
                if (c.mine && !c.flagged) c.revealed = true;
            });
            setBoard(next);
            setExploded(hit);
            finish("lost");
            return;
        }
        targets.forEach((j) => flood(next, j));
        if (next.filter((c) => c.revealed).length === SIZE * SIZE - MINES) {
            next.forEach((c) => {
                if (c.mine) c.flagged = true;
            });
            setBoard(next);
            finish("won");
            return;
        }
        setBoard(next);
    }

    function finish(result) {
        const seconds = Math.floor((Date.now() - startedAt.current) / 1000);
        setElapsed(seconds);
        setPhase(result);
        if (result !== "won" || (best && seconds >= best)) return;
        setBest(seconds);
        try {
            localStorage.setItem(BEST_KEY, String(seconds));
        } catch {
            // Best time just won't persist.
        }
    }

    function toggleFlag(index) {
        if (over || board[index].revealed) return;
        setBoard(board.map((c, i) => i === index ? {...c, flagged: !c.flagged} : c));
    }

    function newGame() {
        setBoard(blankBoard());
        setPhase("ready");
        setExploded(null);
        setElapsed(0);
    }

    function label(cell, i) {
        const where = `Row ${Math.floor(i / SIZE) + 1}, column ${i % SIZE + 1}`;
        if (cell.revealed) return `${where}, ${cell.mine ? "mine" : cell.adj || "empty"}`;
        return `${where}, ${cell.flagged ? "flagged" : "hidden"}`;
    }

    let status;
    if (phase === "won") status = <>Cleared in <em>{elapsed}s</em>!</>;
    else if (phase === "lost") status = "Boom. Better luck next time";
    else if (phase === "ready") status = "Dig anywhere to start";
    else status = flagMode ? "Tap a square to flag it" : "Tap a square to dig";

    return (
        <div className={style.game}>
            <p className={style.status} aria-live="polite">{status}</p>
            <div className={style.toggle} role="group" aria-label="Tap mode">
                <button type="button" aria-pressed={!flagMode} className={cx(style.toggleOption, !flagMode && style.toggleActive)}
                        onClick={() => setFlagMode(false)}>Dig</button>
                <button type="button" aria-pressed={flagMode} className={cx(style.toggleOption, flagMode && style.toggleActive)}
                        onClick={() => setFlagMode(true)}>Flag</button>
            </div>
            <div className={cx(own.board, over && own.boardOver)}>
                {board.map((cell, i) => (
                    <button key={i} type="button" aria-label={label(cell, i)}
                            className={cx(own.cell, cell.revealed && own.open, cell.revealed && !cell.mine && own[`n${cell.adj}`],
                                cell.flagged && own.flagged, i === exploded && own.exploded)}
                            disabled={over}
                            onClick={() => flagMode && !cell.revealed ? toggleFlag(i) : dig(i)}
                            onContextMenu={(e) => {
                                e.preventDefault();
                                toggleFlag(i);
                            }}>
                        {cell.revealed ? (cell.mine ? "✸" : cell.adj || null) : cell.flagged ? "⚑" : null}
                    </button>
                ))}
            </div>
            <div className={style.scores}>
                <span className={style.score}><strong>{MINES - flags}</strong>MINES</span>
                <span className={style.score}><strong>{elapsed}</strong>TIME</span>
                <span className={style.score}><strong>{best ?? "–"}</strong>BEST</span>
            </div>
            <button type="button" className={style.button} onClick={newGame}>New game</button>
        </div>
    );
}
