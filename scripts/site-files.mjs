// Writes public/rss.xml (the blog, newest first) and public/sitemap.xml (every page) from the posts and the games
// catalog. Runs before dev and build (see package.json); the files are generated, so they aren't committed.

import {writeFileSync} from "node:fs";
import {CATALOG} from "../components/games/catalog.js";
import {getAllPostsMeta} from "../lib/posts.js";

const SITE = "https://jaskaransethy.com";
const escape = (text = "") => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
// Posts carry dates as YYYY-MM-DD; RSS wants RFC 822, and noon UTC keeps the day the same in every time zone.
const rfc822 = (date) => new Date(`${date}T12:00:00Z`).toUTCString();

const posts = getAllPostsMeta();

const items = posts.map((post) => `    <item>
      <title>${escape(post.title)}</title>
      <link>${SITE}/blog/${post.slug}</link>
      <guid isPermaLink="true">${SITE}/blog/${post.slug}</guid>
      <pubDate>${rfc822(post.date)}</pubDate>
      <description>${escape(post.excerpt)}</description>
    </item>`);

writeFileSync("public/rss.xml", `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Jaskaran Sethy</title>
    <link>${SITE}/blog</link>
    <atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml"/>
    <description>Notes on books, habits and ideas.</description>
    <language>en</language>
${items.join("\n")}
  </channel>
</rss>
`);

const pages = [
    {path: "/", lastmod: posts[0]?.date},
    {path: "/blog", lastmod: posts[0]?.date},
    ...posts.map((post) => ({path: `/blog/${post.slug}`, lastmod: post.date})),
    {path: "/games"},
    ...CATALOG.map((game) => ({path: `/games/${game.id}`})),
];

writeFileSync("public/sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(({path, lastmod}) => `  <url><loc>${SITE}${path}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}</url>`).join("\n")}
</urlset>
`);

console.log(`Wrote public/rss.xml (${posts.length} posts) and public/sitemap.xml (${pages.length} pages)`);
