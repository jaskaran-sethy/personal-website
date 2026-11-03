# Personal Website

Personal website frontend — built with [Next.js](https://nextjs.org/), featuring a home page, projects, a blog, and a games section.

## Tech Stack

- [Next.js](https://nextjs.org/) 16 (Pages Router), exported as a static site
- [React](https://react.dev/) 19
- Served by [Cloudflare Workers static assets](https://developers.cloudflare.com/workers/static-assets/) (`wrangler.jsonc`)

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the site.

## Available Scripts

- `npm run dev` — start the development server
- `npm run build` — build the static site into `out/`
- `npm run preview` — build, then serve `out/` locally the way Cloudflare will (headers, redirects, 404 page)
- `npm run deploy` — upload `out/` to Cloudflare (run `npm run build` first)

`dev` and `build` first run `scripts/site-files.mjs`, which generates `public/rss.xml`, `public/sitemap.xml`, a Markdown version of every page (`public/**/*.md`) and `public/_headers` from the blog posts, projects and games catalog (the generated files are not committed).

## Project Structure

```
components/   React components: site/ (shared UI) and games/ (the games section)
content/      Blog posts as Markdown (content/blog)
lib/          Data and helpers: page text (copy.js), contact links, projects, posts, game logic, storage
pages/        Route pages (home, projects, blog, games)
public/       Static assets (images, icons, robots.txt, resume.pdf, link-preview images)
scripts/      Build scripts (RSS, sitemap, Markdown pages) and the link-preview image renderer
styles/       Global and shared CSS
resume/       Source HTML for public/resume.pdf
design/       Design source files (see design/README.md)
archive/      Unused code and images from the 2023 version of the site
```

[ARCHITECTURE.md](ARCHITECTURE.md) explains how the pieces fit together and where to make common changes.

## CI

Pushes and pull requests to `main` are built via GitHub Actions ([.github/workflows/node.js.yml](.github/workflows/node.js.yml)).

## License

See [LICENSE](LICENSE).
