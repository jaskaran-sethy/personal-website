import {useEffect, useLayoutEffect, useRef, useState} from "react";
import cx from "../../lib/cx";
import ClientLogos from "./clientLogos";
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
            "Grew Product Insights ARR from $1M to $3M+ for enterprise clients",
            "Lifted NLP model F1 from 60% to 80%+ by fine-tuning and quantizing transformers",
            "Built a fine-tuned LLaMA 2 cataloguing system that saved 200+ hours of manual tagging",
        ],
        clients: true,
    },
    {
        id: "armor", name: "Armor", src: "/logos/armor.svg", inset: "large",
        when: "DATA SCIENCE & SOFTWARE · BENGALURU · NOW",
        points: ["Working across data science and software engineering"],
    },
];

const PRESENT = STOPS[STOPS.length - 1].id;

// Measures before paint in the browser (no flash of the wrong height); falls back quietly when server rendering.
const useBrowserLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export default function Journey() {
    const [pinned, setPinned] = useState(PRESENT);
    const [previewing, setPreviewing] = useState(null);
    const shown = STOPS.find((stop) => stop.id === (previewing ?? pinned));
    const panel = useRef(null);
    const [panelHeight, setPanelHeight] = useState(null);

    // The panel takes the height of the card it shows, and CSS eases between heights, so switching cards glides
    // rather than jumping. (Cards share one grid cell; the shown one is the only visible one.)
    useBrowserLayoutEffect(() => {
        const card = panel.current.querySelector(`[data-stop="${shown.id}"]`);
        const update = () => setPanelHeight(card.offsetHeight);
        update();
        const observer = new ResizeObserver(update);
        observer.observe(card);
        return () => observer.disconnect();
    }, [shown.id]);

    function togglePin(id) {
        // Clicking the pinned stop again goes back to the present.
        setPinned(pinned === id && id !== PRESENT ? PRESENT : id);
    }

    return (
        <div className={style.journey}>
            {/* A labelled divider opens the section, so it doesn't start abruptly under the hero. */}
            <p className={cx(type.kickerSmall, style.label)}>ALONG THE WAY</p>
            <ol className={style.row} aria-label="School, university and work, in order"
                onPointerLeave={() => setPreviewing(null)}>
                {STOPS.map(({id, inset, when, points, clients, ...mark}) => (
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
            <div id="journey-detail" ref={panel} className={style.detail} aria-live="polite">
                <div className={style.cards} style={panelHeight === null ? undefined : {height: panelHeight}}>
                {STOPS.map((stop) => (
                    <div key={stop.id} data-stop={stop.id} className={cx(style.card, stop.id === shown.id && style.cardShown)}
                         aria-hidden={stop.id !== shown.id}>
                        <p className={cx(type.kickerSmall, style.when)}>{stop.when}</p>
                        <p className={style.name}>{stop.name}</p>
                        <ul className={style.points}>
                            {stop.points.map((point) => <li key={point}>{point}</li>)}
                        </ul>
                        {stop.clients ? (
                            <div className={style.clients}>
                                <span className={cx(type.kickerSmall, style.clientsLabel)}>CLIENTS</span>
                                <ClientLogos/>
                            </div>
                        ) : null}
                    </div>
                ))}
                </div>
            </div>
        </div>
    );
}
