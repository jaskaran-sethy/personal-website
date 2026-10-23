import Link from "next/link";
import cx from "../../lib/cx";
import Icon from "./icon";
import {lift} from "./lift";
import style from "./textLink.module.css";

// A gold link with an arrow that nudges on hover: trailing by default, leading with `back`.
// `icon` names a logo to lead with instead, and drops the arrow.
export default function TextLink({href, external, back, icon, children}) {
    const linkProps = external ? {target: "_blank", rel: "noopener noreferrer"} : {};
    return (
        <Link href={href} className={cx(style.textLink, back && style.back, icon && style.withIcon, lift)} {...linkProps}>
            {icon ? <Icon name={icon} size={14}/> : back ? <Icon name="arrow-left" size={16}/> : null}
            {children}
            {back || icon ? null : <Icon name="arrow-right" size={16}/>}
        </Link>
    );
}
