import {useState} from "react";
import cx from "../../lib/cx";
import LogoMark from "./logoMark";
import type from "./type.module.css";
import style from "./journey.module.css";

// Where I've been, in order: school, university, then work. Four logos on dark medallions, strung on a thread
// that warms to gold at the present. Hovering (or focusing) a medallion previews that place in the panel below;
// clicking pins it so it stays when the pointer leaves, and clicking it again unpins. The present stop is pinned
// to start with, so the panel always shows something and the page never jumps. On touch screens a tap pins.
// `inset` is how much room each mark gets inside its medallion, tuned by eye: the round IIT seal can nearly
// fill it, the crest and splash need a little air, and Armor's shield (drawn in its cream, since its usual dark
// green disappears on dark) needs the most.
const STOPS = [
    {
        id: "school", name: "St Columba's School", src: "/logos/st-columbas.webp", inset: "small",
        when: "CLASS OF '18 · NEW DELHI",
        points: [
            "96% in Class XII (PCM, English, Engineering Drawing)",
            "Pradeepta Roy Chowdhury Memorial Trophy: overall academic topper of Class XI (2016–17)",
        ],
    },
    {
        id: "iitr", name: "IIT Roorkee", src: "/logos/iit-roorkee.webp", inset: "none",
        when: "B.TECH, BIOTECHNOLOGY · CLASS OF '22",
        points: [
            "Department Gold Medal",
            "First Division with Distinction",
            "Thesis: predicting the function of hypothetical proteins with machine learning",
        ],
    },
    {
        id: "sprinklr", name: "Sprinklr", src: "/logos/sprinklr.webp", inset: "small",
        when: "DATA SCIENTIST · JUL 2022 – DEC 2023",
        points: [
            "Grew Product Insights ARR from $1M to $3M+ for clients like Samsung, Amazon and Wells Fargo",
            "Lifted NLP model F1 from 60% to 80%+ by fine-tuning and quantizing transformers",
            "Built a fine-tuned LLaMA 2 cataloguing system that saved 200+ hours of manual tagging",
        ],
    },
    {
        id: "armor", name: "Armor", src: "/logos/armor.svg", inset: "large",
        when: "DATA SCIENCE & SOFTWARE · BENGALURU · NOW",
        points: ["Working across data science and software engineering"],
    },
];

const PRESENT = STOPS[STOPS.length - 1].id;

export default function Journey() {
    const [pinned, setPinned] = useState(PRESENT);
    const [previewing, setPreviewing] = useState(null);
    const shown = STOPS.find((stop) => stop.id === (previewing ?? pinned));

    function togglePin(id) {
        // Clicking the pinned stop again goes back to the present.
        setPinned(pinned === id && id !== PRESENT ? PRESENT : id);
    }

    return (
        <div className={style.journey}>
            <ol className={style.row} aria-label="School, university and work, in order"
                onPointerLeave={() => setPreviewing(null)}>
                {STOPS.map(({id, inset, when, points, ...mark}) => (
                    <li key={id}>
                        <button type="button" aria-pressed={pinned === id} aria-controls="journey-detail"
                                className={cx(style.medallion, style[`inset-${inset}`], pinned === id && style.pinned,
                                    shown.id === id && style.shown)}
                                onPointerEnter={(e) => e.pointerType === "mouse" && setPreviewing(id)}
                                onFocus={() => setPreviewing(id)} onBlur={() => setPreviewing(null)}
                                onClick={() => togglePin(id)}>
                            <LogoMark {...mark} shape="fill"/>
                        </button>
                    </li>
                ))}
            </ol>
            {/* Every stop's details sit in the same spot and only the shown one is visible, so the panel is always as
                tall as the longest and the highlights below never jump. */}
            <div id="journey-detail" className={style.detail} aria-live="polite">
                {STOPS.map((stop) => (
                    <div key={stop.id} className={cx(style.card, stop.id === shown.id && style.cardShown)}
                         aria-hidden={stop.id !== shown.id}>
                        <p className={cx(type.kickerSmall, style.when)}>{stop.when}</p>
                        <p className={style.name}>{stop.name}</p>
                        <ul className={style.points}>
                            {stop.points.map((point) => <li key={point}>{point}</li>)}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}
