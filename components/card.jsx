import style from "./content.module.css";
import Image from "next/image";

export default function Card({ image, children }) {
    return (
    <div className={style.blogCard}>
        
        <div style={{padding: "2rem"}} />
        {children}

    </div>
    );
}