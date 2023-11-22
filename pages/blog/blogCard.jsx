import blogData from "/lib/content/blog.json";

export default function BlogCard({className, blogId}) {
    if (blogData && blogData[blogId]) {
        return (
            <div className={className}>
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