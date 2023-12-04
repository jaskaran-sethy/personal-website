import Image from "next/image";
import style from './responsiveImage.module.css';

export default function ResponsiveImage({ src, alt, aspectRatio="16:9", ...props }) {
    const [width, height] = aspectRatio.split(':').map(parseFloat);
    let className = style.image;
    if (props.className) {
        className = `${props.className} ${style.image} `
    }
    return (
        <div className={style.imageContainer}>
            <Image src={src} alt={alt} fill className={className} {...props} />
        </div>
    );
}