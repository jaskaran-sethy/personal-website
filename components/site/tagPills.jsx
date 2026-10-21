import Link from "next/link";
import cx from "../../lib/cx";
import {formatTag} from "../../lib/postFormat";
import {lift} from "./lift";
import style from "./tagPills.module.css";

// Filter buttons for the blog index; `activeTag` null means "All".
export function TagFilter({tags, activeTag, onSelect}) {
    if (!tags.length) return null;
    return (
        <div className={style.pills} role="group" aria-label="Filter posts by tag">
            {[null, ...tags].map((tag) => (
                <button key={tag ?? "all"} type="button" aria-pressed={activeTag === tag}
                        className={cx(style.pill, activeTag === tag && style.active, lift)}
                        onClick={() => onSelect(tag)}>
                    {tag ? formatTag(tag) : "All"}
                </button>
            ))}
        </div>
    );
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
