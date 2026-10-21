import {Caveat, Noto_Serif, DM_Sans, JetBrains_Mono} from "next/font/google";
import cx from "../../lib/cx";
import CursorAura from "./cursorAura";
import SiteFooter from "./siteFooter";
import SiteNav from "./siteNav";
import style from "./siteShell.module.css";

const display = Noto_Serif({subsets: ["latin"], weight: ["400"], variable: "--font-display"});
const body = DM_Sans({subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body"});
const mono = JetBrains_Mono({subsets: ["latin"], weight: ["400"], variable: "--font-mono"});
const hand = Caveat({subsets: ["latin"], weight: ["600"], variable: "--font-hand"});

// The frame every page in the Editorial Dark theme sits in: theme tokens, fonts, nav, footer and cursor glow.
export default function SiteShell({children}) {
    return (
        <div className={cx(style.page, display.variable, body.variable, mono.variable, hand.variable)}>
            <CursorAura/>
            <SiteNav/>
            {children}
            <SiteFooter/>
        </div>
    );
}
