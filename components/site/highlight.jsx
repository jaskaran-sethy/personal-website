import cx from "../../lib/cx";
import {lift} from "./lift";
import style from "./highlight.module.css";

// A headline number or fact with a short caption, ruled on the left in the accent colour. `value` can be text
// or an element (e.g. a row of logos).
export default function Highlight({value, label}) {
    const Value = typeof value === "string" ? "p" : "div";
    return (
        <div className={cx(style.highlight, lift)}>
            <Value className={style.value}>{value}</Value>
            <p className={style.label}>{label}</p>
        </div>
    );
}
