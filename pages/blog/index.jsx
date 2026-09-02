import {Metadata, NavBar} from '../../components/layout'
import style from "./index.module.css";
import Link from "next/link";
import {useRouter} from "next/router";
import TagBadges from "../../components/tagBadges";
import {getAllPostsMeta, getAllTags} from "../../lib/posts";

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
    const activeTag = typeof router.query.tag === 'string' ? router.query.tag : null;
    const visiblePosts = activeTag ? posts.filter((post) => post.tags.includes(activeTag)) : posts;

    function selectTag(tag) {
        const query = tag ? {tag} : {};
        router.push({pathname: '/blog', query}, undefined, {shallow: true});
    }

    return (
        <main className={style.blogPage}>
            <Metadata title="Jaskaran's Blog" url="/blog"/>
            <NavBar/>
            <h1>Jaskaran's Blog</h1>
            <TagFilter tags={tags} activeTag={activeTag} onSelect={selectTag}/>
            <BlogGrid posts={visiblePosts}/>
            <div style={{display: "flex", justifyContent: "center", position: "relative", top: "5rem"}}>
                <Link href="/games" style={{textDecoration: "none", textAlign: "center"}}>Games</Link>
            </div>
        </main>
    )
}

function TagFilter({tags, activeTag, onSelect}) {
    if (!tags.length) return null;
    return (
        <div className={style.tagFilter}>
            <button
                className={`${style.tagPill} ${!activeTag ? style.tagPillActive : ''}`}
                onClick={() => onSelect(null)}
            >
                All
            </button>
            {tags.map((tag) => (
                <button
                    key={tag}
                    className={`${style.tagPill} ${activeTag === tag ? style.tagPillActive : ''}`}
                    onClick={() => onSelect(tag)}
                >
                    {tag.replace(/-/g, ' ')}
                </button>
            ))}
        </div>
    )
}

function BlogGrid({posts}) {
    if (!posts.length) {
        return <p className={style.emptyState}>No posts match this tag yet.</p>;
    }
    return (
        <div className={style.blogGrid}>
            {posts.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className={style.cardLink}>
                    <BlogCard post={post}/>
                </Link>
            ))}
        </div>
    )
}

function BlogCard({post}) {
    return (
        <article className={style.blogCard}>
            <div className={style.blogImageWrapper}>
                <img src={post.image} alt={post.title} className={style.blogImage}/>
            </div>
            <div className={style.blogCardBody}>
                <time className={style.blogDate} dateTime={post.date}>{post.formattedDate}</time>
                <h2 className={style.blogTitle}>{post.title}</h2>
                <div className={style.blogTagsRow}>
                    <TagBadges tags={post.tags}/>
                </div>
            </div>
        </article>
    )
}
