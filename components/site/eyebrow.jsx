import cx from "../../lib/cx";
import {liftSmall} from "./lift";
import style from "./eyebrow.module.css";

// The small monospace line above a page title, led by a short gold dash.
export default function Eyebrow({children}) {
    return (
        <p className={cx(style.eyebrow, liftSmall)}>
            <span className={style.dash}/>
            {children}
        </p>
    );
}
