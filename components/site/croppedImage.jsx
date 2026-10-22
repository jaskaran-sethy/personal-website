import cx from "../../lib/cx";
import style from "./croppedImage.module.css";

// An image placed inside a clipping frame. `crop` mirrors the image fill transform in the design:
// the image's size and offset as fractions of the frame.
// `srcSet`/`sizes` let the browser pick a resized copy; `priority` is for the page's main (LCP) image.
export default function CroppedImage({src, srcSet, sizes, alt = "", crop: {w, h, x, y}, priority, className}) {
    return (
        <span className={cx(style.frame, className)}>
            <img src={src} srcSet={srcSet} sizes={sizes} alt={alt} className={style.image} decoding="async"
                 loading={priority ? "eager" : "lazy"} fetchpriority={priority ? "high" : undefined}
                 style={{width: `${w * 100}%`, height: `${h * 100}%`, left: `${x * 100}%`, top: `${y * 100}%`}}/>
        </span>
    );
}
