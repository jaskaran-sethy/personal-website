import cx from "../../lib/cx";
import style from "./logoMark.module.css";

// One organisation's mark, in whichever form we have it:
// - `path` + `viewBox`: an inline SVG path drawn in the current text colour (e.g. from Simple Icons),
// - `src`: an image file under /public (for marks that need their own colours),
// - `src` + `tint`: a one-colour image file drawn in the current text colour (as a mask), so it suits both themes;
//   `aspect` (width / height) gives it a width, which a mask can't take from the image,
// - neither: the name set as a plain wordmark, a stand-in until a real mark is added.
// `shape` sizes it by eye: "wordmark" (caps only), "logo" (letters plus a symbol), "logoCompact" (a symbol that
// runs the full height), "badge" (square), "crest" (a bit taller), or "fill" (fills its container).
export default function LogoMark({name, path, viewBox, src, tint, aspect, shape = "wordmark", className}) {
    const sizing = cx(style.mark, style[shape], className);
    if (path) {
        return (
            <svg viewBox={viewBox} className={sizing} role="img" aria-label={name}>
                <path d={path} fill="currentColor"/>
            </svg>
        );
    }
    if (src && tint) {
        return (
            <span className={cx(sizing, style.tint)} role={name ? "img" : undefined} aria-label={name || undefined}
                  aria-hidden={name ? undefined : true}
                  style={{aspectRatio: aspect, WebkitMaskImage: `url(${src})`, maskImage: `url(${src})`}}/>
        );
    }
    if (src) return <img src={src} alt={name} className={sizing} loading="lazy" decoding="async"/>;
    return <span className={cx(style.text, className)}>{name}</span>;
}
