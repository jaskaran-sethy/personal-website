import cx from "../../lib/cx";
import {SUBSTACK_URL} from "../../lib/site";
import Icon from "./icon";
import TextLink from "./textLink";
import style from "./subscribe.module.css";

// A line inviting readers to follow the blog: new essays by email through Substack, or the site's RSS feed.
export default function Subscribe({className}) {
    return (
        <p className={cx(style.subscribe, className)}>
            New essays by email:
            <TextLink href={`${SUBSTACK_URL}/subscribe`} external>Subscribe on Substack</TextLink>
            <span className={style.or}>or follow the</span>
            <a href="/rss.xml" className={style.rss}><Icon name="rss" size={14} tone="accent"/>RSS feed</a>
        </p>
    );
}
