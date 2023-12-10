import {NavBar} from "../../components/layout";
import {useState} from "react";

export default function GamesPage() {
    const [game, setGame] = useState("tttt")
    function handleClick(selectedGame) {
        setGame(selectedGame);
    }
    return (
        <div style={{display: "flex", flexDirection: "column", color: "#eeeeee"}}>
            <NavBar/>
            <GamesNavBar onGameClick={handleClick}/>
            <GameRenderer selectedGame={game}/>
        </div>
    );
}

function GamesNavBar({onGameClick}) {
    return (
        <div style={{alignSelf: "center", cursor: "pointer"}}>
            <div onClick={()=>onGameClick("ttt")}>Tic Tac Toe</div>
        </div>
    )
}

function GameRenderer({selectedGame}) {
    return (
        <div style={{alignSelf: "center", paddingTop: "3rem"}}>
            <TicTacToe/>
        </div>
    )
}

function TicTacToe() {
    const [gameState, setGameState] = useState("         ");
    const [turn, setTurn] = useState("X");

    function handleBoxClick(index) {
        let currState = gameState;
        if (checkTicTacToeVictory(gameState)) {
            return;
        }
        if (currState[index] !== " ") return;
        currState = replaceCharacterAtIndex(currState, index, turn);
        setGameState(currState);
        if (checkTicTacToeVictory(currState)) {
            return;
        }

        if (turn === "X") setTurn("O");
        else setTurn("X");
    }

    function handleReset(){
        setGameState("         ");
    }

    const Boxes = gameState.split("").map((boxState, index) => <Box fill={boxState} onBoxClick={() => handleBoxClick(index)}/>);
    return (
        <>
            <div style={{display: "grid", gridTemplate: "repeat(3, 3rem) / repeat(3, 3rem)", gap: "0.3rem"}}>
                {Boxes}
            </div>
            {checkTicTacToeVictory(gameState) && <div style={{paddingTop: "1rem", textAlign: "center"}}>"{checkTicTacToeVictory(gameState)}" Won!!</div>}
            <div onClick={handleReset} style={{position: "relative", textAlign: "center", top: "1rem", background: "#eeeeee", color: "#111111", cursor: "pointer"}}>Reset</div>
        </>
    )
}

function Box({fill, onBoxClick}) {
    return (
        <div style={{background: "#eeeeee", color: "#111111", textAlign: "center", fontSize: "2rem"}} onClick={onBoxClick}>{fill}</div>
    )
}

function replaceCharacterAtIndex(inputString, index, newCharacter) {
    if (index < 0 || index >= inputString.length) {
        return inputString;
    }
    const stringArray = inputString.split('');
    stringArray[index] = newCharacter;
    return stringArray.join('');
}

function checkTicTacToeVictory(gameState) {
    if (gameState[0] === gameState[1] && gameState[0] === gameState[2]) {
        if (gameState[0] === "X")
            return "X";
        else if (gameState[0] === "O") return "O";
    }
    if (gameState[0] === gameState[3] && gameState[0] === gameState[6]) {
        if (gameState[0] === "X")
            return "X";
        else if (gameState[0] === "O") return "O";
    }
    if (gameState[2] === gameState[5] && gameState[2] === gameState[8]) {
        if (gameState[2] === "X")
            return "X";
        else if (gameState[2] === "O") return "O";
    }
    if (gameState[6] === gameState[7] && gameState[6] === gameState[8]) {
        if (gameState[6] === "X")
            return "X";
        else if (gameState[6] === "O") return "O";
    }
    if (gameState[0] === gameState[4] && gameState[0] === gameState[8]) {
        if (gameState[0] === "X")
            return "X";
        else if (gameState[0] === "O") return "O";
    }
    if (gameState[2] === gameState[4] && gameState[2] === gameState[6]) {
        if (gameState[2] === "X")
            return "X";
        else if (gameState[2] === "O") return "O";
    }
    if (gameState[3] === gameState[4] && gameState[3] === gameState[5]) {
        if (gameState[3] === "X")
            return "X";
        else if (gameState[3] === "O") return "O";
    }
    if (gameState[1] === gameState[4] && gameState[1] === gameState[7]) {
        if (gameState[1] === "X")
            return "X";
        else if (gameState[1] === "O") return "O";
    }
    return false;
}