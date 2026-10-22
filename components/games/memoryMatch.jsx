import {useEffect, useState} from "react";
import cx from "../../lib/cx";
import {useHighScore} from "../../lib/highScores";
import {shuffle} from "../../lib/random";
import {GameButton, Stat, Stats, Status} from "./kit";
import style from "./games.module.css";

const SYMBOLS = ["♠", "♥", "♦", "♣", "★", "☾", "☀", "♪"];
const BEST_KEY = "games.memory.best";

function shuffledDeck() {
    return shuffle([...SYMBOLS, ...SYMBOLS]);
}

export default function MemoryMatch() {
    // Dealt in an effect, so the server render and first client render agree.
    const [deck, setDeck] = useState([...SYMBOLS, ...SYMBOLS]);
    const [open, setOpen] = useState([]);
    const [matched, setMatched] = useState([]);
    const [moves, setMoves] = useState(0);
    const [best, recordBest] = useHighScore(BEST_KEY, true);

    const won = matched.length === deck.length;

    useEffect(() => {
        setDeck(shuffledDeck());
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
        if (won) recordBest(moves);
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
            <Status>
                {won ? <>All pairs in <em>{moves}</em> moves!</> : `${matched.length / 2} of ${SYMBOLS.length} pairs found`}
            </Status>
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
            <Stats>
                <Stat value={moves} label="MOVES"/>
                <Stat value={best ?? "–"} label="BEST"/>
            </Stats>
            <GameButton onClick={newGame}>New game</GameButton>
        </div>
    );
}
