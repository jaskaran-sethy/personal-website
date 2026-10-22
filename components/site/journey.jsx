import cx from "../../lib/cx";
import LogoMark from "./logoMark";
import type from "./type.module.css";
import style from "./journey.module.css";

// Where I've been, in order: each stop is an organisation's mark with a short caption, joined by a line.
// Stops without a `src`/`path` show their name as a wordmark until the real logo is added (see LogoMark).
const STOPS = [
    {name: "St Columba's", caption: "SCHOOL"},
    {name: "IIT Roorkee", caption: "BIOTECHNOLOGY '22"},
    {name: "Sprinklr", caption: "DATA SCIENTIST"},
    {name: "Armor", caption: "NOW"},
];

export default function Journey() {
    return (
        <ol className={style.journey} aria-label="Education and work, in order">
            {STOPS.map((stop, i) => (
                <li key={stop.name} className={style.stop}>
                    <div className={style.markRow}>
                        <LogoMark {...stop} shape="crest"/>
                        {/* The line on to the next stop; it stretches to fill the space between marks. */}
                        {i < STOPS.length - 1 ? <span className={style.line} aria-hidden="true"/> : null}
                    </div>
                    <span className={cx(type.kickerSmall, style.caption)}>{stop.caption}</span>
                </li>
            ))}
        </ol>
    );
}
