import Head from 'next/head';
import {DEFAULT_DESCRIPTION} from '../lib/copy';

// `jsonLd` is schema.org data for search engines (see lib/structuredData.js).
export default function Metadata({title, description, image, url, type, jsonLd}) {
    const metaDescription = description || DEFAULT_DESCRIPTION;
    const metaImage = image ? `https://jaskaransethy.com${image}` : "https://jaskaransethy.com/suit_me.png";
    const metaUrl = url ? `https://jaskaransethy.com${url}` : "https://jaskaransethy.com";
    const metaType = type || "article";

    return (
        <Head>
            <meta charSet="UTF-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <title>{title}</title>
            <meta name="author" content="Jaskaran Sethy"/>
            <meta name="description" content={metaDescription}/>
                <meta name="google-site-verification" content="hVrkQ5GBwfCj_XihMVowDHGI-66EkG2laBJ3aS-tae4" />
                <meta property="og:title" content={title}/>
            <meta property="og:description" content={metaDescription}/>
            <meta property="og:image" content={metaImage}/>
            <meta property="og:image:alt" content={title}/>
            <meta property="og:url" content={metaUrl}/>
            <meta property="og:site_name" content="Jaskaran's Website"/>
            <meta property="og:locale" content="en_US"/>
            <meta property="og:type" content={metaType}/>
            <meta property="article:author" content="Jaskaran Sethy"/>
            <meta property="article:publisher" content="Jaskaran Sethy"/>
            {/* <!-- TWITTER --> */}
            <meta name="twitter:title" content={title}/>
            <meta name="twitter:description" content={metaDescription}/>
            <meta name="twitter:image:src" content={metaImage}/>
            <meta name="twitter:image:alt" content={title}/>
            <meta property="twitter:url" content={metaUrl}/>
            <meta name="twitter:domain" content="https://jaskaransethy.com"/>
            <meta name="twitter:card" content="summary_large_image"/>
            <meta name="twitter:site" content="@JaskaranSethy"/>
            <meta name="twitter:creator" content="@JaskaranSethy"/>
            {/* Only pages that name their own URL claim it (the 404 page shouldn't point at the home page). */}
            {url ? <link rel="canonical" href={metaUrl}/> : null}
            {/* The same page as Markdown, for agents (see scripts/site-files.mjs). */}
            {url ? <link rel="alternate" type="text/markdown" href={`${metaUrl.replace(/\/$/, "/index")}.md`}/> : null}
            <link rel="alternate" type="application/rss+xml" title="Jaskaran Sethy's blog" href="https://jaskaransethy.com/rss.xml"/>
            <link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32"/>
            <link rel="icon" href="/favicon.svg" type="image/svg+xml"/>
            <link rel="apple-touch-icon" href="/apple-touch-icon.png"/>
            {/* "<" is escaped so no text in the data can close the script tag early. */}
            {jsonLd ? <script type="application/ld+json"
                              dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd).replace(/</g, "\\u003c")}}/> : null}
        </Head>)
}