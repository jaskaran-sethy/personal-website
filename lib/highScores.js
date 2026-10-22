import {useEffect, useState} from "react";
import {readNumber, writeNumber} from "./storage";

// Personal bests for /games, kept in this browser's localStorage under "games.<name>.best".

export function readHighScore(key) {
    return readNumber(key) || null;
}

// Saves `value` if it beats the stored score. Some games count down (moves, ms, seconds), so lower wins there.
// Returns whether it was a new best.
export function saveHighScore(key, value, lowerIsBetter = false) {
    const best = readHighScore(key);
    const beats = best === null || (lowerIsBetter ? value < best : value > best);
    if (!beats || !value) return false;
    writeNumber(key, value);
    return true;
}

// A game's best score plus a way to submit a finished result: `record(value)` saves it if it beats the best.
// The best is read in an effect, so the server render and first client render agree.
export function useHighScore(key, lowerIsBetter = false) {
    const [best, setBest] = useState(null);
    useEffect(() => {
        setBest(readHighScore(key));
    }, [key]);
    function record(value) {
        if (saveHighScore(key, value, lowerIsBetter)) setBest(value);
    }
    return [best, record];
}
