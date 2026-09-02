import Head from 'next/head';

const DEFAULT_DESCRIPTION = "Based in India, Jaskaran is an ML engineer working to be a full stack engineer. Graduated from IIT Roorkee in 2022, Jaskaran has an active interest in the latest developments in the tech world, especially including AI and LLMs.";

export default function Metadata({title, description, image, url, type}) {
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
            <meta property="og:image:alt" content="Jaskaran"/>
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
            <meta name="twitter:image:alt" content="Jaskaran"/>
            <meta property="twitter:url" content={metaUrl}/>
            <meta name="twitter:domain" content="https://jaskaransethy.com"/>
            <meta name="twitter:card" content="summary_large_image"/>
            <meta name="twitter:site" content="@JaskaranSethy"/>
            <meta name="twitter:creator" content="@JaskaranSethy"/>
            <link rel="icon" href="/favicon.svg" type="image/svg+xml"/>
            <link rel="stylesheet" href="../styles/global.css"/>
        </Head>)
}