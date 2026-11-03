import Link from "next/link";
import Metadata from "../components/metadata";
import CroppedImage from "../components/site/croppedImage";
import Eyebrow from "../components/site/eyebrow";
import FactList from "../components/site/factList";
import JourneyTimeline from "../components/site/journey";
import Icon from "../components/site/icon";
import {lift, liftSmall} from "../components/site/lift";
import Pill from "../components/site/pill";
import PostCard from "../components/site/postCard";
import ProjectShowcase from "../components/site/projectShowcase";
import SectionHeader from "../components/site/sectionHeader";
import SiteShell from "../components/site/siteShell";
import TextLink from "../components/site/textLink";
import type from "../components/site/type.module.css";
import cx from "../lib/cx";
import {shortTitle} from "../lib/postFormat";
import {getAllPostsMeta} from "../lib/posts";
import {EMAIL, GITHUB_URL, LINKEDIN_URL} from "../lib/site";
import style from "./index.module.css";

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
            <ProjectShowcase/>
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
