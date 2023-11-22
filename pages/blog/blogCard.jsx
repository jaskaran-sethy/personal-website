import blogData from "/posts/blog.json";

export default function BlogCard({className, blogId}) {
    return (
        <div className={className}>
            {blogData[blogId]["text"]}
        </div>
    );
}