// Personal bests for /games, kept in this browser's localStorage under "games.<name>.best".

export function readHighScore(key) {
    try {
        const value = Number(localStorage.getItem(key));
        return value || null;
    } catch {
        return null;
    }
}

// Saves `value` if it beats the stored score. Some games count down (moves, ms, seconds), so lower wins there.
export function saveHighScore(key, value, lowerIsBetter = false) {
    const best = readHighScore(key);
    const beats = best === null || (lowerIsBetter ? value < best : value > best);
    if (!beats || !value) return;
    try {
        localStorage.setItem(key, String(value));
    } catch {
        // The score just won't persist.
    }
}
