import {useRouter} from "next/router";
import {Metadata} from "../../components/layout";
import Eyebrow from "../../components/site/eyebrow";
import {liftSmall} from "../../components/site/lift";
import PostCard from "../../components/site/postCard";
import SiteShell from "../../components/site/siteShell";
import {TagFilter} from "../../components/site/tagPills";
import TextLink from "../../components/site/textLink";
import cx from "../../lib/cx";
import {getAllPostsMeta, getAllTags} from "../../lib/posts";
import style from "./index.module.css";

export async function getStaticProps() {
    const posts = getAllPostsMeta();
    return {
        props: {
            posts,
            tags: getAllTags(posts),
        },
    };
}

export default function BlogPage({posts, tags}) {
    const router = useRouter();
    const activeTag = typeof router.query.tag === "string" ? router.query.tag : null;
    const visiblePosts = activeTag ? posts.filter((post) => post.tags.includes(activeTag)) : posts;

    function selectTag(tag) {
        const query = tag ? {tag} : {};
        router.push({pathname: "/blog", query}, undefined, {shallow: true, scroll: false});
    }

    return (
        <SiteShell>
            <Metadata title="The Blog · Jaskaran Sethy" url="/blog"/>
            <main className={style.blog}>
                <header className={style.header}>
                    <Eyebrow>THE BLOG · {posts.length} POSTS</Eyebrow>
                    <h1 className={cx(style.title, liftSmall)}>Notes on books, habits &amp; ideas</h1>
                    <p className={cx(style.intro, liftSmall)}>
                        Essays, book reviews and whatever I've become obsessed with this month.
                    </p>
                </header>
                <TagFilter tags={tags} activeTag={activeTag} onSelect={selectTag}/>
                <PostList posts={visiblePosts}/>
                <p className={style.aside}>
                    Need a break from reading? <TextLink href="/games">Play a game</TextLink>
                </p>
            </main>
        </SiteShell>
    );
}

function PostList({posts}) {
    if (!posts.length) {
        return <p className={style.empty}>No posts match this tag yet.</p>;
    }
    const [first, ...rest] = posts;
    return (
        <>
            <PostCard post={first} featured/>
            {rest.length ? (
                <div className={style.grid}>
                    {rest.map((post) => <PostCard key={post.slug} post={post}/>)}
                </div>
            ) : null}
        </>
    );
}
