import Image from "next/image";

export default function BackgroundImage({   src = "/aiBackground.png",
                                            alt = "background image representing AI"}) {
    return (
        <Image
        src={src}
        alt={alt}
        quality={100}
        fill
        style={{zIndex: -10, opacity: 0.3, objectFit:"cover"}}
        />
    )
}