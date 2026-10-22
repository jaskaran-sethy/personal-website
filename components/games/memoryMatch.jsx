import {useEffect, useState} from "react";
import cx from "../../lib/cx";
import style from "./games.module.css";

const SYMBOLS = ["♠", "♥", "♦", "♣", "★", "☾", "☀", "♪"];
const BEST_KEY = "games.memory.best";

function shuffledDeck() {
    const deck = [...SYMBOLS, ...SYMBOLS];
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

function readBest() {
    try {
        return Number(localStorage.getItem(BEST_KEY)) || null;
    } catch {
        return null;
    }
}

export default function MemoryMatch() {
    // Dealt in an effect, so the server render and first client render agree.
    const [deck, setDeck] = useState([...SYMBOLS, ...SYMBOLS]);
    const [open, setOpen] = useState([]);
    const [matched, setMatched] = useState([]);
    const [moves, setMoves] = useState(0);
    const [best, setBest] = useState(null);

    const won = matched.length === deck.length;

    useEffect(() => {
        setDeck(shuffledDeck());
        setBest(readBest());
    }, []);

    useEffect(() => {
        if (open.length !== 2) return;
        const [a, b] = open;
        if (deck[a] === deck[b]) {
            setMatched((m) => [...m, a, b]);
            setOpen([]);
            return;
        }
        const timer = setTimeout(() => setOpen([]), 800);
        return () => clearTimeout(timer);
    }, [open]);

    useEffect(() => {
        if (!won || (best && moves >= best)) return;
        setBest(moves);
        try {
            localStorage.setItem(BEST_KEY, String(moves));
        } catch {
            // Best score just won't persist.
        }
    }, [won]);

    function flip(index) {
        if (open.length === 2 || open.includes(index) || matched.includes(index)) return;
        if (open.length === 1) setMoves((m) => m + 1);
        setOpen([...open, index]);
    }

    function newGame() {
        setDeck(shuffledDeck());
        setOpen([]);
        setMatched([]);
        setMoves(0);
    }

    return (
        <div className={style.game}>
            <p className={style.status} aria-live="polite">
                {won ? <>All pairs in <em>{moves}</em> moves!</> : `${matched.length / 2} of ${SYMBOLS.length} pairs found`}
            </p>
            <div className={style.memoryBoard}>
                {deck.map((symbol, i) => {
                    const faceUp = open.includes(i) || matched.includes(i);
                    return (
                        <button key={i} type="button" aria-label={faceUp ? symbol : `Card ${i + 1}`}
                                className={cx(style.memoryCard, faceUp && style.memoryFlipped, matched.includes(i) && style.memoryMatched)}
                                disabled={faceUp} onClick={() => flip(i)}>
                            <span className={style.memoryInner}>
                                <span className={style.memoryBack}/>
                                <span className={style.memoryFace}>{symbol}</span>
                            </span>
                        </button>
                    );
                })}
            </div>
            <div className={style.scores}>
                <span className={style.score}><strong>{moves}</strong>MOVES</span>
                <span className={style.score}><strong>{best ?? "–"}</strong>BEST</span>
            </div>
            <button type="button" className={style.button} onClick={newGame}>New game</button>
        </div>
    );
}
