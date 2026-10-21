import Link from "next/link";
import cx from "../../lib/cx";
import {formatPostMeta, shortTitle} from "../../lib/postFormat";
import {lift} from "./lift";
import type from "./type.module.css";
import style from "./postCard.module.css";

// A blog post teaser: cover, meta line, title and excerpt. Posts without a cover get their title set as one.
export default function PostCard({post}) {
    const title = shortTitle(post);
    return (
        <Link href={`/blog/${post.slug}`} className={cx(style.postCard, lift)}>
            <span className={style.cover}>
                {post.image ? (
                    <img src={post.image} alt=""/>
                ) : (
                    <span className={style.coverFallback} aria-hidden="true">{title}</span>
                )}
            </span>
            <time className={type.meta} dateTime={post.date}>{formatPostMeta(post)}</time>
            <h3 className={style.title}>{title}</h3>
            {post.excerpt ? <p className={style.excerpt}>{post.excerpt}</p> : null}
        </Link>
    );
}
