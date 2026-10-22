import {useEffect, useRef} from "react";

// Keyboard and swipe input shared by the games.

function isTyping(target) {
    return target instanceof Element && Boolean(target.closest("input, textarea, [contenteditable='true']"));
}

// Arrow keys and WASD as directions, for games that steer or slide.
export const DIRECTION_KEYS = {
    ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
    w: "up", s: "down", a: "left", d: "right",
};

// Calls `onKey(key, event)` for keydowns anywhere on the page, except while typing into a field or holding
// Ctrl/Cmd/Alt (so browser shortcuts keep working). Single-character keys arrive lowercased. The latest
// `onKey` is always used, so callers don't need to manage dependencies. Pass `enabled: false` to pause it.
export function useGameKeys(onKey, enabled = true) {
    const handler = useRef(onKey);
    handler.current = onKey;
    useEffect(() => {
        if (!enabled) return;
        function listener(e) {
            if (e.ctrlKey || e.metaKey || e.altKey || isTyping(e.target)) return;
            handler.current(e.key.length === 1 ? e.key.toLowerCase() : e.key, e);
        }
        window.addEventListener("keydown", listener);
        return () => window.removeEventListener("keydown", listener);
    }, [enabled]);
}

// Swipes with a mouse drag, touch or pen. Returns an onPointerDown handler to put on the board; `onSwipe`
// gets "up" | "down" | "left" | "right". The release is watched on window, so a drag that ends off the board
// still counts. Presses on buttons inside the board aren't swipes, and movements under `threshold` px are
// ignored so a plain click or tap does nothing.
export function useSwipe(onSwipe, threshold = 24) {
    const handler = useRef(onSwipe);
    handler.current = onSwipe;
    return function onPointerDown(e) {
        if (e.button !== 0 || e.target.closest("button")) return;
        const start = {x: e.clientX, y: e.clientY};
        function onUp(up) {
            window.removeEventListener("pointerup", onUp);
            window.removeEventListener("pointercancel", onUp);
            if (up.type === "pointercancel") return;
            const dx = up.clientX - start.x;
            const dy = up.clientY - start.y;
            if (Math.max(Math.abs(dx), Math.abs(dy)) < threshold) return;
            if (Math.abs(dx) > Math.abs(dy)) handler.current(dx > 0 ? "right" : "left");
            else handler.current(dy > 0 ? "down" : "up");
        }
        window.addEventListener("pointerup", onUp);
        window.addEventListener("pointercancel", onUp);
    };
}
