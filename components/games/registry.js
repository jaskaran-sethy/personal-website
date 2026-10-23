import dynamic from "next/dynamic";

// Every game on /games, in grid order. Each game loads only when it's opened, so the tile grid stays light.
export const GAMES = [
    {id: "tic-tac-toe", name: "Tic Tac Toe", glyph: "×○", blurb: "Beat the computer on Easy. Try to draw on Hard.",
        Game: dynamic(() => import("./ticTacToe"))},
    {id: "memory", name: "Memory Match", glyph: "♠♥", blurb: "Find all eight pairs in as few moves as you can.",
        Game: dynamic(() => import("./memoryMatch"))},
    {id: "reaction", name: "Reaction Time", glyph: "↯", blurb: "Wait for gold, then click as fast as you can.",
        Game: dynamic(() => import("./reactionTime"))},
    {id: "snake", name: "Snake", glyph: "∿", blurb: "Eat, grow, and don't bite your own tail.",
        Game: dynamic(() => import("./snake"))},
    {id: "2048", name: "2048", glyph: "2048", blurb: "Slide and merge tiles until you reach 2048.",
        Game: dynamic(() => import("./game2048"))},
    {id: "minesweeper", name: "Minesweeper", glyph: "✹", blurb: "Clear the field without hitting one of ten mines.",
        Game: dynamic(() => import("./minesweeper"))},
    {id: "connect-four", name: "Connect Four", glyph: "○●", blurb: "Drop discs and line up four before the computer does.",
        Game: dynamic(() => import("./connectFour"))},
    {id: "sliding-puzzle", name: "Sliding Puzzle", glyph: "15", blurb: "Slide the tiles back into order, 1 to 15.",
        Game: dynamic(() => import("./slidingPuzzle"))},
    {id: "word-guess", name: "Word Guess", glyph: "Aa", blurb: "Find the five-letter word in six guesses.",
        Game: dynamic(() => import("./wordGuess"))},
    {id: "simon", name: "Simon", glyph: "◐", blurb: "Watch the pattern, then play it back. It keeps growing.",
        Game: dynamic(() => import("./simon"))},
    {id: "lights-out", name: "Lights Out", glyph: "☼", blurb: "Each tap flips a light and its neighbours. Turn them all off.",
        Game: dynamic(() => import("./lightsOut"))},
    {id: "whack-a-mole", name: "Whack-a-Mole", glyph: "◉", blurb: "Thirty seconds. Hit every mole you can.",
        Game: dynamic(() => import("./whackAMole"))},
    {id: "typing", name: "Typing Test", glyph: "wpm", blurb: "How many words a minute can you type?",
        Game: dynamic(() => import("./typingTest"))},
    {id: "aura-farm", name: "Aura Farm", glyph: "✦", section: "esoteric",
        blurb: "Stay still to farm aura. Good calls double your multiplier; bad ones reset it.",
        Game: dynamic(() => import("./auraFarm"))},
    {id: "aura-farm-idle", name: "Aura Farm Idle", glyph: "✧", section: "esoteric",
        blurb: "Farm aura even while you're away. Build habits, buy upgrades, touch grass.",
        Game: dynamic(() => import("./auraIdle"))},
    {id: "insight-extractor", name: "Insight Extractor", glyph: "❝", section: "tools",
        blurb: "Paste feedback; get insights by topic and sentiment, like Sprinklr's Product Insights.",
        Game: dynamic(() => import("./insightExtractor"))},
];

export const SECTIONS = [
    {id: "normal", title: "Normal games", short: "Normal", blurb: "The classics. Rules you already know."},
    {id: "esoteric", title: "Esoteric games", short: "Esoteric", blurb: "Stranger ones, with rules you'll have to work out."},
    // Not games: `tools` keeps them out of the games' Next chain (see nextGame).
    {id: "tools", title: "Useful tools", short: "Tools", blurb: "Not games at all. Small things that do a real job.", tools: true},
];

const sectionOf = (game) => SECTIONS.find((section) => section.id === (game.section ?? "normal"));

export const isTool = (game) => Boolean(sectionOf(game).tools);

// The games list, opened on a section (the first section is the default, so it needs no query).
export function sectionPath(sectionId) {
    return sectionId === SECTIONS[0].id ? "/games" : `/games?section=${sectionId}`;
}

// The games in one section, in grid order. Games without a `section` are normal.
export function gamesIn(sectionId) {
    return GAMES.filter((game) => (game.section ?? "normal") === sectionId);
}

// Each game lives at its own URL, e.g. /games/aura-farm.
export function gamePath(id) {
    return `/games/${id}`;
}

export function findGame(id) {
    return GAMES.find((game) => game.id === id);
}

// The one after this, wrapping from the last back to the first: games lead on to games (across sections), tools to
// tools. Null when there's nothing else to go to.
export function nextGame(game) {
    const pool = GAMES.filter((other) => isTool(other) === isTool(game));
    return pool.length > 1 ? pool[(pool.indexOf(game) + 1) % pool.length] : null;
}
