import {Metadata} from "../../components/layout";
import {liftSmall} from "../../components/site/lift";
import PostCard from "../../components/site/postCard";
import Prose from "../../components/site/prose";
import SectionHeader from "../../components/site/sectionHeader";
import SiteShell from "../../components/site/siteShell";
import {TagList} from "../../components/site/tagPills";
import TextLink from "../../components/site/textLink";
import type from "../../components/site/type.module.css";
import cx from "../../lib/cx";
import {formatPostMeta} from "../../lib/postFormat";
import {getAllPostSlugs, getAllPostsMeta, getPostBySlug} from "../../lib/posts";
import style from "./post.module.css";

export async function getStaticPaths() {
    return {
        paths: getAllPostSlugs().map((slug) => ({params: {slug}})),
        fallback: false,
    };
}

export async function getStaticProps({params}) {
    const allPosts = getAllPostsMeta();
    return {
        props: {
            // `readingMinutes` comes from the list metadata, which the meta line needs.
            post: {...getPostBySlug(params.slug), ...allPosts.find((post) => post.slug === params.slug)},
            morePosts: allPosts.filter((post) => post.slug !== params.slug).slice(0, 3),
        },
    };
}

export default function BlogPost({post, morePosts}) {
    return (
        <SiteShell>
            <Metadata title={post.title} description={post.excerpt} image={post.image} url={`/blog/${post.slug}`}/>
            <article className={style.article}>
                <TextLink href="/blog" back>All posts</TextLink>
                <header className={style.header}>
                    <time className={cx(type.meta, type.accent)} dateTime={post.date}>{formatPostMeta(post)}</time>
                    <h1 className={cx(style.title, liftSmall)}>{post.title}</h1>
                    {post.excerpt ? <p className={cx(style.dek, liftSmall)}>{post.excerpt}</p> : null}
                </header>
                {post.image ? (
                    <div className={style.cover}>
                        <img src={post.image} alt=""/>
                    </div>
                ) : null}
                <div className={style.body}>
                    <Prose>{post.content}</Prose>
                    <TagList tags={post.tags}/>
                </div>
            </article>
            {morePosts.length ? (
                <section className={style.more}>
                    <SectionHeader title="More from the blog" linkLabel="All posts" href="/blog"/>
                    <div className={style.moreGrid}>
                        {morePosts.map((other) => <PostCard key={other.slug} post={other}/>)}
                    </div>
                </section>
            ) : null}
        </SiteShell>
    );
}
