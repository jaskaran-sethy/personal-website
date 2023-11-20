import Image from "next/image";
import style from "./content.module.css";

export default function Content() {
    return (<div className={style.mainContent}>
            <div className={style.blogCard}>
                <Image src="/suit_me.png" alt="Photo of Jaskaran Sethyyyyyy in a suit"
                       width={213} height={204} unoptimized={true} />
            </div>
        </div>
    );
}