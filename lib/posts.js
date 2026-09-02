import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'content/blog');
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

function formatDate(dateString) {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateString || '');
    if (!match) return 'Undated';
    const [, year, month, day] = match;
    return `${MONTH_NAMES[Number(month) - 1]} ${Number(day)}, ${year}`;
}

function normalizePost(slug, data, content) {
    const tags = Array.isArray(data.tags) ? data.tags : [];
    const date = typeof data.date === 'string' ? data.date : '';
    const post = {
        ...data,
        slug,
        tags,
        date,
        formattedDate: formatDate(date),
    };
    return content === undefined ? post : {...post, content};
}

export function getAllPostSlugs() {
    let fileNames;
    try {
        fileNames = fs.readdirSync(postsDirectory);
    } catch (err) {
        if (err.code === 'ENOENT') return [];
        throw err;
    }
    return fileNames
        .filter((fileName) => fileName.endsWith('.md'))
        .map((fileName) => fileName.replace(/\.md$/, ''));
}

export function getAllPostsMeta() {
    return getAllPostSlugs()
        .map((slug) => {
            const fullPath = path.join(postsDirectory, `${slug}.md`);
            try {
                const {data} = matter(fs.readFileSync(fullPath, 'utf8'));
                return normalizePost(slug, data);
            } catch (err) {
                console.warn(`Skipping content/blog/${slug}.md: ${err.message}`);
                return null;
            }
        })
        .filter(Boolean)
        .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getAllTags(posts = getAllPostsMeta()) {
    const tags = new Set();
    posts.forEach((post) => post.tags.forEach((tag) => tags.add(tag)));
    return Array.from(tags).sort();
}

export function getPostBySlug(slug) {
    const fullPath = path.join(postsDirectory, `${slug}.md`);
    const {data, content} = matter(fs.readFileSync(fullPath, 'utf8'));
    return normalizePost(slug, data, content);
}
