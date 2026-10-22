// Small randomness helpers for the games.

export function randomBetween(min, max) {
    return min + Math.random() * (max - min);
}

export function randomInt(below) {
    return Math.floor(Math.random() * below);
}

export function pick(items) {
    return items[randomInt(items.length)];
}

// A shuffled copy (Fisher–Yates), so every order is equally likely. Sorting by a random comparator isn't.
export function shuffle(items) {
    const out = [...items];
    for (let i = out.length - 1; i > 0; i--) {
        const j = randomInt(i + 1);
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
}
