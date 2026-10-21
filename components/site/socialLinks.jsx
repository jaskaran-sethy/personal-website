import cx from "../../lib/cx";
import ExternalLink from "./externalLink";
import Icon from "./icon";
import {lift} from "./lift";
import style from "./socialLinks.module.css";

// Round icon buttons. Each link's `name` doubles as its icon name.
export default function SocialLinks({links}) {
    return (
        <div className={style.socials}>
            {links.map(({name, label, href}) => (
                <ExternalLink key={name} href={href} aria-label={label} className={cx(style.button, lift)}>
                    <Icon name={name} size={18}/>
                </ExternalLink>
            ))}
        </div>
    );
}
