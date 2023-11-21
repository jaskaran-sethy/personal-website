import Image from "next/image";
import style from "./content.module.css";
import Button from "./button";

export default function Content({ children }) {
    return (
        <div className={style.mainContent}>
            {children}
        </div>
    );
}