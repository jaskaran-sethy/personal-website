import blogData from '../../lib/content/blog.json';

export default function getBlogPostBySlug(slug) {
    // Find the blog post by matching the slug
    return blogData[slug];
}