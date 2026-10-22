import Link from "next/link";
import cx from "../../lib/cx";
import {formatTag} from "../../lib/postFormat";
import {lift} from "./lift";
import PillFilter from "./pillFilter";
import style from "./tagPills.module.css";

// Filter buttons for the blog index; `activeTag` null means "All".
export function TagFilter({tags, activeTag, onSelect}) {
    if (!tags.length) return null;
    const options = [{value: null, label: "All"}, ...tags.map((tag) => ({value: tag, label: formatTag(tag)}))];
    return <PillFilter label="Filter posts by tag" options={options} value={activeTag} onChange={onSelect}/>;
}

// A post's tags, each linking to the blog index filtered by it.
export function TagList({tags}) {
    if (!tags.length) return null;
    return (
        <div className={style.pills}>
            {tags.map((tag) => (
                <Link key={tag} href={{pathname: "/blog", query: {tag}}} className={cx(style.pill, lift)}>
                    {formatTag(tag)}
                </Link>
            ))}
        </div>
    );
}
