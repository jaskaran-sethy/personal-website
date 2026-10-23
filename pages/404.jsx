import {GAMES, isTool} from "../components/games/registry";
import Metadata from "../components/metadata";
import Eyebrow from "../components/site/eyebrow";
import {liftSmall} from "../components/site/lift";
import SiteShell from "../components/site/siteShell";
import TextLink from "../components/site/textLink";
import cx from "../lib/cx";
import style from "./404.module.css";

const PLACES = [
    {href: "/", label: "Home", note: "Who I am and what I'm building"},
    {href: "/blog", label: "The blog", note: "Notes on books, habits & ideas"},
    {href: "/games", label: "Games", note: `${GAMES.filter((game) => !isTool(game)).length} small games to play in the browser`},
];

// Shown for any URL that doesn't exist, in the same Editorial Dark frame as the rest of the site.
export default function NotFound() {
    return (
        <SiteShell>
            <Metadata title="Page not found · Jaskaran Sethy"/>
            <main className={style.notFound}>
                <p className={style.code} aria-hidden="true">404</p>
                <header className={style.header}>
                    <Eyebrow>ERROR 404 · PAGE NOT FOUND</Eyebrow>
                    <h1 className={cx(style.title, liftSmall)}>This page wandered off</h1>
                    <p className={cx(style.intro, liftSmall)}>
                        The link might be old, or the URL has a typo. Here's somewhere real instead:
                    </p>
                </header>
                <ul className={style.places}>
                    {PLACES.map((place) => (
                        <li key={place.href} className={style.place}>
                            <TextLink href={place.href}>{place.label}</TextLink>
                            <span className={style.note}>{place.note}</span>
                        </li>
                    ))}
                </ul>
            </main>
        </SiteShell>
    );
}
