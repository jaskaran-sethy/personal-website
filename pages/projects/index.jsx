import Metadata from "../../components/metadata";
import Eyebrow from "../../components/site/eyebrow";
import {liftSmall} from "../../components/site/lift";
import ProjectShowcase from "../../components/site/projectShowcase";
import SiteShell from "../../components/site/siteShell";
import TextLink from "../../components/site/textLink";
import cx from "../../lib/cx";
import {PROJECTS} from "../../lib/projects";
import {GITHUB_URL} from "../../lib/site";
import style from "./index.module.css";

const PROJECT_COUNT = PROJECTS.length + 1; // The rest plus the featured one.

export default function ProjectsPage() {
    return (
        <SiteShell>
            <Metadata title="Projects · Jaskaran Sethy" url="/projects"/>
            <main className={style.projects}>
                <header className={style.header}>
                    <Eyebrow>PROJECTS · {PROJECT_COUNT} BUILT</Eyebrow>
                    <h1 className={cx(style.title, liftSmall)}>Things I've built</h1>
                    <p className={cx(style.intro, liftSmall)}>
                        Apps, plugins and tools I made on my own time, mostly because I wanted them to exist.
                    </p>
                </header>
                <ProjectShowcase/>
                <p className={style.aside}>
                    The rest of my code lives on GitHub. <TextLink href={GITHUB_URL} external>View GitHub</TextLink>
                </p>
            </main>
        </SiteShell>
    );
}
