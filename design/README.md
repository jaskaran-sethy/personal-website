# Design

The site's design source, kept next to the code. Nothing here is served: Next.js only ships `public/` and what the
pages import.

- `site.pen`: the pen.dev (Pencil) file. It holds the design document in dark and light, the blog thumbnails (dark
  and light) and the Substack email banner. Colour tokens are variables with a `mode` theme (dark, light) that
  mirror `components/site/siteShell.module.css`.
- `images/`: images the `.pen` file references, by relative path.
- `exports/`: PNG renders of the design document, for reading without Pencil.

Pencil keeps its working copy elsewhere, so this is a snapshot: open `site.pen` in Pencil to keep editing from here,
and re-export the PNGs after changes.
