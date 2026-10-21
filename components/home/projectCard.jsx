import cx from "../../lib/cx";
import CroppedImage from "./croppedImage";
import ExternalLink from "./externalLink";
import Icon from "./icon";
import {lift} from "./lift";
import type from "./type.module.css";
import style from "./projectCard.module.css";

// A tall card with the project's screenshot filling the background and the text set over its lower edge.
export function FeaturedProjectCard({project: {title, kicker, description, image, icon, href}}) {
    return (
        <ExternalLink href={href} className={cx(style.featured, lift)} style={{"--card-image": `url(${image})`}}>
            {icon ? <img src={icon} alt="" className={style.appIcon}/> : null}
            <span className={cx(type.kickerSmall, type.accent)}>{kicker}</span>
            <span className={style.featuredTitle}>{title}</span>
            <span className={style.featuredDescription}>{description}</span>
        </ExternalLink>
    );
}

// A compact card: cropped screenshot on the left, text on the right (stacked on narrow screens).
export default function ProjectCard({project: {title, kicker, description, image, crop, href}}) {
    return (
        <ExternalLink href={href} className={cx(style.card, lift)}>
            <CroppedImage src={image} crop={crop} className={style.shot}/>
            <span className={style.text}>
                <span className={style.top}>
                    <span className={type.kickerSmall}>{kicker}</span>
                    <Icon name="arrow-up-right" size={18} className={style.arrow}/>
                </span>
                <span className={style.title}>{title}</span>
                <span className={style.description}>{description}</span>
            </span>
        </ExternalLink>
    );
}
