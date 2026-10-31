import cx from "../../lib/cx";
import {BUY_ME_A_COFFEE_URL, EMAIL, SOCIALS} from "../../lib/site";
import Icon from "./icon";
import {lift, liftSmall} from "./lift";
import Pill from "./pill";
import SocialLinks from "./socialLinks";
import style from "./siteFooter.module.css";

export default function SiteFooter() {
    return (
        <footer className={style.footer}>
            <div className={style.left}>
                <a href={`mailto:${EMAIL}`} className={cx(style.email, lift)}>{EMAIL}</a>
                <p className={cx(style.copyright, liftSmall)}>© {new Date().getFullYear()} Jaskaran Sethy</p>
            </div>
            <div className={style.right}>
                <Pill href={BUY_ME_A_COFFEE_URL} variant="gold" size="small" external>
                    <Icon name="coffee" size={16}/> Buy me a coffee
                </Pill>
                <SocialLinks links={SOCIALS}/>
            </div>
        </footer>
    );
}
