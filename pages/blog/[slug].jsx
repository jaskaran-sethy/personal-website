import { NavBar } from '../../components/layout';
import style from "./index.module.css";
import React from "react";
import { useRouter } from 'next/router'; // Import useRouter
import getBlogPostBySlug from './blogs'; // Import your function to fetch blog posts

export default function BlogPost() {
    const router = useRouter();
    const { slug } = router.query;

    if (!slug) {
        return <div>Loading...</div>;
    }

    const blogPost = getBlogPostBySlug(slug);

    return (
        <div className={style.blogPage}>
            <NavBar />
            <h2>{blogPost.title}</h2>
            <div className={style.blogContent}>
                <img src={blogPost.image} alt={blogPost.title} />
                <p>{blogPost.text}</p>
            </div>
        </div>
    );
}