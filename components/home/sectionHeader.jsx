import cx from "../../lib/cx";
import {liftSmall} from "./lift";
import TextLink from "./textLink";
import style from "./sectionHeader.module.css";

// A section title with a "see more" link aligned to its right.
export default function SectionHeader({title, linkLabel, href, external, className}) {
    return (
        <div className={cx(style.sectionHeader, className)}>
            <h2 className={cx(style.sectionTitle, liftSmall)}>{title}</h2>
            <TextLink href={href} external={external}>{linkLabel}</TextLink>
        </div>
    );
}
