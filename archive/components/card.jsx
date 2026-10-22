import style from "./content.module.css";
import Image from "next/image";

export default function Card({ children }) {
    return (
    <div className={`${style.card}`}>
        <section>
        <div style={{padding: "2rem"}} />
        {children}
        </section>
    </div>
    );
}