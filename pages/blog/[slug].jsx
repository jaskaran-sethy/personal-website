import { NavBar } from '../../components/layout';
import style from "./index.module.css";
import React from "react";
import { useRouter } from 'next/router'; // Import useRouter
import getBlogPostBySlug from './blogs';
import Link from "next/link"; // Import your function to fetch blog posts

export default function BlogPost() {
    const router = useRouter();
    const { slug } = router.query;

    if (!slug) {
        return <div>Loading...</div>;
    }

    const blogPost = getBlogPostBySlug(slug);

    const blogPostHTML = blogPost['content'].map((element) => {
        const type = element["type"];
        if (type == "heading") {
            return <h3>{element["text"]}</h3>;
        }
        if (type === "paragraph") {
            return <p>{element["text"]}</p>;
        }
        if (type === "image") {
            return <img src={element["src"]} alt={element["alt"]}/>;
        }
    })

    return (
        <div className={style.blogPage} style={{background: "#111122"}}>
            <ReturnBar />
            <div className={style.marginLeft0}>
                <h2>{blogPost.title}</h2>
                <div className={style.blogContent}>
                    {blogPostHTML}
                </div>
            </div>
        </div>
    );
}

function ReturnBar() {
    return (
        <div className="returnBar" style={{position: "fixed", width: "10vw"}}>
            <Link href="/blog" style={{ textDecoration: 'none' }}>
                <div className="returnIcon" style={{width: "8vw", maxWidth:"64px"}}>
                    <svg viewBox="-3 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
                        <g id="icomoon-ignore">
                        </g>
                        <path d="M13.114 2.887c-7.243 0-13.114 5.871-13.114 13.113s5.871 13.113 13.114 13.113c7.242 0 13.112-5.871 13.112-13.113s-5.87-13.113-13.112-13.113zM13.114 28.064c-6.653 0-12.065-5.412-12.065-12.064s5.412-12.063 12.065-12.063c6.652 0 12.063 5.412 12.063 12.063s-5.411 12.064-12.063 12.064z" fill="#eeeeee">

                        </path>
                        <path d="M12.318 10.363l-0.742-0.742-6.379 6.379 6.379 6.379 0.742-0.742-5.113-5.113h12.726v-1.049h-12.726z" fill="#eeeeee">

                        </path>
                    </svg>
                </div>
            </Link>
        </div>
    )
}