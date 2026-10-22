import Link from "next/link";
import {useRouter} from "next/router";
import {useEffect} from "react";
import {findGame, GAMES, gamePath, gamesIn, SECTIONS} from "../../components/games/registry";
import Metadata from "../../components/metadata";
import Eyebrow from "../../components/site/eyebrow";
import PillFilter from "../../components/site/pillFilter";
import {lift, liftSmall} from "../../components/site/lift";
import SiteShell from "../../components/site/siteShell";
import TextLink from "../../components/site/textLink";
import cx from "../../lib/cx";
import style from "./index.module.css";

// The tile select. A pill filter at the top picks the section (normal or esoteric games); the choice lives in
// the URL (?section=esoteric), so it survives back/forward and can be linked. Each tile opens /games/<id>.
export default function GamesPage() {
    const router = useRouter();
    const section = SECTIONS.find((s) => s.id === router.query.section) ?? SECTIONS[0];
    const games = gamesIn(section.id);

    function selectSection(id) {
        const query = id === SECTIONS[0].id ? {} : {section: id};
        router.push({pathname: "/games", query}, undefined, {shallow: true, scroll: false});
    }

    // Old links used /games?game=<id>; send them to the game's own URL.
    useEffect(() => {
        const old = findGame(router.query.game);
        if (old) router.replace(gamePath(old.id));
    }, [router.query.game]);

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
                <div className={style.sectionPicker}>
                    <PillFilter label="Game type" value={section.id} onChange={selectSection}
                                options={SECTIONS.map((s) => ({
                                    value: s.id,
                                    label: `${s.title} · ${gamesIn(s.id).length}`,
                                }))}/>
                    <p className={style.sectionBlurb}>{section.blurb}</p>
                </div>
                <ul className={style.grid} aria-label={section.title}>
                    {games.map((game) => (
                        <li key={game.id}>
                            <Link href={gamePath(game.id)} className={cx(style.tile, lift)}>
                                <span className={style.tileGlyph} aria-hidden="true">{game.glyph}</span>
                                <span className={style.tileText}>
                                    <span className={style.tileNumber}>{String(GAMES.indexOf(game) + 1).padStart(2, "0")}</span>
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
            </main>
        </SiteShell>
    );
}
