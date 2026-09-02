import {Metadata} from '../../components/layout';
import style from "./index.module.css";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import TagBadges from "../../components/tagBadges";
import {getAllPostSlugs, getPostBySlug} from '../../lib/posts';

export async function getStaticPaths() {
    return {
        paths: getAllPostSlugs().map((slug) => ({params: {slug}})),
        fallback: false,
    };
}

export async function getStaticProps({params}) {
    return {
        props: {
            post: getPostBySlug(params.slug),
        },
    };
}

export default function BlogPost({post}) {
    return (
        <div className={style.blogPage}>
            <Metadata title={post.title} image={post.image} url={`/blog/${post.slug}`}/>
            <ReturnBar/>
            <div className={style.marginLeft0}>
                <h2>{post.title}</h2>
                <div className={style.postMeta}>
                    <time dateTime={post.date}>{post.formattedDate}</time>
                    <TagBadges tags={post.tags}/>
                </div>
                <div className={style.blogContent}>
                    <ReactMarkdown>{post.content}</ReactMarkdown>
                </div>
            </div>
        </div>
    );
}

function ReturnBar() {
    return (
        <div className="returnBar" style={{position: "fixed", width: "10vw", zIndex: 1}}>
            <Link href="/blog" style={{ textDecoration: 'none' }}>
                <div className="returnIcon" style={{width: "8vw", maxWidth:"64px"}}>
                    <svg viewBox="-3 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="gradient">
                                <stop offset="43%" stopColor="#0064c8" />
                                <stop offset="100%" stopColor="#ff00b4" />

                            </linearGradient>
                        </defs>
                        <g id="icomoon-ignore">
                        </g>
                        <path d="M13.114 2.887c-7.243 0-13.114 5.871-13.114 13.113s5.871 13.113 13.114 13.113c7.242 0 13.112-5.871 13.112-13.113s-5.87-13.113-13.112-13.113zM13.114 28.064c-6.653 0-12.065-5.412-12.065-12.064s5.412-12.063 12.065-12.063c6.652 0 12.063 5.412 12.063 12.063s-5.411 12.064-12.063 12.064z" fill="url(#gradient)">

                        </path>
                        <path d="M12.318 10.363l-0.742-0.742-6.379 6.379 6.379 6.379 0.742-0.742-5.113-5.113h12.726v-1.049h-12.726z" fill="url(#gradient)">

                        </path>
                    </svg>
                </div>
            </Link>
        </div>
    )
}
