import dynamic from "next/dynamic";
import Link from "next/link";
import {useRouter} from "next/router";
import HighScoreBar, {hasHighScore} from "../../components/games/highScoreBar";
import Metadata from "../../components/metadata";
import Eyebrow from "../../components/site/eyebrow";
import Icon from "../../components/site/icon";
import {lift, liftSmall} from "../../components/site/lift";
import SiteShell from "../../components/site/siteShell";
import TextLink from "../../components/site/textLink";
import cx from "../../lib/cx";
import style from "./index.module.css";

// Each game loads only when it's opened, so the tile grid stays light.
const GAMES = [
    {id: "tic-tac-toe", name: "Tic Tac Toe", glyph: "×○", blurb: "Beat the computer on Easy. Try to draw on Hard.",
        Game: dynamic(() => import("../../components/games/ticTacToe"))},
    {id: "memory", name: "Memory Match", glyph: "♠♥", blurb: "Find all eight pairs in as few moves as you can.",
        Game: dynamic(() => import("../../components/games/memoryMatch"))},
    {id: "reaction", name: "Reaction Time", glyph: "↯", blurb: "Wait for gold, then click as fast as you can.",
        Game: dynamic(() => import("../../components/games/reactionTime"))},
    {id: "snake", name: "Snake", glyph: "∿", blurb: "Eat, grow, and don't bite your own tail.",
        Game: dynamic(() => import("../../components/games/snake"))},
    {id: "2048", name: "2048", glyph: "2048", blurb: "Slide and merge tiles until you reach 2048.",
        Game: dynamic(() => import("../../components/games/game2048"))},
    {id: "minesweeper", name: "Minesweeper", glyph: "✹", blurb: "Clear the field without hitting one of ten mines.",
        Game: dynamic(() => import("../../components/games/minesweeper"))},
    {id: "connect-four", name: "Connect Four", glyph: "○●", blurb: "Drop discs and line up four before the computer does.",
        Game: dynamic(() => import("../../components/games/connectFour"))},
    {id: "sliding-puzzle", name: "Sliding Puzzle", glyph: "15", blurb: "Slide the tiles back into order, 1 to 15.",
        Game: dynamic(() => import("../../components/games/slidingPuzzle"))},
    {id: "word-guess", name: "Word Guess", glyph: "Aa", blurb: "Find the five-letter word in six guesses.",
        Game: dynamic(() => import("../../components/games/wordGuess"))},
    {id: "simon", name: "Simon", glyph: "◐", blurb: "Watch the pattern, then play it back. It keeps growing.",
        Game: dynamic(() => import("../../components/games/simon"))},
    {id: "lights-out", name: "Lights Out", glyph: "☼", blurb: "Each tap flips a light and its neighbours. Turn them all off.",
        Game: dynamic(() => import("../../components/games/lightsOut"))},
    {id: "whack-a-mole", name: "Whack-a-Mole", glyph: "◉", blurb: "Thirty seconds. Hit every mole you can.",
        Game: dynamic(() => import("../../components/games/whackAMole"))},
    {id: "typing", name: "Typing Test", glyph: "wpm", blurb: "How many words a minute can you type?",
        Game: dynamic(() => import("../../components/games/typingTest"))},
];

export default function GamesPage() {
    const {query} = useRouter();
    const active = GAMES.find((game) => game.id === query.game);

    return (
        <SiteShell>
            <Metadata title={active ? `${active.name} · Games · Jaskaran Sethy` : "Games · Jaskaran Sethy"} url="/games"/>
            <main className={cx(style.games, active && style.playing)}>
                {active ? <GameView game={active}/> : <GameGrid/>}
            </main>
        </SiteShell>
    );
}

function GameGrid() {
    return (
        <>
            <header className={style.header}>
                <Eyebrow>FUN · {GAMES.length} GAMES</Eyebrow>
                <h1 className={cx(style.title, liftSmall)}>Take a break</h1>
                <p className={cx(style.intro, liftSmall)}>
                    A few small games I built for fun. Pick one and play right here.
                </p>
            </header>
            <ul className={style.grid}>
                {GAMES.map((game, index) => (
                    <li key={game.id}>
                        <Link href={{pathname: "/games", query: {game: game.id}}} className={cx(style.tile, lift)}>
                            <span className={style.tileGlyph} aria-hidden="true">{game.glyph}</span>
                            <span className={style.tileText}>
                                <span className={style.tileNumber}>{String(index + 1).padStart(2, "0")}</span>
                                <span className={style.tileName}>{game.name}</span>
                                <span className={style.tileBlurb}>{game.blurb}</span>
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
            <p className={style.aside}>
                Had enough fun? <TextLink href="/blog">Read the blog</TextLink>
            </p>
        </>
    );
}

// The game comes first: a slim bar (back, title, next) above it, and the blurb and high scores beside it
// on wide screens (below it on narrow ones), so the board is on screen without scrolling.
function GameView({game}) {
    const {Game} = game;
    const next = GAMES[(GAMES.indexOf(game) + 1) % GAMES.length];
    return (
        <>
            <header className={style.gameBar}>
                <Link href="/games" className={style.navButton} aria-label="All games">
                    <Icon name="arrow-left" size={16}/> <span className={style.navWide}>All games</span><span className={style.navNarrow}>Games</span>
                </Link>
                <h1 className={style.gameTitle}>{game.name}</h1>
                <Link href={{pathname: "/games", query: {game: next.id}}} className={cx(style.navButton, style.navNext)}
                      aria-label={`Next game: ${next.name}`}>
                    <span className={style.navNextLabel}>Next<span className={style.navWide}>: <span className={style.navNextName}>{next.name}</span></span></span>
                    <Icon name="arrow-right" size={16}/>
                </Link>
            </header>
            <div className={style.playArea}>
                <section className={style.stage} aria-label={game.name}>
                    <Game key={game.id}/>
                </section>
                <aside className={style.side}>
                    <p className={style.gameBlurb}>{game.blurb}</p>
                    {hasHighScore(game.id) ? <HighScoreBar key={game.id} gameId={game.id} gameName={game.name}/> : null}
                </aside>
            </div>
        </>
    );
}
