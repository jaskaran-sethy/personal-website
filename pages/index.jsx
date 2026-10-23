import Link from "next/link";
import Metadata from "../components/metadata";
import CroppedImage from "../components/site/croppedImage";
import Eyebrow from "../components/site/eyebrow";
import ExternalLink from "../components/site/externalLink";
import FactList from "../components/site/factList";
import JourneyTimeline from "../components/site/journey";
import Icon from "../components/site/icon";
import {lift, liftSmall} from "../components/site/lift";
import Pill from "../components/site/pill";
import PostCard from "../components/site/postCard";
import ProjectCard, {FeaturedProjectCard} from "../components/site/projectCard";
import SectionHeader from "../components/site/sectionHeader";
import SiteShell from "../components/site/siteShell";
import TextLink from "../components/site/textLink";
import type from "../components/site/type.module.css";
import cx from "../lib/cx";
import {shortTitle} from "../lib/postFormat";
import {getAllPostsMeta} from "../lib/posts";
import {EMAIL, GITHUB_URL, LINKEDIN_URL, RESUME_URL} from "../lib/site";
import style from "./index.module.css";

const FEATURED_PROJECT = {
    title: "Breathe",
    kicker: "ANDROID · KOTLIN · JETPACK COMPOSE",
    description: "A calm, offline breathing app. Four rhythms, three visual guides — an orb, a tide, a trace of light — and badges you can never lose.",
    image: "/projects/breathe-lake.webp",
    icon: "/projects/breathe-icon.webp",
    href: `${GITHUB_URL}/meditation-app`,
};

// `crop` mirrors the image fill transform in the design: size and offset as fractions of the frame.
const PROJECTS = [
    {
        title: "Insight Extractor",
        kicker: "NLP · WEB TOOL",
        description: "Product Insights in the browser: paste feedback or a product link, get every opinion by topic and sentiment.",
        image: "/projects/insight-dark.jpg",
        crop: {w: 1, h: 1, x: 0, y: 0}, // Made for the card, so shown whole.
        href: "/games/insight-extractor",
    },
    {
        title: "Mermaid Nixie",
        kicker: "OBSIDIAN PLUGIN",
        description: "Vault-wide Mermaid layouts: the ELK engine, right-angle edges and spacing that actually applies.",
        image: "/projects/mermaid-dark.jpg",
        crop: {w: 1.724, h: 1.724, x: -0.345, y: -0.310},
        href: `${GITHUB_URL}/obsidian-mermaid-nixie`,
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
        <SiteShell>
            <Metadata title="Jaskaran Sethy" type="website" url="/"/>
            <Hero latestPost={posts[0]}/>
            <section className={style.journey} aria-label="Along the way">
                <JourneyTimeline/>
            </section>
            <Projects/>
            <Writing posts={posts}/>
            <About/>
            <Contact/>
        </SiteShell>
    );
}

function Hero({latestPost}) {
    return (
        <section className={style.hero}>
            <div className={style.heroText}>
                <Eyebrow>ML &amp; FULL STACK ENGINEER · ARMOR · BENGALURU</Eyebrow>
                <h1 className={cx(style.heroName, liftSmall)}>Jaskaran<br/>Sethy</h1>
                <p className={cx(style.intro, liftSmall)}>
                    I build ML systems and the software around them, and write about the books, habits and ideas I get
                    obsessed with.
                </p>
                <Link href="/blog" className={cx(style.blogCta, lift)}>
                    <span className={style.blogCtaText}>
                        <span className={cx(type.kicker, type.accent)}>THE BLOG</span>
                        <span className={style.blogCtaTitle}>Notes on books, habits &amp; ideas</span>
                        {latestPost ? (
                            <span className={style.blogCtaSub}>Latest: {shortTitle(latestPost)}</span>
                        ) : null}
                    </span>
                    <span className={style.blogCtaGlyph} aria-hidden="true">→</span>
                </Link>
            </div>
            <div className={style.photo}>
                <div className={style.photoSlant}>
                    <CroppedImage src="/mountainMe-900.webp" srcSet="/mountainMe-900.webp 900w, /mountainMe-1600.webp 1600w"
                                  sizes="(max-width: 1100px) 660px, 840px" priority alt="Jaskaran smiling on the trail to Chandrashila in the Himalayas"
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
