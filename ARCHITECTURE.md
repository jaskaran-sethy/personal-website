# Architecture

How the site is put together, and where to go to change things. The README covers setup and scripts.

## The big picture

The site is a Next.js 15 app using the Pages Router, deployed to Cloudflare Pages through `@cloudflare/next-on-pages`.
Every page is rendered to static HTML at build time: posts with `getStaticProps`/`getStaticPaths`, the rest as plain
static pages. There is no server-side data. The interactive parts (theme toggle, blog tag filter, the games) run in
the browser, and anything they remember goes in the visitor's `localStorage`.

Code runs at four different times:

| When | What runs | Where |
| --- | --- | --- |
| Before dev and build | `scripts/site-files.mjs` writes the RSS feed, sitemap and Markdown pages | Node |
| Build | Pages render to static HTML; blog Markdown becomes HTML | Node (Next.js) |
| Each request | `middleware.js` picks HTML or Markdown | Cloudflare (edge) |
| In the browser | React hydrates; games, theme, filters | Visitor's browser |

Because the build scripts run in plain Node, they can't import JSX. Anything both a page and a script need (page
text, projects, the games catalog, posts) lives in plain `.js` modules under `lib/` or `components/games/catalog.js`.
Those modules import each other with a `.js` ending so Node can load them.

## Pages

| Route | File | Data from |
| --- | --- | --- |
| `/` | `pages/index.jsx` | `lib/copy.js` (`HOME`), `lib/site.js` (`FACTS`), `lib/projects.js`, latest 3 posts |
| `/projects` | `pages/projects/index.jsx` | `lib/copy.js` (`PROJECTS_PAGE`), `lib/projects.js` |
| `/blog` | `pages/blog/index.jsx` | `lib/copy.js` (`BLOG_PAGE`), all posts; `?tag=` filters in the browser |
| `/blog/<slug>` | `pages/blog/[slug].jsx` | `content/blog/<slug>.md` |
| `/games` | `pages/games/index.jsx` | `lib/copy.js` (`GAMES_PAGE`), the games registry; `?section=` picks a tab |
| `/games/<id>` | `pages/games/[game].jsx` | The games registry |
| 404 | `pages/404.jsx` | |

`pages/_document.jsx` sets the light or dark theme before the page paints. `pages/_app.jsx` only adds the global
reset. `pages/api/hello.js` is a leftover example route.

Every page wraps itself in `SiteShell` (fonts, theme tokens, nav, footer, cursor glow) and sets its `<head>` with
`components/metadata.jsx` (title, description, Open Graph and Twitter tags, canonical URL, RSS and Markdown links).

## Components

`components/site/` holds the shared UI: the shell (`siteShell`, `siteNav`, `siteFooter`, `themeToggle`), building
blocks (`pill`, `textLink`, `eyebrow`, `icon`, `sectionHeader`, `pillFilter`, `sectionTabs`), and page sections
(`projectShowcase`, `projectCard`, `postCard`, `journey`, `factList`). Each component has its own CSS module beside
it. `lift.js` is the hover "jump" most clickable things share.

Theme colours are CSS variables in `components/site/siteShell.module.css`, switched by `data-theme` on `<html>`. The
design file in `design/site.pen` uses the same tokens.

## The blog

Each post is a Markdown file in `content/blog/`, with YAML front matter: `title`, `date` (`YYYY-MM-DD`), `excerpt`,
`tags`, and optionally `image`, `thumbnail` and `thumbnailLight`. The file name is the URL slug. Its images go in
`public/blog/<post>/`.

`lib/posts.js` reads the files, and `components/site/renderProse.jsx` turns the Markdown into HTML at build time, so
the Markdown renderer never ships to the browser. An image alone in a paragraph becomes a figure, with its Markdown
title as the caption.

To add a post, add the file; the blog index, home page, RSS feed, sitemap and Markdown version pick it up on the next
build.

## The games

Games and tools are listed in two files:

- `components/games/catalog.js`: plain data for each one (`id`, name, glyph, blurb, `section`), in grid order. The
  build scripts read this.
- `components/games/registry.js`: adds each one's component, loaded only when its page opens, plus helpers
  (`gamePath`, `gamesIn`, `nextGame`, `isTool`).

Sections are `normal`, `esoteric` and `tools`. Tools are listed apart and lead on only to other tools.

Each game is a component in `components/games/` with its own CSS module. Shared pieces are in `kit.jsx` (status
line, stats, buttons, switches) and `hooks.js` (keyboard and swipe input). High scores go through
`highScoreBar.jsx` and `lib/highScores.js`, on top of `lib/storage.js`, which guards every `localStorage` call. A
tool can show a summary in the page's side column with `sidePanel.jsx`.

Bigger logic lives in `lib/`: `insights.js` (Insight Extractor's sentiment analysis), `productReviews.js` and
`extensionBridge.js` (reading Amazon and Flipkart reviews through the helper browser extension), and `portfolio.js`
(Portfolio Calculator).

To add a game: write the component, add it to `catalog.js` and `registry.js`, then run `node scripts/og-cards.mjs`
to render its link-preview image into `public/og/`.

## Generated files

`scripts/site-files.mjs` runs before `dev` and `build` and writes:

- `public/rss.xml`: the blog feed, newest first.
- `public/sitemap.xml`: every page.
- `lib/markdown.generated.js`: a Markdown version of every page, for `middleware.js`.

None of these are committed. If `lib/markdown.generated.js` is missing, run `npm run dev` or `npm run build` once.

Other files are rebuilt by hand and committed:

- `public/og/<id>.png`: `node scripts/og-cards.mjs` (needs Edge or Chrome).
- `public/resume.pdf`: printed from `resume/resume.html`; the command is at the top of that file.

## Agents and crawlers

`public/robots.txt` sets the site's Content Signals (`search`, `ai-input`, `ai-train`), with Cloudflare's policy text.

`middleware.js` implements Markdown for Agents. When a request sends `Accept: text/markdown`, or its URL ends in
`.md` (`/blog.md`, `/index.md` for the home page), it returns that page's Markdown with `Content-Type: text/markdown`,
`Vary: Accept`, `Content-Signal` and an estimated `x-markdown-tokens`. Other requests get the normal HTML, marked
`Vary: Accept`. The `Content-Signal` value in `middleware.js` should match `robots.txt`.

The Markdown takes its words from the same modules as the pages, so editing `lib/copy.js`, `lib/projects.js`, a post
or the games catalog updates both. If a new page should have a Markdown version, add it in `scripts/site-files.mjs`
and to the `matcher` in `middleware.js`.

## Where to change things

| To change | Edit |
| --- | --- |
| Page headings, intros, bio | `lib/copy.js` |
| Email, social links, Substack, resume link, home page facts | `lib/site.js` |
| Projects | `lib/projects.js` (images in `public/projects/`) |
| Default meta description | `lib/copy.js` (`DEFAULT_DESCRIPTION`) |
| Colours and theme | `components/site/siteShell.module.css` |
| Nav and footer | `components/site/siteNav.jsx`, `siteFooter.jsx` |
| Crawler rules and Content Signals | `public/robots.txt` and `CONTENT_SIGNAL` in `middleware.js` |

`archive/` holds the 2023 version of the site. Nothing imports it.
