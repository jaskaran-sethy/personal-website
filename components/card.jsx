import style from "./content.module.css";
import Image from "next/image";

export default function Card({ image, children }) {
    return (
    <div className={style.blogCard}>
        {(image && <div className={style.blogImage}>
            <Image
                src="/suit_me.png"
                alt="Photo of Jaskaran Sethyyyyyy in a suit"
                width={213}
                height={204}
                unoptimized={true}
                priority
            />
        </div>)}
        <div style={{padding: "2rem"}} />
        {children}

    </div>
    );
}