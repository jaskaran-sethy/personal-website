import Link from "next/link";
import cx from "../../lib/cx";
import Icon from "./icon";
import {lift} from "./lift";
import style from "./textLink.module.css";

// An accent-coloured link with a trailing arrow that nudges right on hover.
export default function TextLink({href, external, children}) {
    const linkProps = external ? {target: "_blank", rel: "noopener noreferrer"} : {};
    return (
        <Link href={href} className={cx(style.textLink, lift)} {...linkProps}>
            {children} <Icon name="arrow-right" size={16}/>
        </Link>
    );
}
