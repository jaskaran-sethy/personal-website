import {useRouter} from "next/router";
import MemoryMatch from "../../components/games/memoryMatch";
import ReactionTime from "../../components/games/reactionTime";
import TicTacToe from "../../components/games/ticTacToe";
import {Metadata} from "../../components/layout";
import Eyebrow from "../../components/site/eyebrow";
import {lift, liftSmall} from "../../components/site/lift";
import TextLink from "../../components/site/textLink";
import cx from "../../lib/cx";
import SiteShell from "../../components/site/siteShell";
import style from "./index.module.css";

const GAMES = [
    {id: "tic-tac-toe", name: "Tic Tac Toe", blurb: "Play a friend, or try to beat the computer.", Game: TicTacToe},
    {id: "memory", name: "Memory Match", blurb: "Find all eight pairs in as few moves as you can.", Game: MemoryMatch},
    {id: "reaction", name: "Reaction Time", blurb: "Wait for gold, then click as fast as you can.", Game: ReactionTime},
];

export default function GamesPage() {
    const router = useRouter();
    const active = GAMES.find((game) => game.id === router.query.game) ?? GAMES[0];

    function selectGame(id) {
        router.push({pathname: "/games", query: {game: id}}, undefined, {shallow: true, scroll: false});
    }

    return (
        <SiteShell>
            <Metadata title="Games · Jaskaran Sethy" url="/games"/>
            <main className={style.games}>
                <header className={style.header}>
                    <Eyebrow>FUN · {GAMES.length} GAMES</Eyebrow>
                    <h1 className={cx(style.title, liftSmall)}>Take a break</h1>
                    <p className={cx(style.intro, liftSmall)}>
                        A few small games I built for fun. Pick one and play right here.
                    </p>
                </header>
                <div className={style.picker} role="tablist" aria-label="Games">
                    {GAMES.map((game, index) => (
                        <button key={game.id} type="button" role="tab" aria-selected={game === active}
                                className={cx(style.pick, game === active && style.pickActive, lift)}
                                onClick={() => selectGame(game.id)}>
                            <span className={style.pickNumber}>{String(index + 1).padStart(2, "0")}</span>
                            <span className={style.pickName}>{game.name}</span>
                            <span className={style.pickBlurb}>{game.blurb}</span>
                        </button>
                    ))}
                </div>
                <section className={style.stage} role="tabpanel" aria-label={active.name}>
                    <active.Game key={active.id}/>
                </section>
                <p className={style.aside}>
                    Had enough fun? <TextLink href="/blog">Read the blog</TextLink>
                </p>
            </main>
        </SiteShell>
    );
}
