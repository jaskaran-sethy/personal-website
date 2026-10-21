import Link from "next/link";
import {Space_Grotesk, Inter, JetBrains_Mono} from "next/font/google";
import {Metadata} from "../components/layout";
import {getAllPostsMeta} from "../lib/posts";
import style from "./index.module.css";

const display = Space_Grotesk({subsets: ["latin"], weight: ["500", "600"], variable: "--font-display"});
const body = Inter({subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body"});
const mono = JetBrains_Mono({subsets: ["latin"], weight: ["400"], variable: "--font-mono"});

const EMAIL = "hello@jaskaransethy.com";
const GITHUB_URL = "https://github.com/jaskaran-sethy";
const LINKEDIN_URL = "https://www.linkedin.com/in/jaskaran-sethy/";
const INSTAGRAM_URL = "https://www.instagram.com/sethyrical";
const RESUME_URL = LINKEDIN_URL;

const HIGHLIGHTS = [
    {value: "Armor", label: "Data Science & Software Engineer since Sep 2026"},
    {value: "Gold Medal", label: "Department topper, IIT Roorkee '22"},
    {value: "$1M → $3M+", label: "Product Insights ARR growth at Sprinklr"},
    {value: "ML · Full-stack", label: "From NLP models to the pipelines and apps around them"},
];

const WORK = [
    {
        title: "Market-data pipelines",
        meta: "ARMOR · 2026",
        description: "The pipelines that feed Armor's platform, covering funds, IPOs and corporate actions.",
        href: LINKEDIN_URL,
    },
    {
        title: "Product Insights NLP",
        meta: "SPRINKLR · 2022–23",
        description: "NLP models that turn customer feedback into insights for clients like Samsung, Amazon and Wells Fargo.",
        href: LINKEDIN_URL,
    },
    {
        title: "jaskaransethy.com",
        meta: "SIDE PROJECT",
        description: "A personal site and blog built end-to-end, from design to deployment.",
        href: "https://github.com/jaskaran-sethy/personal-website",
    },
];

export async function getStaticProps() {
    return {
        props: {
            posts: getAllPostsMeta().slice(0, 3),
        },
    };
}

export default function HomePage({posts}) {
    return (
        <div className={`${style.page} ${display.variable} ${body.variable} ${mono.variable}`}>
            <Metadata title="Jaskaran Sethy" type="website"/>
            <Nav/>
            <Hero/>
            <PhotoBand/>
            <Highlights/>
            <Work/>
            <Writing posts={posts}/>
            <About/>
            <Contact/>
            <Footer/>
        </div>
    );
}

function Nav() {
    return (
        <header className={style.nav}>
            <Link href="/" className={style.brand}>
                <svg className={style.slantMark} viewBox="0 0 12 28" aria-hidden="true">
                    <path d="M5 0h7l-5 28h-7z"/>
                </svg>
                Jaskaran Sethy
            </Link>
            <nav className={style.navLinks}>
                <a href="#work" className={style.navLink}>Work</a>
                <a href="#writing" className={style.navLink}>Writing</a>
                <a href="#about" className={style.navLink}>About</a>
                <a href={RESUME_URL} className={style.pillGhost} target="_blank" rel="noopener noreferrer">
                    Resume <Icon name="download" size={14} className={style.mutedIcon}/>
                </a>
            </nav>
        </header>
    );
}

function Hero() {
    return (
        <section className={style.hero}>
            <p className={style.eyebrow}>
                <span className={style.dash}/>
                ML &amp; FULL STACK ENGINEER · ARMOR · BENGALURU
            </p>
            <h1 className={style.heroName}>Jaskaran Sethy</h1>
            <div className={style.subRow}>
                <p className={style.intro}>
                    I build ML systems and the software around them, and write about the books, habits and ideas I get
                    obsessed with.
                </p>
                <div className={style.ctas}>
                    <a href="#work" className={style.pillAccent}>
                        See my work <Icon name="arrow-right" size={16}/>
                    </a>
                    <Link href="/blog" className={style.pillGhost}>
                        Read the blog <Icon name="arrow-up-right" size={16} className={style.mutedIcon}/>
                    </Link>
                </div>
            </div>
        </section>
    );
}

function PhotoBand() {
    return (
        <div className={style.photoBand}>
            <img src="/mountainMe.jpg" alt="Jaskaran smiling on a mountain trail in the Himalayas" className={style.photo}/>
            <span className={style.caption}>
                <Icon name="map-pin" size={14} className={style.accentIcon}/>
                Somewhere in the Himalayas
            </span>
        </div>
    );
}

function Highlights() {
    return (
        <section className={style.highlights}>
            {HIGHLIGHTS.map(({value, label}) => (
                <div key={value} className={style.highlight}>
                    <p className={style.highlightValue}>{value}</p>
                    <p className={style.highlightLabel}>{label}</p>
                </div>
            ))}
        </section>
    );
}

function SectionHeader({title, linkLabel, href, external}) {
    const linkProps = external ? {target: "_blank", rel: "noopener noreferrer"} : {};
    return (
        <div className={style.sectionHeader}>
            <h2 className={style.sectionTitle}>{title}</h2>
            <Link href={href} className={style.textLink} {...linkProps}>
                {linkLabel} <Icon name="arrow-right" size={16}/>
            </Link>
        </div>
    );
}

function Work() {
    return (
        <section id="work" className={style.work}>
            <SectionHeader title="Selected work" linkLabel="View GitHub" href={GITHUB_URL} external/>
            <ol className={style.workList}>
                {WORK.map((item, index) => (
                    <li key={item.title}>
                        <a href={item.href} className={style.workRow} target="_blank" rel="noopener noreferrer">
                            <span className={style.workNumber}>{String(index + 1).padStart(2, "0")}</span>
                            <span className={style.workMain}>
                                <span className={style.workTitle}>{item.title}</span>
                                <span className={style.meta}>{item.meta}</span>
                            </span>
                            <span className={style.workDescription}>{item.description}</span>
                            <span className={style.arrowButton}><Icon name="arrow-up-right" size={20}/></span>
                        </a>
                    </li>
                ))}
            </ol>
        </section>
    );
}

const SHORT_MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

function formatPostMeta(post) {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(post.date);
    const date = match ? `${SHORT_MONTHS[Number(match[2]) - 1]} ${Number(match[3])}, ${match[1]}` : "UNDATED";
    return `${date} · ${post.readingMinutes} MIN`;
}

function Writing({posts}) {
    return (
        <section id="writing" className={style.writing}>
            <SectionHeader title="From the blog" linkLabel="All posts" href="/blog"/>
            <div className={style.postCards}>
                {posts.map((post) => (
                    <Link key={post.slug} href={`/blog/${post.slug}`} className={style.postCard}>
                        <img src={post.image} alt="" className={style.postCover}/>
                        <time className={style.meta} dateTime={post.date}>{formatPostMeta(post)}</time>
                        <h3 className={style.postTitle}>{post.title}</h3>
                        {post.excerpt ? <p className={style.postExcerpt}>{post.excerpt}</p> : null}
                    </Link>
                ))}
            </div>
        </section>
    );
}

function About() {
    return (
        <section id="about" className={style.about}>
            <blockquote className={style.pullQuote}>
                “I become deeply interested in almost everything under the sun.”
            </blockquote>
            <div className={style.aboutCopy}>
                <p className={style.bio}>
                    I studied Biotechnology at IIT Roorkee, graduated with the Department Gold Medal, and fell for
                    software along the way. After a year and a half as a Data Scientist at Sprinklr, I now work across
                    data science and software engineering at Armor in Bengaluru.
                </p>
                <p className={style.bio}>
                    Outside work it's fitness, gaming, reading, music and content creation, whatever has my attention
                    this month.
                </p>
                <a href={LINKEDIN_URL} className={style.textLink} target="_blank" rel="noopener noreferrer">
                    More about me <Icon name="arrow-right" size={16}/>
                </a>
            </div>
        </section>
    );
}

function Contact() {
    return (
        <section className={style.contact}>
            <div className={style.contactPanel}>
                <h2 className={style.contactHeadline}>Want to talk ML, books, or a project? My inbox is open.</h2>
                <a href={`mailto:${EMAIL}`} className={style.emailButton}>
                    Say hello <Icon name="mail" size={16} className={style.accentIcon}/>
                </a>
            </div>
        </section>
    );
}

const SOCIALS = [
    {name: "github", label: "GitHub", href: GITHUB_URL},
    {name: "linkedin", label: "LinkedIn", href: LINKEDIN_URL},
    {name: "instagram", label: "Instagram", href: INSTAGRAM_URL},
    {name: "mail", label: "Email", href: `mailto:${EMAIL}`},
];

function Footer() {
    return (
        <footer className={style.footer}>
            <div className={style.footerLeft}>
                <a href={`mailto:${EMAIL}`} className={style.footerEmail}>{EMAIL}</a>
                <p className={style.copyright}>© {new Date().getFullYear()} Jaskaran Sethy</p>
            </div>
            <div className={style.socials}>
                {SOCIALS.map(({name, label, href}) => (
                    <a key={name} href={href} aria-label={label} className={style.socialButton}
                       target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
                        <Icon name={name} size={18}/>
                    </a>
                ))}
            </div>
        </footer>
    );
}

// Lucide icon paths (lucide.dev), inlined to avoid a dependency for a handful of glyphs.
const ICONS = {
    "arrow-right": <><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></>,
    "arrow-up-right": <><path d="M7 7h10v10"/><path d="M7 17 17 7"/></>,
    "download": <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/></>,
    "map-pin": <><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></>,
    "mail": <><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></>,
    "github": <><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></>,
    "linkedin": <><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></>,
    "instagram": <><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><path d="M17.5 6.5h.01"/></>,
};

function Icon({name, size = 16, className}) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
             strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
            {ICONS[name]}
        </svg>
    );
}
