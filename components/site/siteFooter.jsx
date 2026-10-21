import cx from "../../lib/cx";
import {EMAIL, SOCIALS} from "../../lib/site";
import {lift, liftSmall} from "./lift";
import SocialLinks from "./socialLinks";
import style from "./siteFooter.module.css";

export default function SiteFooter() {
    return (
        <footer className={style.footer}>
            <div className={style.left}>
                <a href={`mailto:${EMAIL}`} className={cx(style.email, lift)}>{EMAIL}</a>
                <p className={cx(style.copyright, liftSmall)}>© {new Date().getFullYear()} Jaskaran Sethy</p>
            </div>
            <SocialLinks links={SOCIALS}/>
        </footer>
    );
}
