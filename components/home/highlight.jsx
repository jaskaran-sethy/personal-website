import cx from "../../lib/cx";
import {lift} from "./lift";
import style from "./highlight.module.css";

// A headline number or fact with a short caption, ruled on the left in the accent colour.
export default function Highlight({value, label}) {
    return (
        <div className={cx(style.highlight, lift)}>
            <p className={style.value}>{value}</p>
            <p className={style.label}>{label}</p>
        </div>
    );
}
