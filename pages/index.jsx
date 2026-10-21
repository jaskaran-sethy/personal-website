import {useEffect, useRef} from "react";
import Link from "next/link";
import {Noto_Serif, DM_Sans, JetBrains_Mono} from "next/font/google";
import {Metadata} from "../components/layout";
import {getAllPostsMeta} from "../lib/posts";
import style from "./index.module.css";

const display = Noto_Serif({subsets: ["latin"], weight: ["400"], variable: "--font-display"});
const body = DM_Sans({subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body"});
const mono = JetBrains_Mono({subsets: ["latin"], weight: ["400"], variable: "--font-mono"});

const EMAIL = "hello@jaskaransethy.com";
const GITHUB_URL = "https://github.com/jaskaran-sethy";
const LINKEDIN_URL = "https://www.linkedin.com/in/jaskaran-sethy/";
const INSTAGRAM_URL = "https://www.instagram.com/sethyrical";
const RESUME_URL = LINKEDIN_URL;

const HIGHLIGHTS = [
    {value: "Gold Medal", label: "Department topper, IIT Roorkee '22"},
    {value: "$1M → $3M+", label: "Product Insights ARR growth at Sprinklr"},
    {value: "Samsung · Amazon · Wells Fargo", label: "Enterprise clients served by my NLP models at Sprinklr"},
];

const FEATURED_PROJECT = {
    title: "Breathe",
    kicker: "ANDROID · KOTLIN · JETPACK COMPOSE",
    description: "A calm, offline breathing app. Four rhythms, three visual guides — an orb, a tide, a trace of light — and badges you can never lose.",
    image: "/projects/breathe-lake.jpg",
    icon: "/projects/breathe-icon.webp",
    href: `${GITHUB_URL}/meditation-app`,
};

// `crop` mirrors the image fill transform in the design: size and offset as fractions of the frame.
const PROJECTS = [
    {
        title: "Mermaid Nixie",
        kicker: "OBSIDIAN PLUGIN",
        description: "Vault-wide Mermaid layouts: the ELK engine, right-angle edges and spacing that actually applies.",
        image: "/projects/mermaid-dark.jpg",
        crop: {w: 1.724, h: 1.724, x: -0.345, y: -0.310},
        href: `${GITHUB_URL}/obsidian-mermaid-nixie`,
    },
    {
        title: "EncorePpuccin",
        kicker: "OBSIDIAN THEME",
        description: "FastPpuccin's speed with Encore's best UI touches, recoloured to match your accent.",
        image: "/projects/encore-dark.jpg",
        crop: {w: 2.083, h: 1.587, x: -0.563, y: -0.079},
        href: `${GITHUB_URL}/obsidian-encoreppuccin`,
    },
    {
        title: "Nested List Numbers",
        kicker: "OBSIDIAN PLUGIN",
        description: "Numbered lists that know their parents, so item 1 under 2.2 reads as 2.2.1.",
        image: "/projects/nested-dark.jpg",
        crop: {w: 1.667, h: 1.667, x: -0.317, y: -0.167},
        href: `${GITHUB_URL}/obsidian-nested-list-numbers`,
    },
];

const FACTS = [
    {key: "STUDIED", value: "Biotechnology · IIT Roorkee, Gold Medal"},
    {key: "PREVIOUSLY", value: "Data Scientist · Sprinklr"},
    {key: "NOW", value: "Data Science & Software · Armor, Bengaluru"},
    {key: "OFF HOURS", value: "Fitness, gaming, reading, music"},
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
            <CursorAura/>
            <Nav/>
            <Hero latestPost={posts[0]}/>
            <Highlights/>
            <Projects/>
            <Writing posts={posts}/>
            <About/>
            <Contact/>
            <Footer/>
        </div>
    );
}

// The soft glow that follows the pointer (from the 2023 site). Moved via a ref so the page doesn't re-render.
function CursorAura() {
    const auraRef = useRef(null);

    useEffect(() => {
        const aura = auraRef.current;
        function handleMouseMove(event) {
            aura.style.transform = `translate(${event.clientX}px, ${event.clientY}px) translate(-50%, -50%)`;
            aura.style.opacity = "1";
        }
        document.addEventListener("mousemove", handleMouseMove);
        return () => document.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return <div ref={auraRef} className={style.cursorAura} aria-hidden="true"/>;
}

function cropStyle({w, h, x, y}) {
    return {width: `${w * 100}%`, height: `${h * 100}%`, left: `${x * 100}%`, top: `${y * 100}%`};
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
                <a href="#projects" className={style.navLink}>Projects</a>
                <a href="#writing" className={style.navLink}>Writing</a>
                <a href="#about" className={style.navLink}>About</a>
                <a href={RESUME_URL} className={style.pillGhost} target="_blank" rel="noopener noreferrer">
                    Resume <Icon name="download" size={14} className={style.mutedIcon}/>
                </a>
            </nav>
        </header>
    );
}

// "Ikigai - Book Review" → "Ikigai"
function shortTitle(post) {
    return post.title.replace(/\s*-?\s*book review$/i, "");
}

function Hero({latestPost}) {
    return (
        <section className={style.hero}>
            <div className={style.heroText}>
                <p className={style.eyebrow}>
                    <span className={style.dash}/>
                    ML &amp; FULL STACK ENGINEER · ARMOR · BENGALURU
                </p>
                <h1 className={style.heroName}>Jaskaran<br/>Sethy</h1>
                <p className={style.intro}>
                    I build ML systems and the software around them, and write about the books, habits and ideas I get
                    obsessed with.
                </p>
                <Link href="/blog" className={style.blogCta}>
                    <span className={style.kicker}>THE BLOG</span>
                    <span className={style.blogCtaRow}>
                        <span className={style.blogCtaTitle}>Notes on books, habits &amp; ideas</span>
                        <span className={style.accentCircle}><Icon name="arrow-up-right" size={18}/></span>
                    </span>
                    {latestPost ? (
                        <span className={style.blogCtaSub}>Latest: what {shortTitle(latestPost)} taught me</span>
                    ) : null}
                </Link>
            </div>
            <div className={style.photo}>
                <div className={style.photoSlant}>
                    <img src="/mountainMe.jpg" alt="Jaskaran smiling on a mountain trail in the Himalayas"
                         style={cropStyle({w: 1.786, h: 1.852, x: -0.382, y: -0.704})}/>
                </div>
                <span className={style.locationTag}>
                    <Icon name="map-pin" size={14} className={style.accentIcon}/>
                    Somewhere in the Himalayas
                </span>
            </div>
        </section>
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

function Projects() {
    const external = {target: "_blank", rel: "noopener noreferrer"};
    return (
        <section id="projects" className={style.projects}>
            <SectionHeader title="Projects" linkLabel="View GitHub" href={GITHUB_URL} external/>
            <div className={style.projectsGrid}>
                <a href={FEATURED_PROJECT.href} className={style.featuredCard} {...external}
                   style={{"--card-image": `url(${FEATURED_PROJECT.image})`}}>
                    <img src={FEATURED_PROJECT.icon} alt="" className={style.appIcon}/>
                    <span className={style.kickerSmall}>{FEATURED_PROJECT.kicker}</span>
                    <span className={style.featuredTitle}>{FEATURED_PROJECT.title}</span>
                    <span className={style.featuredDescription}>{FEATURED_PROJECT.description}</span>
                </a>
                <div className={style.projectColumn}>
                    {PROJECTS.map((project) => (
                        <a key={project.title} href={project.href} className={style.projectCard} {...external}>
                            <span className={style.projectShot}>
                                <img src={project.image} alt="" style={cropStyle(project.crop)}/>
                            </span>
                            <span className={style.projectText}>
                                <span className={style.projectTop}>
                                    <span className={style.kickerSmall}>{project.kicker}</span>
                                    <Icon name="arrow-up-right" size={18} className={style.projectArrow}/>
                                </span>
                                <span className={style.projectTitle}>{project.title}</span>
                                <span className={style.projectDescription}>{project.description}</span>
                            </span>
                        </a>
                    ))}
                </div>
            </div>
            <p className={style.resumeAside}>
                And, well, for professional work —
                <a href={RESUME_URL} className={style.resumeLink} target="_blank" rel="noopener noreferrer">
                    see my resume <Icon name="download" size={18}/>
                </a>
            </p>
        </section>
    );
}

const SHORT_MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

function formatPostMeta(post) {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(post.date);
    const date = match ? `${SHORT_MONTHS[Number(match[2]) - 1]} ${Number(match[3])}, ${match[1]}` : "UNDATED";
    const category = post.tags[0] ? `${post.tags[0].replace(/-/g, " ").toUpperCase()} · ` : "";
    return `${category}${date} · ${post.readingMinutes} MIN`;
}

function Writing({posts}) {
    return (
        <section id="writing" className={style.writing}>
            <SectionHeader title="From the blog" linkLabel="All posts" href="/blog"/>
            <div className={style.postCards}>
                {posts.map((post) => (
                    <Link key={post.slug} href={`/blog/${post.slug}`} className={style.postCard}>
                        <span className={style.postCover}>
                            <img src={post.image} alt=""/>
                        </span>
                        <time className={style.meta} dateTime={post.date}>{formatPostMeta(post)}</time>
                        <h3 className={style.postTitle}>{shortTitle(post)}</h3>
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
            <div className={style.quoteColumn}>
                <blockquote className={style.pullQuote}>
                    “I become deeply interested in almost everything under the sun.”
                </blockquote>
                <dl className={style.facts}>
                    {FACTS.map(({key, value}) => (
                        <div key={key} className={style.fact}>
                            <dt className={style.kicker}>{key}</dt>
                            <dd>{value}</dd>
                        </div>
                    ))}
                </dl>
            </div>
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
                       target="_blank" rel="noopener noreferrer">
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
