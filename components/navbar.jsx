import Link from "next/link";

export default function NavBar() {
    return (
        <div className="navbar">
            <Link href="/">Home</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/about">About</Link>
        </div>
    );
}