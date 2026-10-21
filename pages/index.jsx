import Link from "next/link";
import {Caveat, Noto_Serif, DM_Sans, JetBrains_Mono} from "next/font/google";
import {Metadata} from "../components/layout";
import CroppedImage from "../components/home/croppedImage";
import CursorAura from "../components/home/cursorAura";
import ExternalLink from "../components/home/externalLink";
import FactList from "../components/home/factList";
import Highlight from "../components/home/highlight";
import Icon from "../components/home/icon";
import {lift, liftSmall} from "../components/home/lift";
import Pill from "../components/home/pill";
import PostCard from "../components/home/postCard";
import ProjectCard, {FeaturedProjectCard} from "../components/home/projectCard";
import SectionHeader from "../components/home/sectionHeader";
import SocialLinks from "../components/home/socialLinks";
import TextLink from "../components/home/textLink";
import type from "../components/home/type.module.css";
import cx from "../lib/cx";
import {shortTitle} from "../lib/postFormat";
import {getAllPostsMeta} from "../lib/posts";
import style from "./index.module.css";

const display = Noto_Serif({subsets: ["latin"], weight: ["400"], variable: "--font-display"});
const body = DM_Sans({subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body"});
const mono = JetBrains_Mono({subsets: ["latin"], weight: ["400"], variable: "--font-mono"});
const hand = Caveat({subsets: ["latin"], weight: ["600"], variable: "--font-hand"});

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

const SOCIALS = [
    {name: "github", label: "GitHub", href: GITHUB_URL},
    {name: "linkedin", label: "LinkedIn", href: LINKEDIN_URL},
    {name: "instagram", label: "Instagram", href: INSTAGRAM_URL},
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
        <div className={`${style.page} ${display.variable} ${body.variable} ${mono.variable} ${hand.variable}`}>
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

function Nav() {
    return (
        <header className={style.nav}>
            <Link href="/" className={cx(style.brand, lift)}>
                <svg className={style.slantMark} viewBox="0 0 12 28" aria-hidden="true">
                    <path d="M5 0h7l-5 28h-7z"/>
                </svg>
                Jaskaran Sethy
            </Link>
            <nav className={style.navLinks}>
                <a href="#projects" className={cx(style.navLink, lift)}>Projects</a>
                <a href="#writing" className={cx(style.navLink, lift)}>Writing</a>
                <a href="#about" className={cx(style.navLink, lift)}>About</a>
                <Pill href={RESUME_URL} size="small" external>
                    Resume <Icon name="download" size={14} tone="muted"/>
                </Pill>
            </nav>
        </header>
    );
}

function Hero({latestPost}) {
    return (
        <section className={style.hero}>
            <div className={style.heroText}>
                <p className={cx(style.eyebrow, liftSmall)}>
                    <span className={style.dash}/>
                    ML &amp; FULL STACK ENGINEER · ARMOR · BENGALURU
                </p>
                <h1 className={cx(style.heroName, liftSmall)}>Jaskaran<br/>Sethy</h1>
                <p className={cx(style.intro, liftSmall)}>
                    I build ML systems and the software around them, and write about the books, habits and ideas I get
                    obsessed with.
                </p>
                <Link href="/blog" className={cx(style.blogCta, lift)}>
                    <span className={cx(type.kicker, type.accent)}>THE BLOG</span>
                    <span className={style.blogCtaRow}>
                        <span className={style.blogCtaTitle}>Notes on books, habits &amp; ideas</span>
                        <span className={style.accentCircle}><Icon name="arrow-up-right" size={18}/></span>
                    </span>
                    {latestPost ? (
                        <span className={style.blogCtaSub}>Latest: {shortTitle(latestPost)}</span>
                    ) : null}
                </Link>
            </div>
            <div className={style.photo}>
                <div className={style.photoSlant}>
                    <CroppedImage src="/mountainMe.jpg" alt="Jaskaran smiling on the trail to Chandrashila in the Himalayas"
                                  crop={{w: 1.398, h: 2.058, x: -0.191, y: -0.837}} className={style.photoImage}/>
                </div>
                <span className={cx(style.locationTag, liftSmall)}>
                    <Icon name="map-pin" size={14} tone="accent"/>
                    Chandrashila
                </span>
            </div>
        </section>
    );
}

function Highlights() {
    return (
        <section className={style.highlights}>
            {HIGHLIGHTS.map((highlight) => <Highlight key={highlight.value} {...highlight}/>)}
        </section>
    );
}

function Projects() {
    return (
        <section id="projects" className={style.projects}>
            <SectionHeader title="Projects" linkLabel="View GitHub" href={GITHUB_URL} external
                           className={style.projectsHeader}/>
            <div className={style.projectsGrid}>
                <FeaturedProjectCard project={FEATURED_PROJECT}/>
                <div className={style.projectColumn}>
                    {PROJECTS.map((project) => <ProjectCard key={project.title} project={project}/>)}
                </div>
            </div>
            <p className={style.resumeAside}>
                And, well, for professional work —
                <ExternalLink href={RESUME_URL} className={cx(style.resumeLink, lift)}>
                    see my resume <Icon name="download" size={18}/>
                </ExternalLink>
            </p>
        </section>
    );
}

function Writing({posts}) {
    return (
        <section id="writing" className={style.writing}>
            <SectionHeader title="From the blog" linkLabel="All posts" href="/blog"/>
            <div className={style.postCards}>
                {posts.map((post) => <PostCard key={post.slug} post={post}/>)}
            </div>
        </section>
    );
}

function About() {
    return (
        <section id="about" className={style.about}>
            <div className={style.quoteColumn}>
                <blockquote className={cx(style.pullQuote, liftSmall)}>
                    “I become deeply interested in almost everything under the sun.”
                </blockquote>
                <FactList facts={FACTS}/>
            </div>
            <div className={style.aboutCopy}>
                <p className={cx(style.bio, liftSmall)}>
                    I studied Biotechnology at IIT Roorkee, graduated with the Department Gold Medal, and fell for
                    software along the way. After a year and a half as a Data Scientist at Sprinklr, I now work across
                    data science and software engineering at Armor in Bengaluru.
                </p>
                <p className={cx(style.bio, liftSmall)}>
                    Outside work it's fitness, gaming, reading, music and content creation, whatever has my attention
                    this month.
                </p>
                <TextLink href={LINKEDIN_URL} external>More about me</TextLink>
            </div>
        </section>
    );
}

function Contact() {
    return (
        <section className={style.contact}>
            <div className={cx(style.contactPanel, lift)}>
                <h2 className={style.contactHeadline}>Want to talk ML, books, or a project? My inbox is open.</h2>
                <Pill href={`mailto:${EMAIL}`} variant="ink">
                    Say hello <Icon name="mail" size={16} tone="accent"/>
                </Pill>
            </div>
        </section>
    );
}

function Footer() {
    return (
        <footer className={style.footer}>
            <div className={style.footerLeft}>
                <a href={`mailto:${EMAIL}`} className={cx(style.footerEmail, lift)}>{EMAIL}</a>
                <p className={cx(style.copyright, liftSmall)}>© {new Date().getFullYear()} Jaskaran Sethy</p>
            </div>
            <SocialLinks links={SOCIALS}/>
        </footer>
    );
}
