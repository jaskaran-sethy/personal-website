import {Metadata, NavBar} from '../../components/layout'
import style from "./index.module.css";
import Link from "next/link";
import {getAllPostsMeta} from "../../lib/posts";

export async function getStaticProps() {
    return {
        props: {
            posts: getAllPostsMeta(),
        },
    };
}

export default function BlogPage({posts}) {
    return (
        <main className={style.blogPage}>
            <Metadata title="Jaskaran's Blog" url="/blog"/>
            <NavBar/>
            <h1>Jaskaran's Blog</h1>
            <BlogGrid posts={posts}/>
            <div style={{display: "flex", justifyContent: "center", position: "relative", top: "5rem"}}>
                <Link href="/games" style={{textDecoration: "none", textAlign: "center"}}>Games</Link>
            </div>
        </main>
    )
}

function BlogGrid({posts}) {
    return (
        <div className={style.blogGrid}>
            {posts.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} style={{textDecoration: "none"}}>
                        <BlogCard
                            imgSrc={post.image}
                            imgAlt={post.title}
                            title={post.title}
                        />
                </Link>
            ))}
        </div>
    )
}

function BlogCard({imgSrc, imgAlt, title}) {
    return (
        <section className={style.blogCard}>
            <div className={style.blogImageWrapper}>
                <img src={imgSrc} alt={imgAlt} className={style.backdropImage}/>
                <div className={style.blogImage}>
                    <img src={imgSrc} alt={imgAlt} />
                </div>
            </div>
            <div className={style.blogTitle}>
                <div>
                    {title}
                </div>
            </div>

        </section>
    )
}
