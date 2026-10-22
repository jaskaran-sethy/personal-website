import Link from "next/link";
import {useRouter} from "next/router";
import cx from "../../lib/cx";
import {RESUME_URL} from "../../lib/site";
import Icon from "./icon";
import {lift} from "./lift";
import Pill from "./pill";
import style from "./siteNav.module.css";

// Section links point at the home page so they work from any page; Writing goes to the blog itself.
const LINKS = [
    {label: "Projects", href: "/#projects"},
    {label: "Writing", href: "/blog"},
    {label: "About", href: "/#about"},
    {label: "Fun", href: "/games"},
];

export default function SiteNav() {
    const {pathname} = useRouter();
    return (
        <header className={style.nav}>
            <Link href="/" className={cx(style.brand, lift)}>
                <svg className={style.slantMark} viewBox="0 0 12 28" aria-hidden="true">
                    <path d="M5 0h7l-5 28h-7z"/>
                </svg>
                Jaskaran Sethy
            </Link>
            <nav className={style.links}>
                {LINKS.map(({label, href}) => {
                    const current = !href.includes("#") && pathname.startsWith(href);
                    return (
                        <Link key={label} href={href} aria-current={current ? "page" : undefined}
                              className={cx(style.link, current && style.current, lift)}>
                            {label}
                        </Link>
                    );
                })}
                <Pill href={RESUME_URL} size="small" external>
                    Resume <Icon name="download" size={14} tone="muted"/>
                </Pill>
            </nav>
        </header>
    );
}
