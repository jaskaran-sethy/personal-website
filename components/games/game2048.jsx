import {useEffect, useState} from "react";
import cx from "../../lib/cx";
import {useHighScore} from "../../lib/highScores";
import {pick} from "../../lib/random";
import {DIRECTION_KEYS, useGameKeys, useSwipe} from "./hooks";
import {GameButton, Stat, Stats, Status} from "./kit";
import style from "./games.module.css";
import own from "./game2048.module.css";

const BEST_KEY = "games.2048.best";
const ROWS = [0, 1, 2, 3].map((r) => [0, 1, 2, 3].map((c) => r * 4 + c));
const COLS = [0, 1, 2, 3].map((c) => [0, 1, 2, 3].map((r) => r * 4 + c));
// Each line is listed in the order tiles slide towards, so index 0 is the wall they pile against.
const LINES = {
    left: ROWS,
    right: ROWS.map((line) => [...line].reverse()),
    up: COLS,
    down: COLS.map((line) => [...line].reverse()),
};

let nextId = 1;

// Tiles are objects with a stable id, so React keeps the same element and CSS can animate it to its new square.
// A merge slides both tiles onto the same square, marks them `gone`, and adds a new doubled tile there that pops in.
// `gone` tiles stay rendered underneath until the next move, which is when they're dropped.
function liveTiles(tiles) {
    return tiles.filter((t) => !t.gone);
}

function toBoard(tiles) {
    const board = Array(16).fill(null);
    for (const t of liveTiles(tiles)) board[t.pos] = t;
    return board;
}

function slide(tiles, dir) {
    const board = toBoard(tiles);
    const out = [];
    let gained = 0;
    let moved = false;
    for (const line of LINES[dir]) {
        const row = line.map((i) => board[i]).filter(Boolean);
        let k = 0;
        for (let j = 0; j < row.length; j++) {
            const target = line[k++];
            const tile = row[j];
            const partner = row[j + 1];
            if (partner && partner.value === tile.value) {
                out.push({...tile, pos: target, gone: true}, {...partner, pos: target, gone: true});
                out.push({id: nextId++, value: tile.value * 2, pos: target, merged: true});
                gained += tile.value * 2;
                moved = true;
                j++;
            } else {
                if (tile.pos !== target) moved = true;
                out.push({...tile, pos: target, merged: false, fresh: false});
            }
        }
    }
    return {tiles: out, gained, moved};
}

// Drops a 2 (or, one time in ten, a 4) on a random empty square.
function addTile(tiles) {
    const taken = new Set(liveTiles(tiles).map((t) => t.pos));
    const empty = [...Array(16).keys()].filter((i) => !taken.has(i));
    const pos = pick(empty);
    return [...tiles, {id: nextId++, value: Math.random() < 0.1 ? 4 : 2, pos, fresh: true}];
}

function canMove(tiles) {
    const board = toBoard(tiles).map((t) => t?.value ?? 0);
    if (board.includes(0)) return true;
    return board.some((v, i) => (i % 4 < 3 && v === board[i + 1]) || (i < 12 && v === board[i + 4]));
}

function freshGame() {
    return {tiles: addTile(addTile([])), score: 0, gained: 0, turn: 0};
}

export default function Game2048() {
    // Tiles are dealt in an effect, so the server render and first client render agree.
    const [game, setGame] = useState({tiles: [], score: 0, gained: 0, turn: 0});
    const [keepGoing, setKeepGoing] = useState(false);
    const [best, recordBest] = useHighScore(BEST_KEY);

    const live = liveTiles(game.tiles);
    const started = live.length > 0;
    const won = !keepGoing && live.some((t) => t.value === 2048);
    const lost = started && !canMove(game.tiles);
    const blocked = won || lost;

    useEffect(() => {
        setGame(freshGame());
    }, []);

    useGameKeys((key, e) => {
        const dir = DIRECTION_KEYS[key];
        if (!dir) return;
        e.preventDefault();
        move(dir);
    }, !blocked);

    function move(dir) {
        if (blocked) return;
        const result = slide(game.tiles, dir);
        if (!result.moved) return;
        const score = game.score + result.gained;
        setGame({tiles: addTile(result.tiles), score, gained: result.gained, turn: game.turn + 1});
        recordBest(score);
    }

    // Swipes: mouse drags, touch and pens. Presses on the overlay's buttons aren't swipes.
    const onSwipe = useSwipe(move);

    function newGame() {
        setGame(freshGame());
        setKeepGoing(false);
    }

    let status;
    if (won) status = <>You made <em>2048!</em></>;
    else if (lost) status = "No moves left";
    else status = "Slide to merge the tiles";

    return (
        <div className={style.game}>
            <Status>{status}</Status>
            <div className={own.board} onPointerDown={onSwipe}
                 role="group" aria-label="2048 board">
                {Array.from({length: 16}, (_, i) => <div key={i} className={own.cell}/>)}
                <div className={own.tiles}>
                    {game.tiles.map((t) => (
                        <div key={t.id} style={{"--x": t.pos % 4, "--y": Math.floor(t.pos / 4)}}
                             className={cx(own.tile, t.gone && own.gone)}>
                            <span className={cx(own.face, own[`v${t.value}`] || own.vBig,
                                own[`digits${String(t.value).length}`], t.fresh && own.fresh, t.merged && own.merged)}>
                                {t.value}
                            </span>
                        </div>
                    ))}
                </div>
                {blocked ? (
                    <div className={own.overlay}>
                        <p>{won ? "You win!" : "Game over"}</p>
                        <div className={style.controls}>
                            {won ? (
                                <GameButton active onClick={() => setKeepGoing(true)}>Keep going</GameButton>
                            ) : null}
                            <GameButton onClick={newGame}>New game</GameButton>
                        </div>
                    </div>
                ) : null}
            </div>
            <Stats>
                <Stat className={own.scoreBox} value={game.score.toLocaleString()} label={<>
                    SCORE
                    {game.gained ? <span key={game.turn} className={own.gain}>+{game.gained}</span> : null}
                </>}/>
                <Stat value={best ? best.toLocaleString() : "–"} label="BEST"/>
            </Stats>
            <GameButton onClick={newGame}>New game</GameButton>
        </div>
    );
}
