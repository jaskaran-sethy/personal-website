import  { NavBar } from '../../components/layout'
import style from "./index.module.css";
import Link from "next/link";
import blogData from '../../lib/content/blog.json';

export default function BlogPage() {
    return (
        <div className={style.blogPage}>
            <NavBar/>
            <h1>Jaskaran's Blog</h1>
            <BlogGrid/>
        </div>
    )
}

function BlogGrid() {
    return (
        <div className={style.blogGrid}>
            {Object.keys(blogData).map((slug) => (
                <Link key={slug} href={`/blog/${slug}`} style={{textDecoration: "none"}}>

                        <BlogCard
                            imgSrc={blogData[slug].image}
                            imgAlt={blogData[slug].title}
                            title={blogData[slug].title}
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