import dynamic from "next/dynamic";
import {CATALOG, SECTIONS} from "./catalog";

export {SECTIONS};

// Each game's component, loaded only when it's opened, so the tile grid stays light.
const COMPONENTS = {
    "tic-tac-toe": dynamic(() => import("./ticTacToe")),
    "memory": dynamic(() => import("./memoryMatch")),
    "reaction": dynamic(() => import("./reactionTime")),
    "snake": dynamic(() => import("./snake")),
    "2048": dynamic(() => import("./game2048")),
    "minesweeper": dynamic(() => import("./minesweeper")),
    "connect-four": dynamic(() => import("./connectFour")),
    "sliding-puzzle": dynamic(() => import("./slidingPuzzle")),
    "word-guess": dynamic(() => import("./wordGuess")),
    "simon": dynamic(() => import("./simon")),
    "lights-out": dynamic(() => import("./lightsOut")),
    "whack-a-mole": dynamic(() => import("./whackAMole")),
    "typing": dynamic(() => import("./typingTest")),
    "aura-farm": dynamic(() => import("./auraFarm")),
    "aura-farm-idle": dynamic(() => import("./auraIdle")),
    "insight-extractor": dynamic(() => import("./insightExtractor")),
    "portfolio-calculator": dynamic(() => import("./portfolioCalculator")),
};

// Every game on /games, in grid order (see catalog.js), with its component.
export const GAMES = CATALOG.map((game) => ({...game, Game: COMPONENTS[game.id]}));

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
