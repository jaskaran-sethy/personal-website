import cx from "../../lib/cx";
import {liftSmall} from "./lift";
import type from "./type.module.css";
import style from "./factList.module.css";

// Ruled key/value rows, e.g. {key: "NOW", value: "Data Science & Software · Armor"}.
export default function FactList({facts}) {
    return (
        <dl className={style.facts}>
            {facts.map(({key, value}) => (
                <div key={key} className={cx(style.fact, liftSmall)}>
                    <dt className={cx(type.kicker, style.key)}>{key}</dt>
                    <dd className={style.value}>{value}</dd>
                </div>
            ))}
        </dl>
    );
}
