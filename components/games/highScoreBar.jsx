import {useEffect, useState} from "react";
import cx from "../../lib/cx";
import {readHighScore} from "../../lib/highScores";
import Icon from "../site/icon";
import style from "./highScoreBar.module.css";

// How each game's high score is stored and read out. `lower` marks games where a smaller number wins.
// Games you could push forever just by grinding (Tic Tac Toe, Connect Four, Word Guess, Lights Out) have none.
const SCORES = {
    "memory": {key: "games.memory.best", unit: ["move", "moves"], lower: true},
    "reaction": {key: "games.reaction.best", unit: ["ms average", "ms average"], lower: true},
    "snake": {key: "games.snake.best", unit: ["point", "points"]},
    "2048": {key: "games.2048.best", unit: ["point", "points"]},
    "minesweeper": {key: "games.minesweeper.best", unit: ["second", "seconds"], lower: true},
    "sliding-puzzle": {key: "games.sliding.best", unit: ["move", "moves"], lower: true},
    "simon": {key: "games.simon.best", unit: ["round", "rounds"]},
    "whack-a-mole": {key: "games.moles.best", unit: ["mole", "moles"]},
    "typing": {key: "games.typing.best", unit: ["wpm", "wpm"]},
    "aura-farm": {key: "games.aura.best", unit: ["aura", "aura"]},
};

// Jaskaran's own bests. null shows as "—" until a score is filled in.
const JASKARAN_SCORES = {
    "memory": 13,
    "reaction": 242,
    "snake": 56,
    "2048": 47932,
    "minesweeper": 14,
    "sliding-puzzle": null,
    "simon": 32,
    "whack-a-mole": 46,
    "typing": 141,
    "aura-farm": 264512,
};

export function hasHighScore(gameId) {
    return gameId in SCORES;
}

function format(value, unit) {
    return `${value.toLocaleString()} ${value === 1 ? unit[0] : unit[1]}`;
}

export default function HighScoreBar({gameId, gameName}) {
    const config = SCORES[gameId];
    const jaskaran = JASKARAN_SCORES[gameId];
    const [mine, setMine] = useState(null);
    const [shared, setShared] = useState("");

    // Games save their own bests as you play, so re-read every second to pick up a new one.
    useEffect(() => {
        const update = () => setMine(readHighScore(config.key));
        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [config.key]);

    useEffect(() => {
        if (!shared) return;
        const timer = setTimeout(() => setShared(""), 2500);
        return () => clearTimeout(timer);
    }, [shared]);

    const beatJaskaran = mine !== null && jaskaran !== null && (config.lower ? mine < jaskaran : mine > jaskaran);

    async function share() {
        const url = `${window.location.origin}/games?game=${gameId}`;
        const text = `My high score in ${gameName}: ${format(mine, config.unit)}. Can you beat it?`;
        const data = {title: `${gameName} high score`, text, url};
        // Phones and tablets get the system share sheet; computers just copy, which is what people expect there.
        // share() must run straight from the tap (no await before it), or the browser refuses it.
        const touch = window.matchMedia("(pointer: coarse)").matches;
        if (touch && navigator.share && (!navigator.canShare || navigator.canShare(data))) {
            try {
                await navigator.share(data);
                return;
            } catch (error) {
                if (error.name === "AbortError") return;
            }
        }
        try {
            await navigator.clipboard.writeText(`${text} ${url}`);
            setShared("Copied to clipboard");
        } catch {
            setShared("Couldn't copy, sorry");
        }
    }

    return (
        <div className={style.bar}>
            <div className={style.score}>
                <span className={style.label}>MY HIGH SCORE</span>
                <span className={cx(style.value, mine === null && style.empty)}>
                    {mine === null ? "Not set yet" : format(mine, config.unit)}
                </span>
            </div>
            <div className={style.score}>
                <span className={style.label}>JASKARAN'S HIGH SCORE</span>
                <span className={cx(style.value, jaskaran === null && style.empty)}>
                    {jaskaran === null ? "—" : format(jaskaran, config.unit)}
                </span>
            </div>
            <div className={style.actions}>
                {beatJaskaran ? <span className={style.badge}>You beat Jaskaran!</span> : null}
                <button type="button" className={style.share} onClick={share} disabled={mine === null}
                        title={mine === null ? "Play a game to set a high score first" : undefined}>
                    <Icon name="share" size={15}/> {shared || "Share my score"}
                </button>
            </div>
        </div>
    );
}
