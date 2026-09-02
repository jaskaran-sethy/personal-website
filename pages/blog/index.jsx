import {Metadata, NavBar} from '../../components/layout'
import style from "./index.module.css";
import Link from "next/link";
import {useState} from "react";
import {getAllPostsMeta, getAllTags} from "../../lib/posts";

export async function getStaticProps() {
    return {
        props: {
            posts: getAllPostsMeta(),
            tags: getAllTags(),
        },
    };
}

const DATE_FORMAT = {year: "numeric", month: "long", day: "numeric"};

export default function BlogPage({posts, tags}) {
    const [activeTag, setActiveTag] = useState(null);
    const visiblePosts = activeTag ? posts.filter((post) => post.tags.includes(activeTag)) : posts;

    return (
        <main className={style.blogPage}>
            <Metadata title="Jaskaran's Blog" url="/blog"/>
            <NavBar/>
            <h1>Jaskaran's Blog</h1>
            <TagFilter tags={tags} activeTag={activeTag} onSelect={setActiveTag}/>
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
    const formattedDate = new Date(post.date).toLocaleDateString('en-US', DATE_FORMAT);
    return (
        <article className={style.blogCard}>
            <div className={style.blogImageWrapper}>
                <img src={post.image} alt={post.title} className={style.blogImage}/>
            </div>
            <div className={style.blogCardBody}>
                <time className={style.blogDate} dateTime={post.date}>{formattedDate}</time>
                <h2 className={style.blogTitle}>{post.title}</h2>
                <div className={style.blogTags}>
                    {post.tags.map((tag) => (
                        <span key={tag} className={style.blogTagBadge}>{tag.replace(/-/g, ' ')}</span>
                    ))}
                </div>
            </div>
        </article>
    )
}
