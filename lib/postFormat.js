const SHORT_MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

// "Ikigai - Book Review" → "Ikigai"
export function shortTitle(post) {
    return post.title.replace(/\s*-?\s*book review$/i, "");
}

// "book-review" → "book review"
export function formatTag(tag) {
    return tag.replace(/-/g, " ");
}

// "BOOK REVIEW · MAR 4, 2024 · 6 MIN"
export function formatPostMeta(post) {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(post.date);
    const date = match ? `${SHORT_MONTHS[Number(match[2]) - 1]} ${Number(match[3])}, ${match[1]}` : "UNDATED";
    const category = post.tags[0] ? `${formatTag(post.tags[0]).toUpperCase()} · ` : "";
    return `${category}${date} · ${post.readingMinutes} MIN`;
}
