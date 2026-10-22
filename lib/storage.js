import {useEffect, useState} from "react";

// Numbers and small objects kept in this browser's localStorage. Storage can be unavailable (private windows, blocked site data),
// so every read and write is guarded and simply falls back.

export function readNumber(key) {
    try {
        const value = localStorage.getItem(key);
        return value === null ? null : Number(value);
    } catch {
        return null;
    }
}

export function writeNumber(key, value) {
    try {
        localStorage.setItem(key, String(value));
    } catch {
        // It just won't persist.
    }
}

// A whole object (e.g. a game's save), stored as JSON. A missing or unreadable value reads as null.
export function readJSON(key) {
    try {
        const value = localStorage.getItem(key);
        return value === null ? null : JSON.parse(value);
    } catch {
        return null;
    }
}

export function writeJSON(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // It just won't persist.
    }
}

// A number that survives reloads. Starts at `fallback` and is read in an effect, so the server render and the
// first client render agree.
export function useStoredNumber(key, fallback = 0) {
    const [value, setValue] = useState(fallback);
    useEffect(() => {
        setValue(readNumber(key) ?? fallback);
    }, [key]);
    function update(next) {
        setValue(next);
        writeNumber(key, next);
    }
    return [value, update];
}
