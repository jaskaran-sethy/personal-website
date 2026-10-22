import {useEffect, useState} from "react";
import cx from "../../lib/cx";
import style from "./games.module.css";
import own from "./connectFour.module.css";

const COLS = 7;
const ROWS = 6;
const EMPTY = Array(COLS * ROWS).fill(null);
const CENTRE_FIRST = [3, 2, 4, 1, 5, 0, 6];
const DEPTH = 4;

// Every run of four squares that can win: across, down and both diagonals.
const LINES = [];
for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
        for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
            const er = r + dr * 3;
            const ec = c + dc * 3;
            if (er < ROWS && ec >= 0 && ec < COLS) LINES.push([0, 1, 2, 3].map((k) => (r + dr * k) * COLS + c + dc * k));
        }
    }
}

// Returns the winning mark and its four squares, or null. "P" is gold (you), "C" is silver.
function findWinner(board) {
    for (const line of LINES) {
        const [a, b, c, d] = line;
        if (board[a] && board[a] === board[b] && board[a] === board[c] && board[a] === board[d]) return {mark: board[a], line};
    }
    return null;
}

// The lowest empty row in a column, or -1 when it's full.
function openRow(board, col) {
    for (let r = ROWS - 1; r >= 0; r--) if (!board[r * COLS + col]) return r;
    return -1;
}

function drop(board, col, mark) {
    const index = openRow(board, col) * COLS + col;
    return board.map((cell, i) => i === index ? mark : cell);
}

// A rough score for the computer: centre discs, plus open threes and twos, minus the player's.
function evaluate(board) {
    let score = 0;
    for (let r = 0; r < ROWS; r++) if (board[r * COLS + 3] === "C") score += 3;
    for (const line of LINES) {
        const mine = line.filter((i) => board[i] === "C").length;
        const theirs = line.filter((i) => board[i] === "P").length;
        if (mine && theirs) continue;
        if (mine === 3) score += 5;
        else if (mine === 2) score += 2;
        else if (theirs === 3) score -= 4;
        else if (theirs === 2) score -= 1;
    }
    return score;
}

// Depth-limited minimax with alpha-beta pruning. Quicker wins and slower losses score better.
function search(board, depth, alpha, beta, computerToMove) {
    const winner = findWinner(board);
    if (winner) return winner.mark === "C" ? 1000 + depth : -1000 - depth;
    if (board.every(Boolean)) return 0;
    if (depth === 0) return evaluate(board);
    const mark = computerToMove ? "C" : "P";
    let best = computerToMove ? -Infinity : Infinity;
    for (const col of CENTRE_FIRST) {
        if (openRow(board, col) < 0) continue;
        const score = search(drop(board, col, mark), depth - 1, alpha, beta, !computerToMove);
        if (computerToMove) {
            best = Math.max(best, score);
            alpha = Math.max(alpha, score);
        } else {
            best = Math.min(best, score);
            beta = Math.min(beta, score);
        }
        if (alpha >= beta) break;
    }
    return best;
}

// Computer (C): win if it can, block if it must, otherwise search a few moves ahead, centre first on ties.
function pickMove(board) {
    const open = CENTRE_FIRST.filter((col) => openRow(board, col) >= 0);
    for (const mark of ["C", "P"]) {
        const col = open.find((c) => findWinner(drop(board, c, mark)));
        if (col !== undefined) return col;
    }
    let bestCol = open[0];
    let bestScore = -Infinity;
    for (const col of open) {
        const score = search(drop(board, col, "C"), DEPTH - 1, -Infinity, Infinity, false);
        if (score > bestScore) {
            bestScore = score;
            bestCol = col;
        }
    }
    return bestCol;
}

export default function ConnectFour() {
    const [board, setBoard] = useState(EMPTY);
    const [last, setLast] = useState(null);
    const [vsComputer, setVsComputer] = useState(true);
    const [scores, setScores] = useState({P: 0, C: 0, draw: 0});

    const winner = findWinner(board);
    const full = board.every(Boolean);
    const over = Boolean(winner) || full;
    const turn = board.filter(Boolean).length % 2 === 0 ? "P" : "C";
    const computerTurn = vsComputer && turn === "C" && !over;

    useEffect(() => {
        if (!over) return;
        setScores((s) => winner ? {...s, [winner.mark]: s[winner.mark] + 1} : {...s, draw: s.draw + 1});
    }, [over]);

    useEffect(() => {
        if (!computerTurn) return;
        const timer = setTimeout(() => play(pickMove(board)), 450);
        return () => clearTimeout(timer);
    }, [computerTurn, board]);

    function play(col) {
        const row = openRow(board, col);
        if (over || row < 0) return;
        setBoard(drop(board, col, turn));
        setLast(row * COLS + col);
    }

    function reset() {
        setBoard(EMPTY);
        setLast(null);
    }

    function switchMode(computer) {
        setVsComputer(computer);
        setScores({P: 0, C: 0, draw: 0});
        reset();
    }

    const name = (mark) => mark === "P" ? "Gold" : "Silver";
    let status;
    if (winner) status = vsComputer ? (winner.mark === "P" ? <>You <em>win!</em></> : "The computer wins") : <><em>{name(winner.mark)}</em> wins!</>;
    else if (full) status = "It's a draw";
    else if (computerTurn) status = "Computer is thinking…";
    else status = vsComputer ? "Your move" : <><em>{name(turn)}</em> to play</>;

    return (
        <div className={style.game}>
            <div className={style.controls}>
                <button type="button" className={cx(style.button, vsComputer && style.buttonActive)}
                        onClick={() => switchMode(true)}>vs Computer</button>
                <button type="button" className={cx(style.button, !vsComputer && style.buttonActive)}
                        onClick={() => switchMode(false)}>2 Players</button>
            </div>
            <p className={style.status} aria-live="polite">{status}</p>
            <div className={own.board}>
                {Array.from({length: COLS}, (_, col) => {
                    const filled = ROWS - 1 - openRow(board, col);
                    return (
                        <button key={col} type="button" className={cx(own.column, !over && !computerTurn && own[`hover${turn}`])}
                                aria-label={`Column ${col + 1}, ${filled === ROWS ? "full" : `${filled} of ${ROWS} filled`}`}
                                disabled={over || computerTurn || openRow(board, col) < 0} onClick={() => play(col)}>
                            {Array.from({length: ROWS}, (_, row) => {
                                const i = row * COLS + col;
                                return (
                                    <span key={row} className={own.slot}>
                                        {board[i] ? (
                                            <span style={i === last ? {"--fall": row + 1} : undefined}
                                                  className={cx(own.disc, board[i] === "P" ? own.gold : own.silver,
                                                      i === last && own.dropped, winner?.line.includes(i) && own.win)}/>
                                        ) : null}
                                    </span>
                                );
                            })}
                        </button>
                    );
                })}
            </div>
            <div className={style.scores}>
                <span className={style.score}><strong>{scores.P}</strong>{vsComputer ? "YOU" : "GOLD"}</span>
                <span className={style.score}><strong>{scores.draw}</strong>DRAWS</span>
                <span className={style.score}><strong>{scores.C}</strong>{vsComputer ? "COMPUTER" : "SILVER"}</span>
            </div>
            <button type="button" className={style.button} onClick={reset}>
                {over ? "Play again" : "Restart"}
            </button>
        </div>
    );
}
