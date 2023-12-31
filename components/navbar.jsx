import Link from "next/link";
import { useRouter } from 'next/router';
import style from "./navbar.module.css";

export default function NavBar() {
    const router = useRouter();
    return (
        <nav className={style.navbar}>
            <Link href="/" className={router.pathname === '/' ? style.activeLink : ''}>Home</Link>
            <Link href="/#About" className={router.pathname === '/about' ? style.activeLink : ''}>About</Link>
            <Link href="/blog" className={router.pathname === '/blog' ? style.activeLink : ''}>Blog</Link>
        </nav>
    );
}