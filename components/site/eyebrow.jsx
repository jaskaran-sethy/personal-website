import cx from "../../lib/cx";
import {liftSmall} from "./lift";
import style from "./eyebrow.module.css";

// The small monospace line above a page title, led by a small copy of the nav's slanted gold mark.
export default function Eyebrow({children}) {
    return (
        <p className={cx(style.eyebrow, liftSmall)}>
            <svg className={style.mark} viewBox="0 0 12 28" aria-hidden="true">
                <path d="M5 0h7l-5 28h-7z"/>
            </svg>
            {children}
        </p>
    );
}
