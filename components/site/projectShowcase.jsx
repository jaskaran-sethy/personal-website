import cx from "../../lib/cx";
import {FEATURED_PROJECT, PROJECTS} from "../../lib/projects";
import {RESUME_URL} from "../../lib/site";
import ExternalLink from "./externalLink";
import Icon from "./icon";
import {lift} from "./lift";
import ProjectCard, {FeaturedProjectCard} from "./projectCard";
import style from "./projectShowcase.module.css";

// The featured project beside a column of the rest, then a pointer to the resume. A fragment, so the parent's
// flex gap spaces the pieces (the home page section and /projects both lay it out that way).
export default function ProjectShowcase() {
    return (
        <>
            <div className={style.grid}>
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
        </>
    );
}
