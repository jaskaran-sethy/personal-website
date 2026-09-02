import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'content/blog');

export function getAllPostSlugs() {
    return fs.readdirSync(postsDirectory)
        .filter((fileName) => fileName.endsWith('.md'))
        .map((fileName) => fileName.replace(/\.md$/, ''));
}

export function getAllPostsMeta() {
    return getAllPostSlugs()
        .map((slug) => {
            const fullPath = path.join(postsDirectory, `${slug}.md`);
            const { data } = matter(fs.readFileSync(fullPath, 'utf8'));
            return { slug, tags: [], ...data };
        })
        .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getAllTags() {
    const tags = new Set();
    getAllPostsMeta().forEach((post) => post.tags.forEach((tag) => tags.add(tag)));
    return Array.from(tags).sort();
}

export function getPostBySlug(slug) {
    const fullPath = path.join(postsDirectory, `${slug}.md`);
    const { data, content } = matter(fs.readFileSync(fullPath, 'utf8'));
    return { slug, tags: [], ...data, content };
}
