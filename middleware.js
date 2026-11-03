import {NextResponse} from "next/server";
import {MARKDOWN} from "./lib/markdown.generated";

// Markdown for Agents: a request that accepts text/markdown, or a page's path with .md on the end, gets the page as
// Markdown (built by scripts/site-files.mjs) instead of HTML. These are the same signals robots.txt sends.
const CONTENT_SIGNAL = "search=yes, ai-input=yes, ai-train=yes";

export function middleware(request) {
    const {pathname} = request.nextUrl;
    const isMdUrl = pathname.endsWith(".md");
    const path = pagePath(pathname);
    const markdown = MARKDOWN[path];
    if (markdown === undefined) return NextResponse.next();

    const acceptsMarkdown = (request.headers.get("accept") || "").includes("text/markdown");
    if (isMdUrl || acceptsMarkdown) {
        return new Response(request.method === "HEAD" ? null : markdown, {
            headers: {
                "Content-Type": "text/markdown; charset=utf-8",
                "Vary": "Accept",
                "Content-Signal": CONTENT_SIGNAL,
                "x-markdown-tokens": String(Math.ceil(markdown.length / 4)), // A rough count, four characters a token.
                "Link": `<https://jaskaransethy.com${path}>; rel="canonical"`,
            },
        });
    }
    // The HTML depends on Accept too, so caches keep the two apart.
    const response = NextResponse.next();
    response.headers.set("Vary", "Accept");
    return response;
}

// The page a URL names: "/blog.md" is "/blog", and "/index.md" is the home page.
function pagePath(pathname) {
    if (pathname === "/index.md") return "/";
    if (pathname.endsWith(".md")) return pathname.slice(0, -".md".length);
    return pathname;
}

export const config = {
    matcher: ["/", "/index.md", "/projects", "/projects.md", "/blog", "/blog.md", "/blog/:path*", "/games", "/games.md", "/games/:path*"],
};
