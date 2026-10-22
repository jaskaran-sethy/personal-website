import {useEffect, useState} from "react";
import cx from "../../lib/cx";
import style from "./games.module.css";

const LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
];
const EMPTY = Array(9).fill(null);

// Returns the winning mark and its line, or null.
function findWinner(board) {
    for (const line of LINES) {
        const [a, b, c] = line;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) return {mark: board[a], line};
    }
    return null;
}

// Easy computer (O): win if it can, block X if it must, then centre, corners, edges.
// Beatable on purpose: it never sees a fork (corner, then the opposite corner).
function pickEasyMove(board) {
    for (const mark of ["O", "X"]) {
        for (const [a, b, c] of LINES) {
            const marks = [board[a], board[b], board[c]];
            const gap = [a, b, c][marks.indexOf(null)];
            if (marks.filter((m) => m === mark).length === 2 && gap !== undefined) return gap;
        }
    }
    const open = (cells) => cells.filter((i) => !board[i]);
    const corners = open([0, 2, 6, 8]);
    if (!board[4]) return 4;
    if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
    return open([1, 3, 5, 7])[0];
}

// Scores a board for O by searching every remaining game: +10 for an O win, -10 for an X win,
// less the moves it takes, so O wins sooner and loses later. Tic Tac Toe is small enough to search fully.
function minimax(board, turn, depth) {
    const winner = findWinner(board);
    if (winner) return winner.mark === "O" ? 10 - depth : depth - 10;
    if (board.every(Boolean)) return 0;
    const next = turn === "O" ? "X" : "O";
    const scores = board.flatMap((cell, i) => cell ? [] : [minimax(board.map((c, j) => j === i ? turn : c), next, depth + 1)]);
    return turn === "O" ? Math.max(...scores) : Math.min(...scores);
}

// Hard computer (O): always picks a best move, so it never loses. Ties are broken randomly for variety.
function pickHardMove(board) {
    const moves = board.flatMap((cell, i) => cell ? [] : [{i, score: minimax(board.map((c, j) => j === i ? "O" : c), "X", 1)}]);
    const top = Math.max(...moves.map((m) => m.score));
    const best = moves.filter((m) => m.score === top);
    return best[Math.floor(Math.random() * best.length)].i;
}

export default function TicTacToe() {
    const [board, setBoard] = useState(EMPTY);
    const [vsComputer, setVsComputer] = useState(true);
    const [hard, setHard] = useState(false);
    const [scores, setScores] = useState({X: 0, O: 0, draw: 0});

    const winner = findWinner(board);
    const full = board.every(Boolean);
    const over = Boolean(winner) || full;
    const turn = board.filter(Boolean).length % 2 === 0 ? "X" : "O";
    const computerTurn = vsComputer && turn === "O" && !over;

    useEffect(() => {
        if (!over) return;
        setScores((s) => winner ? {...s, [winner.mark]: s[winner.mark] + 1} : {...s, draw: s.draw + 1});
    }, [over]);

    useEffect(() => {
        if (!computerTurn) return;
        const timer = setTimeout(() => play(hard ? pickHardMove(board) : pickEasyMove(board)), 450);
        return () => clearTimeout(timer);
    }, [computerTurn, board, hard]);

    function play(index) {
        if (over || board[index]) return;
        setBoard(board.map((cell, i) => i === index ? turn : cell));
    }

    // Changing opponent or difficulty starts a fresh match.
    function switchMode(computer, hardMode = hard) {
        setVsComputer(computer);
        setHard(hardMode);
        setScores({X: 0, O: 0, draw: 0});
        setBoard(EMPTY);
    }

    let status;
    if (winner) status = vsComputer ? (winner.mark === "X" ? <>You <em>win!</em></> : "The computer wins") : <><em>{winner.mark}</em> wins!</>;
    else if (full) status = "It's a draw";
    else if (computerTurn) status = "Computer is thinking…";
    else status = vsComputer ? "Your move" : <><em>{turn}</em> to play</>;

    return (
        <div className={style.game}>
            <div className={style.controls}>
                <button type="button" className={cx(style.button, vsComputer && style.buttonActive)}
                        onClick={() => switchMode(true)}>vs Computer</button>
                <button type="button" className={cx(style.button, !vsComputer && style.buttonActive)}
                        onClick={() => switchMode(false)}>2 Players</button>
            </div>
            {vsComputer ? (
                <div className={style.toggle} role="group" aria-label="Difficulty">
                    <button type="button" aria-pressed={!hard} className={cx(style.toggleOption, !hard && style.toggleActive)}
                            onClick={() => switchMode(true, false)}>Easy</button>
                    <button type="button" aria-pressed={hard} className={cx(style.toggleOption, hard && style.toggleActive)}
                            onClick={() => switchMode(true, true)}>Hard</button>
                </div>
            ) : null}
            <p className={style.status} aria-live="polite">{status}</p>
            <div className={style.tttBoard}>
                {board.map((cell, i) => (
                    <button key={i} type="button" aria-label={cell ? `Square ${i + 1}, ${cell}` : `Square ${i + 1}`}
                            className={cx(style.tttCell, cell === "O" && style.tttO, winner?.line.includes(i) && style.tttWin)}
                            disabled={over || Boolean(cell) || computerTurn} onClick={() => play(i)}>
                        {cell}
                    </button>
                ))}
            </div>
            <div className={style.scores}>
                <span className={style.score}><strong>{scores.X}</strong>{vsComputer ? "YOU" : "X"}</span>
                <span className={style.score}><strong>{scores.draw}</strong>DRAWS</span>
                <span className={style.score}><strong>{scores.O}</strong>{vsComputer ? "COMPUTER" : "O"}</span>
            </div>
            <button type="button" className={style.button} onClick={() => setBoard(EMPTY)}>
                {over ? "Play again" : "Restart"}
            </button>
        </div>
    );
}
