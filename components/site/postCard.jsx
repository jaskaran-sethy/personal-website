import Link from "next/link";
import cx from "../../lib/cx";
import {formatPostMeta, shortTitle} from "../../lib/postFormat";
import {lift} from "./lift";
import type from "./type.module.css";
import style from "./postCard.module.css";

// A blog post teaser: cover, meta line, title and excerpt. Posts without a cover get their title set as one.
// A post's `thumbnail` stands in for its cover here when it has one.
// `featured` lays it out wide, cover beside the text, for the top of the blog index.
export default function PostCard({post, featured}) {
    const title = shortTitle(post);
    const cover = post.thumbnail || post.image;
    return (
        <Link href={`/blog/${post.slug}`} className={cx(style.postCard, featured && style.featured, lift)}>
            <span className={style.cover}>
                {cover ? (
                    <img src={cover} alt="" loading="lazy" decoding="async"/>
                ) : (
                    <span className={style.coverFallback} aria-hidden="true">{title}</span>
                )}
            </span>
            <div className={style.text}>
                <time className={type.meta} dateTime={post.date}>{formatPostMeta(post)}</time>
                <h3 className={style.title}>{title}</h3>
                {post.excerpt ? <p className={style.excerpt}>{post.excerpt}</p> : null}
            </div>
        </Link>
    );
}
