// Writes public/rss.xml (the blog, newest first), public/sitemap.xml (every page), a Markdown version of every page
// for agents (public/**/*.md) and public/_headers from the posts, projects and games catalog.
// Runs before dev and build (see package.json); the files are generated, so they aren't committed.

import {mkdirSync, writeFileSync} from "node:fs";
import {dirname} from "node:path";
import {CATALOG, SECTIONS} from "../components/games/catalog.js";
import {BLOG_PAGE, DEFAULT_DESCRIPTION, GAMES_PAGE, HOME, PROJECTS_PAGE} from "../lib/copy.js";
import {getAllPostsMeta, getPostBySlug} from "../lib/posts.js";
import {FEATURED_PROJECT, PROJECTS} from "../lib/projects.js";
import {BUY_ME_A_COFFEE_URL, EMAIL, FACTS, GITHUB_URL, LINKEDIN_URL, SOCIALS, SUBSTACK_URL} from "../lib/site.js";

const SITE = "https://jaskaransethy.com";
// The same signals as public/robots.txt, sent with every Markdown page.
const CONTENT_SIGNAL = "search=yes, ai-input=yes, ai-train=yes";
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
    {path: "/projects"},
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

// Markdown for agents: what each page says, without the layout. The words come from the same modules the pages render;
// only the link lines are Markdown's own. Site paths become absolute URLs, so the Markdown reads the same wherever it
// ends up.
const absolute = (href) => (href.startsWith("/") ? `${SITE}${href}` : href);
const absoluteLinks = (markdown) => markdown.replace(/\]\(\//g, `](${SITE}/`);
const page = (title, description, body) => `---
title: ${JSON.stringify(title)}
description: ${JSON.stringify(description)}
---

${body.trim()}
`;

const projectLines = [FEATURED_PROJECT, ...PROJECTS]
    .map((project) => `- [${project.title}](${absolute(project.href)}) (${project.kicker.toLowerCase()}): ${project.description}`)
    .join("\n");
const postLine = (post) => `- [${post.title}](${SITE}/blog/${post.slug}) (${post.formattedDate}): ${post.excerpt}`;
const footer = `Email ${EMAIL} · ${SOCIALS.map((social) => `[${social.label}](${social.href})`).join(" · ")} · [Buy me a coffee](${BUY_ME_A_COFFEE_URL})`;

const markdown = {
    "/": page("Jaskaran Sethy", DEFAULT_DESCRIPTION, `
# Jaskaran Sethy

${HOME.role}

${HOME.intro}

${FACTS.map((fact) => `- **${fact.key.toLowerCase()}:** ${fact.value}`).join("\n")}

## Projects

${projectLines}

More on [GitHub](${GITHUB_URL}) and at [${SITE}/projects](${SITE}/projects).

## From the blog

${posts.slice(0, 3).map(postLine).join("\n")}

All posts: [${SITE}/blog](${SITE}/blog)

## About

> ${HOME.quote}

${HOME.bio.join("\n\n")}

More on [LinkedIn](${LINKEDIN_URL}).

${HOME.contact} ${footer}
`),
    "/projects": page("Projects · Jaskaran Sethy", PROJECTS_PAGE.intro, `
# ${PROJECTS_PAGE.title}

${PROJECTS_PAGE.intro}

${projectLines}

The rest of my code lives on [GitHub](${GITHUB_URL}).
`),
    "/blog": page("The Blog · Jaskaran Sethy", BLOG_PAGE.intro, `
# ${BLOG_PAGE.title}

${BLOG_PAGE.intro} Also on [Substack](${SUBSTACK_URL}), and as an [RSS feed](${SITE}/rss.xml).

${posts.map(postLine).join("\n")}
`),
    ...Object.fromEntries(posts.map((post) => [`/blog/${post.slug}`, page(post.title, post.excerpt, `
# ${post.title}

${post.formattedDate} · ${post.readingMinutes} min read${post.tags.length ? ` · ${post.tags.join(", ")}` : ""}

${absoluteLinks(getPostBySlug(post.slug).content.trim())}
`)])),
    "/games": page("Games · Jaskaran Sethy", GAMES_PAGE.intro, `
# ${GAMES_PAGE.title}

${GAMES_PAGE.intro}

${SECTIONS.map((section) => `## ${section.title}

${section.blurb}

${CATALOG.filter((game) => (game.section ?? "games") === section.id)
        .map((game) => `- [${game.name}](${SITE}/games/${game.id}): ${game.blurb}`).join("\n")}`).join("\n\n")}
`),
    ...Object.fromEntries(CATALOG.map((game) => [`/games/${game.id}`, page(`${game.name} · Games · Jaskaran Sethy`, game.blurb, `
# ${game.name}

${game.blurb}

It's interactive and runs in the browser: open [${SITE}/games/${game.id}](${SITE}/games/${game.id}) to play. More at [${SITE}/games](${SITE}/games).
`)])),
};

// Each page's Markdown sits at its path plus .md ("/blog" → /blog.md, the home page → /index.md), served as a static
// file. _headers gives those files their type and the Content-Signal header on Cloudflare Pages.
const mdPath = (path) => `${path === "/" ? "/index" : path}.md`;
for (const [path, text] of Object.entries(markdown)) {
    const file = `public${mdPath(path)}`;
    mkdirSync(dirname(file), {recursive: true});
    writeFileSync(file, text);
}

writeFileSync("public/_headers", Object.keys(markdown).map((path) => `${mdPath(path)}
  Content-Type: text/markdown; charset=utf-8
  Content-Signal: ${CONTENT_SIGNAL}
  Link: <${SITE}${path}>; rel="canonical"
`).join("\n"));

console.log(`Wrote public/rss.xml (${posts.length} posts), public/sitemap.xml (${pages.length} pages) and ${Object.keys(markdown).length} Markdown pages`);
