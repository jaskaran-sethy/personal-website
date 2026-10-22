import cx from "../../lib/cx";
import style from "./logoMark.module.css";

// One organisation's mark, in whichever form we have it:
// - `path` + `viewBox`: an inline SVG path drawn in the current text colour (e.g. from Simple Icons),
// - `src`: an image file under /public (for marks that need their own colours),
// - neither: the name set as a plain wordmark, a stand-in until a real mark is added.
// `shape` sizes it by eye: "wordmark" (caps only), "logo" (letters plus a symbol), "badge" (square), "crest"
// (a bit taller), or "fill" (fills its container).
export default function LogoMark({name, path, viewBox, src, shape = "wordmark", className}) {
    const sizing = cx(style.mark, style[shape], className);
    if (path) {
        return (
            <svg viewBox={viewBox} className={sizing} role="img" aria-label={name}>
                <path d={path} fill="currentColor"/>
            </svg>
        );
    }
    if (src) return <img src={src} alt={name} className={sizing} loading="lazy" decoding="async"/>;
    return <span className={cx(style.text, className)}>{name}</span>;
}
