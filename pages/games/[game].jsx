import Link from "next/link";
import HighScoreBar, {hasHighScore} from "../../components/games/highScoreBar";
import {findGame, GAMES, gamePath, nextGame} from "../../components/games/registry";
import Metadata from "../../components/metadata";
import Icon from "../../components/site/icon";
import SiteShell from "../../components/site/siteShell";
import cx from "../../lib/cx";
import style from "./index.module.css";

export function getStaticPaths() {
    return {paths: GAMES.map((game) => ({params: {game: game.id}})), fallback: false};
}

export function getStaticProps({params}) {
    return {props: {id: params.game}};
}

// One game at /games/<id>. The game comes first: a slim bar (back, title, next) above it, and the blurb and
// high scores beside it on wide screens (below it on narrow ones), so the board is on screen without scrolling.
export default function GamePage({id}) {
    const game = findGame(id);
    const {Game} = game;
    const next = nextGame(game);
    return (
        <SiteShell>
            <Metadata title={`${game.name} · Games · Jaskaran Sethy`} description={game.blurb} url={gamePath(game.id)}/>
            <main className={cx(style.games, style.playing)}>
                <header className={style.gameBar}>
                    <Link href="/games" className={style.navButton} aria-label="All games">
                        <Icon name="arrow-left" size={16}/> <span className={style.navWide}>All games</span><span className={style.navNarrow}>Games</span>
                    </Link>
                    <h1 className={style.gameTitle}>{game.name}</h1>
                    <Link href={gamePath(next.id)} className={cx(style.navButton, style.navNext)} aria-label={`Next game: ${next.name}`}>
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
            </main>
        </SiteShell>
    );
}
