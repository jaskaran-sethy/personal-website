import cx from "../../lib/cx";
import LogoMark from "./logoMark";
import style from "./journey.module.css";

// Where I've been, in order: school, university, then work. Four logos on dark medallions, strung on a thin
// thread that warms to gold at the present; the name appears on hover and is read out by screen readers.
// `inset` is how much room each mark gets inside its medallion, tuned by eye: the round IIT seal can nearly
// fill it, the crest and splash need a little air, and Armor's shield (drawn in its cream, since its usual dark
// green disappears on dark) needs the most.
const STOPS = [
    {name: "St Columba's School", src: "/logos/st-columbas.webp", inset: "small"},
    {name: "IIT Roorkee", src: "/logos/iit-roorkee.webp", inset: "none"},
    {name: "Sprinklr", src: "/logos/sprinklr.webp", inset: "small"},
    {name: "Armor", src: "/logos/armor.svg", inset: "large"},
];

export default function Journey() {
    return (
        <ol className={style.journey} aria-label="School, university and work, in order">
            {STOPS.map(({inset, ...stop}) => (
                <li key={stop.name} className={cx(style.medallion, style[`inset-${inset}`])} data-name={stop.name}>
                    <LogoMark {...stop} shape="fill"/>
                </li>
            ))}
        </ol>
    );
}
