import blogData from "/lib/content/blog.json";
import toTitleCase from "../../lib/toTitleCase";

export default function BlogCard({className, blogId}) {
    if (blogData && blogData[blogId]) {
        return (
            <div className={className}>
                <h1>{toTitleCase(String(blogId).replaceAll(/-/g," "))}</h1>
                {blogData[blogId]["text"]}
            </div>
        );
    } else {
        return (
            <div className={className}>
                Blog not found
            </div>
        );
    }
}

