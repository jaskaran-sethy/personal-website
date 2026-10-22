import {useEffect, useRef, useState} from "react";
import cx from "../../lib/cx";
import style from "./games.module.css";
import own from "./slidingPuzzle.module.css";

const SIZE = 4;
const SOLVED = [...Array.from({length: SIZE * SIZE - 1}, (_, i) => i + 1), 0];
const BEST_KEY = "games.sliding.best";
// Which square's tile moves into the gap for each key, as an offset from the gap.
const KEY_OFFSETS = {
    ArrowUp: SIZE, ArrowDown: -SIZE, ArrowLeft: 1, ArrowRight: -1,
    w: SIZE, s: -SIZE, a: 1, d: -1,
};

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

function adjacent(a, b) {
    const sameRow = Math.floor(a / SIZE) === Math.floor(b / SIZE);
    return (Math.abs(a - b) === 1 && sameRow) || Math.abs(a - b) === SIZE;
}

const isSolved = (tiles) => tiles.every((t, i) => t === SOLVED[i]);

// Walks the gap ~200 random steps from solved, so the result is always solvable.
function shuffled() {
    const tiles = [...SOLVED];
    let gap = tiles.length - 1;
    let previous = -1;
    for (let step = 0; step < 200 || isSolved(tiles); step++) {
        const options = tiles.flatMap((_, i) => adjacent(i, gap) && i !== previous ? [i] : []);
        const next = options[Math.floor(Math.random() * options.length)];
        [tiles[gap], tiles[next]] = [tiles[next], tiles[gap]];
        previous = gap;
        gap = next;
    }
    return tiles;
}

function clock(seconds) {
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export default function SlidingPuzzle() {
    // Shuffled in an effect, so the server render and first client render agree.
    const [tiles, setTiles] = useState(SOLVED);
    const [dealt, setDealt] = useState(false);
    const [moves, setMoves] = useState(0);
    const [elapsed, setElapsed] = useState(0);
    const [best, setBest] = useState(null);
    const startedAt = useRef(null);

    const solved = dealt && isSolved(tiles);
    const running = dealt && moves > 0 && !solved;
    const gap = tiles.indexOf(0);

    useEffect(() => {
        setTiles(shuffled());
        setDealt(true);
        setBest(readBest());
    }, []);

    useEffect(() => {
        if (!running) return;
        const timer = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt.current) / 1000)), 250);
        return () => clearInterval(timer);
    }, [running]);

    useEffect(() => {
        if (!solved) return;
        setElapsed(Math.floor((Date.now() - startedAt.current) / 1000));
        if (best && moves >= best) return;
        setBest(moves);
        try {
            localStorage.setItem(BEST_KEY, String(moves));
        } catch {
            // Best score just won't persist.
        }
    }, [solved]);

    useEffect(() => {
        function onKey(e) {
            if (isTyping(e.target) || e.ctrlKey || e.metaKey || e.altKey || !dealt || solved) return;
            const offset = KEY_OFFSETS[e.key.length === 1 ? e.key.toLowerCase() : e.key];
            if (!offset) return;
            e.preventDefault();
            const from = gap + offset;
            if (from >= 0 && from < tiles.length && adjacent(from, gap)) slide(from);
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [tiles, dealt, solved]);

    function slide(index) {
        if (!dealt || solved || !adjacent(index, gap)) return;
        if (moves === 0) startedAt.current = Date.now();
        const next = [...tiles];
        [next[gap], next[index]] = [next[index], next[gap]];
        setTiles(next);
        setMoves((m) => m + 1);
    }

    function newGame() {
        setTiles(shuffled());
        setMoves(0);
        setElapsed(0);
        startedAt.current = null;
    }

    let status;
    if (!dealt) status = "Shuffling…";
    else if (solved) status = <>Solved in <em>{moves}</em> moves!</>;
    else if (moves === 0) status = "Put the tiles back in order";
    else status = `${tiles.filter((t, i) => t && t === SOLVED[i]).length} of 15 in place`;

    return (
        <div className={style.game}>
            <p className={style.status} aria-live="polite">{status}</p>
            <div className={cx(own.board, solved && own.solved)}>
                {/* Tiles render in number order and move by transform, so they glide between squares. */}
                {SOLVED.filter(Boolean).map((value) => {
                    const at = tiles.indexOf(value);
                    const movable = !solved && adjacent(at, gap);
                    return (
                        <button key={value} type="button"
                                aria-label={`Tile ${value}${movable ? ", next to the gap" : ""}`}
                                className={cx(own.tile, at === value - 1 && own.home, movable && own.movable)}
                                style={{transform: `translate(${(at % SIZE) * 100}%, ${Math.floor(at / SIZE) * 100}%)`}}
                                onClick={() => slide(at)}>
                            <span className={own.face}>{value}</span>
                        </button>
                    );
                })}
            </div>
            <div className={style.scores}>
                <span className={style.score}><strong>{moves}</strong>MOVES</span>
                <span className={style.score}><strong>{clock(elapsed)}</strong>TIME</span>
                <span className={style.score}><strong>{best ?? "–"}</strong>BEST</span>
            </div>
            <button type="button" className={style.button} onClick={newGame}>
                {solved ? "Play again" : "Shuffle"}
            </button>
        </div>
    );
}
