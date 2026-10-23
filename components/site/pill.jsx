import cx from "../../lib/cx";
import ExternalLink from "./externalLink";
import {lift} from "./lift";
import style from "./pill.module.css";

// A rounded button-style link. `variant` is "ghost" (outlined), "ink" (solid, for the accent panel) or "gold"
// (brushed gold, for a page's main action).
export default function Pill({href, variant = "ghost", size, external, children}) {
    const Anchor = external ? ExternalLink : "a";
    return (
        <Anchor href={href} className={cx(style.pill, style[variant], size === "small" && style.small, lift)}>
            {children}
        </Anchor>
    );
}
