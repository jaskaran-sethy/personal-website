import Link from 'next/link';
import Image from 'next/image';
import Head from 'next/head';
import Script from 'next/script';
import Layout from '../components/layout';
import useSWR from 'swr';

export default function HomePage() {
    return (<Layout>
            <Head>
                <Metadata />
            </Head>
            <Header/>
            <NavBar/>
            <Content/>
            <Footer/>
        </Layout>
    );
}

function Metadata() {
    return (
        <>
        <meta charSet="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Jaskaran's Blog</title>
        <meta name="author" content="Jaskaran Sethy"/>
        <meta name="description"
              content="Based in India, Jaskaran is an ML engineer working to be a full stack engineer. Graduated from IIT Roorkee in 2022, Jaskaran has an active interest in the latest developments in the tech world, especially including AI and LLMs."/>
        <meta property="og:title" content="Jaskaran's Blog"/>
        <meta property="og:description"
              content="Based in India, Jaskaran is an ML engineer working to be a full stack engineer. Graduated from IIT Roorkee in 2022, Jaskaran has an active interest in the latest developments in the tech world, especially including AI and LLMs."/>
        <meta property="og:image" content="./images/suit_me.png"/>
        <meta property="og:image:alt" content="Jaskaran"/>
        <meta property="og:url" content="https://jaskaransethy.com"/>
        <meta property="og:site_name" content="Jaskaran's Website"/>
        <meta property="og:locale" content="en_US"/>
        <meta property="og:type" content="article"/>
        <meta property="article:author" content="Jaskaran Sethy"/>
        <meta property="article:publisher" content="Jaskaran Sethy"/>
        {/* <!-- TWITTER --> */}
        <meta name="twitter:title" content="Jaskaran's Blog"/>
        <meta name="twitter:description"
              content="Based in India, Jaskaran is an ML engineer working to be a full stack engineer. Graduated from IIT Roorkee in 2022, Jaskaran has an active interest in the latest developments in the tech world, especially including AI and LLMs."/>
        <meta name="twitter:image:src" content="./images/suit_me.png"/>
        <meta name="twitter:image:alt" content="Jaskaran"/>
        <meta property="twitter:url" content="https://jaskaransethy.com"/>
        <meta name="twitter:domain" content="https://jaskaransethy.com"/>
        <meta name="twitter:card" content="summary_large_image"/>
        <meta name="twitter:site" content="@JaskaranSethy"/>
        <meta name="twitter:creator" content="@JaskaranSethy"/>
        <link rel="icon" href="../public/favicon.svg" type="image/svg+xml"/>
        <link rel="stylesheet" href="../styles/global.css"/>
    </>)
}

function Header() {
    return (<div className="header">
        <h1>Welcome to My Website</h1>
    </div>);
}

function NavBar() {
    return (
        <div className="navbar">
            <Link href="/">Home</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/about">About</Link>
        </div>
    );
}

function Content() {
    return (<div className="main-content">
            <div className="blog-card">
                <Image src="/public/suit_me.png" alt="Photo of Jaskaran Sethyyyyyy in a suit" height={144}
                       width={144}/>
            </div>
        </div>
    );
}

function Footer() {
    return (
        <div className="footer">
            <p>Jaskaran Sethy &copy; 2023</p>
        </div>);
}

export async function getStaticProps() {
    const allPostsData = "";
    return {
        props: {
            allPostsData,
        },
    };
}