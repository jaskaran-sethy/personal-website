import  { NavBar } from '../../components/layout'
import style from "./index.module.css";
import Image from "next/image";
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
                <Link key={slug} href={`/blog/${slug}`}>

                        <BlogCard
                            imgSrc={blogData[slug].image}
                            imgAlt={blogData[slug].title}
                            title={blogData[slug].title}
                            text={blogData[slug].description}
                        />
                </Link>
            ))}
        </div>
    )
}

function BlogCard({imgSrc, imgAlt, title, description}) {
    return (
        <section className={style.blogCard}>
            <div className={style.blogImage}>
                <Image src={imgSrc} alt={imgAlt} width={200} height={210}/>
            </div>
            <div className={style.blogTitle}>{title}</div>

        </section>
    )
}