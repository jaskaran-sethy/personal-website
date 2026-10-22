import cx from "../../lib/cx";
import LogoMark from "./logoMark";
import style from "./journey.module.css";

// Where I've been, in order: school, university, then work. Just the four marks, each on a small cream tile
// like an app icon; the name shows on hover and to screen readers. Armor's icon is already a tile, so it
// fills its tile edge to edge; IIT Roorkee's seal is fine linework, so it gets most of its tile to stay legible.
const STOPS = [
    {name: "St Columba's School", src: "/logos/st-columbas.webp"},
    {name: "IIT Roorkee", src: "/logos/iit-roorkee.webp", tight: true},
    {name: "Sprinklr", src: "/logos/sprinklr.webp"},
    {name: "Armor", src: "/logos/armor.svg", fullBleed: true},
];

export default function Journey() {
    return (
        <ol className={style.journey} aria-label="School, university and work, in order">
            {STOPS.map(({fullBleed, tight, ...stop}) => (
                <li key={stop.name} className={cx(style.tile, fullBleed && style.fullBleed, tight && style.tight)}
                    title={stop.name}>
                    <LogoMark {...stop} shape="fill"/>
                </li>
            ))}
        </ol>
    );
}
