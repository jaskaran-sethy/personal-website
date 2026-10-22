import {useEffect, useState} from "react";
import cx from "../../lib/cx";
import style from "./games.module.css";
import wg from "./wordGuess.module.css";
import {ANSWERS, VALID_GUESSES} from "./wordList";

const ROWS = 6;
const LENGTH = 5;
const KEY_ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
const STREAK_KEY = "games.words.streak";
const RANK = {absent: 1, present: 2, correct: 3};

// Scores a guess letter by letter. Exact matches go first, so a doubled letter in the guess
// only shows "present" as many times as the answer still has it spare.
function scoreGuess(guess, answer) {
    const result = Array(LENGTH).fill("absent");
    const spare = {};
    for (let i = 0; i < LENGTH; i++) {
        if (guess[i] === answer[i]) result[i] = "correct";
        else spare[answer[i]] = (spare[answer[i]] || 0) + 1;
    }
    for (let i = 0; i < LENGTH; i++) {
        if (result[i] === "correct" || !spare[guess[i]]) continue;
        result[i] = "present";
        spare[guess[i]]--;
    }
    return result;
}

function pickAnswer(previous) {
    let word;
    do word = ANSWERS[Math.floor(Math.random() * ANSWERS.length)];
    while (word === previous);
    return word;
}

function readStreak() {
    try {
        return Number(localStorage.getItem(STREAK_KEY)) || 0;
    } catch {
        return 0;
    }
}

function saveStreak(value) {
    try {
        localStorage.setItem(STREAK_KEY, String(value));
    } catch {
        // Streak just won't persist.
    }
}

export default function WordGuess() {
    // Picked in an effect, so the server render and first client render agree.
    const [answer, setAnswer] = useState("");
    const [guesses, setGuesses] = useState([]);
    const [current, setCurrent] = useState("");
    const [note, setNote] = useState("");
    const [streak, setStreak] = useState(0);

    const won = guesses.includes(answer);
    const lost = !won && guesses.length === ROWS;
    const over = won || lost;

    useEffect(() => {
        setAnswer(pickAnswer());
        setStreak(readStreak());
    }, []);

    useEffect(() => {
        if (!over) return;
        const next = won ? readStreak() + 1 : 0;
        setStreak(next);
        saveStreak(next);
    }, [over]);

    useEffect(() => {
        function onKey(e) {
            if (e.ctrlKey || e.metaKey || e.altKey) return;
            if (e.target instanceof Element && e.target.closest("input, textarea")) return;
            if (e.key === "Enter" || e.key === "Backspace" || /^[a-z]$/i.test(e.key)) {
                // Enter on a focused button would also click it.
                e.preventDefault();
                press(e.key);
            }
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    });

    function press(key) {
        if (!answer || over) return;
        setNote("");
        if (key === "Enter") {
            if (current.length < LENGTH) setNote("Not enough letters");
            else if (!VALID_GUESSES.has(current)) setNote("Not in word list");
            else {
                setGuesses([...guesses, current]);
                setCurrent("");
            }
        } else if (key === "Backspace") {
            setCurrent(current.slice(0, -1));
        } else if (current.length < LENGTH) {
            setCurrent(current + key.toLowerCase());
        }
    }

    function newWord() {
        // Skipping a word you've started breaks the streak.
        if (!over && guesses.length) {
            setStreak(0);
            saveStreak(0);
        }
        setAnswer(pickAnswer(answer));
        setGuesses([]);
        setCurrent("");
        setNote("");
    }

    // Best state seen for each letter, for colouring the keyboard.
    const keyStates = {};
    for (const guess of guesses) {
        scoreGuess(guess, answer).forEach((state, i) => {
            const letter = guess[i];
            if (!keyStates[letter] || RANK[state] > RANK[keyStates[letter]]) keyStates[letter] = state;
        });
    }

    const rows = Array.from({length: ROWS}, (_, r) => {
        if (r < guesses.length) return {letters: guesses[r], states: scoreGuess(guesses[r], answer)};
        if (r === guesses.length && !over) return {letters: current, states: []};
        return {letters: "", states: []};
    });

    let status;
    if (won) status = <>Got it in <em>{guesses.length}</em>{guesses.length === 1 ? " try" : " tries"}!</>;
    else if (lost) status = <>The word was <em>{answer.toUpperCase()}</em></>;
    else if (note) status = note;
    else status = `Guess ${guesses.length + 1} of ${ROWS}`;

    return (
        <div className={style.game} style={{"--board-reserve": "510px"}}>
            <p className={style.status} aria-live="polite">{status}</p>
            <div className={wg.board} role="grid" aria-label="Guesses">
                {rows.map((row, r) => (
                    <div key={r} className={wg.row} role="row">
                        {Array.from({length: LENGTH}, (_, i) => {
                            const letter = row.letters[i];
                            const state = row.states[i];
                            return (
                                <span key={i} role="gridcell" aria-label={letter ? `${letter.toUpperCase()}${state ? `, ${state}` : ""}` : "Empty"}
                                      className={cx(wg.tile, letter && wg.filled, state && wg[state])}>
                                    {letter}
                                </span>
                            );
                        })}
                    </div>
                ))}
            </div>
            <div className={wg.keyboard}>
                {KEY_ROWS.map((keys, r) => (
                    <div key={r} className={wg.keyRow}>
                        {r === 2 ? (
                            <button type="button" className={cx(wg.key, wg.wide)} onClick={() => press("Enter")}>Enter</button>
                        ) : null}
                        {[...keys].map((k) => (
                            <button key={k} type="button" className={cx(wg.key, keyStates[k] && wg[keyStates[k]])}
                                    onClick={() => press(k)}>{k}</button>
                        ))}
                        {r === 2 ? (
                            <button type="button" aria-label="Delete letter" className={cx(wg.key, wg.wide)}
                                    onClick={() => press("Backspace")}>⌫</button>
                        ) : null}
                    </div>
                ))}
            </div>
            <div className={style.scores}>
                <span className={style.score}><strong>{streak}</strong>STREAK</span>
            </div>
            <button type="button" className={style.button} onClick={newWord}>
                {over ? "Next word" : "New word"}
            </button>
        </div>
    );
}
