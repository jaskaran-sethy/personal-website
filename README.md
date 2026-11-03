# Personal Website

Personal website frontend — built with [Next.js](https://nextjs.org/), featuring a home page, blog, and a games section.

## Tech Stack

- [Next.js](https://nextjs.org/) 15 (Pages Router)
- [React](https://react.dev/) 18
- [@react-spring/web](https://www.react-spring.dev/) for animations
- [SWR](https://swr.vercel.app/) for data fetching
- Deployed via [Cloudflare Pages](https://pages.cloudflare.com/) (`@cloudflare/next-on-pages`)

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
- `npm run build` — build the app for production
- `npm start` — run the production build

`dev` and `build` first run `scripts/site-files.mjs`, which generates `public/rss.xml` and `public/sitemap.xml` from the blog posts and games catalog (the generated files are not committed).

## Project Structure

```
components/   React components: site/ (shared UI) and games/ (the games section)
content/      Blog posts as Markdown (content/blog)
lib/          Helpers (posts, high scores, site data, etc.)
pages/        Route pages (home, blog, games, API routes)
public/       Static assets (images, icons, robots.txt)
scripts/      Build-time scripts (RSS/sitemap, OG cards)
styles/       Global and module CSS
design/       Design source files (see design/README.md)
archive/      Unused code and images from the 2023 version of the site
```

## CI

Pushes and pull requests to `main` are built via GitHub Actions ([.github/workflows/node.js.yml](.github/workflows/node.js.yml)).

## License

See [LICENSE](LICENSE).
