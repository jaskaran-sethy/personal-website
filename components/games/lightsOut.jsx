import {useEffect, useState} from "react";
import cx from "../../lib/cx";
import {shuffle} from "../../lib/random";
import style from "./games.module.css";
import {GameButton, Stat, Stats, Status} from "./kit";
import lo from "./lightsOut.module.css";

const SIZE = 5;
const OFF = Array(SIZE * SIZE).fill(false);

// Flips a cell and its orthogonal neighbours.
function toggle(grid, index) {
    const row = Math.floor(index / SIZE);
    const col = index % SIZE;
    const next = [...grid];
    for (const [r, c] of [[row, col], [row - 1, col], [row + 1, col], [row, col - 1], [row, col + 1]]) {
        if (r >= 0 && r < SIZE && c >= 0 && c < SIZE) next[r * SIZE + c] = !next[r * SIZE + c];
    }
    return next;
}

// Presses random cells starting from all-off, so every puzzle can be undone, i.e. solved.
// Later levels press more cells.
function makePuzzle(level) {
    const presses = Math.min(3 + level * 2, 15);
    let grid;
    do {
        grid = OFF;
        const cells = shuffle(OFF.keys()).slice(0, presses);
        for (const cell of cells) grid = toggle(grid, cell);
    } while (grid.every((on) => !on));
    return grid;
}

export default function LightsOut() {
    // Generated in an effect, so the server render and first client render agree.
    const [start, setStart] = useState(null);
    const [grid, setGrid] = useState(OFF);
    const [level, setLevel] = useState(1);
    const [moves, setMoves] = useState(0);

    const ready = start !== null;
    const solved = ready && grid.every((on) => !on);
    const litCount = grid.filter(Boolean).length;

    useEffect(() => {
        newPuzzle(1);
    }, []);

    function newPuzzle(atLevel) {
        const puzzle = makePuzzle(atLevel);
        setLevel(atLevel);
        setStart(puzzle);
        setGrid(puzzle);
        setMoves(0);
    }

    function press(index) {
        if (!ready || solved) return;
        setGrid(toggle(grid, index));
        setMoves(moves + 1);
    }

    function resetLevel() {
        setGrid(start);
        setMoves(0);
    }

    let status;
    if (!ready) status = "Turn every light off";
    else if (solved) status = <>Level {level} cleared in <em>{moves}</em> {moves === 1 ? "move" : "moves"}</>;
    else status = <><em>{litCount}</em> {litCount === 1 ? "light" : "lights"} still on</>;

    return (
        <div className={style.game}>
            <Status>{status}</Status>
            <div className={lo.board}>
                {grid.map((on, i) => (
                    <button key={i} type="button" aria-pressed={on}
                            aria-label={`Row ${Math.floor(i / SIZE) + 1}, column ${(i % SIZE) + 1}, ${on ? "on" : "off"}`}
                            className={cx(lo.cell, on && lo.on)} disabled={!ready || solved} onClick={() => press(i)}/>
                ))}
            </div>
            <Stats>
                <Stat value={level} label="LEVEL"/>
                <Stat value={moves} label="MOVES"/>
            </Stats>
            <div className={style.controls}>
                {solved ? (
                    <GameButton active onClick={() => newPuzzle(level + 1)}>
                        Next level
                    </GameButton>
                ) : (
                    <>
                        <GameButton onClick={resetLevel} disabled={!ready}>Reset level</GameButton>
                        <GameButton onClick={() => newPuzzle(level)}>New puzzle</GameButton>
                    </>
                )}
            </div>
        </div>
    );
}
