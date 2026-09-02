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

## Project Structure

```
components/   Shared React components (layout, navbar, footer, cards, etc.)
pages/        Route pages (home, blog, games, API routes)
public/       Static assets (images, icons, robots.txt)
styles/       Global and module CSS
```

## CI

Pushes and pull requests to `main` are built and tested via GitHub Actions ([.github/workflows/node.js.yml](.github/workflows/node.js.yml)).

## License

See [LICENSE](LICENSE).
