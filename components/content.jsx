import Image from "next/image";

export default function Content() {
    return (<div className="main-content">
            <div className="blog-card">
                <Image src="/suit_me.png" alt="Photo of Jaskaran Sethyyyyyy in a suit"
                       width={213} height={204} unoptimized={true} />
            </div>
        </div>
    );
}