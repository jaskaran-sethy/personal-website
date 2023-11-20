import Link from "next/link";
import style from "./navbar.module.css";

export default function NavBar() {
    return (
        <div className={style.navbar}>
            <Link href="/">Home</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/about">About</Link>
        </div>
    );
}