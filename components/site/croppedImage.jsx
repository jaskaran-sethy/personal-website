import cx from "../../lib/cx";
import style from "./croppedImage.module.css";

// An image placed inside a clipping frame. `crop` mirrors the image fill transform in the design:
// the image's size and offset as fractions of the frame.
export default function CroppedImage({src, alt = "", crop: {w, h, x, y}, className}) {
    return (
        <span className={cx(style.frame, className)}>
            <img src={src} alt={alt} className={style.image}
                 style={{width: `${w * 100}%`, height: `${h * 100}%`, left: `${x * 100}%`, top: `${y * 100}%`}}/>
        </span>
    );
}
