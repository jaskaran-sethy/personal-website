import Link from "next/link";
import Image from "next/image";

export default function IconLink({src="", link="", width=28, height=27, alt}) {
    return (
        <div style={{padding: "0.2vw", margin: "0.8vh 0.1vw 0 0.1vw"}}>
        <Link href={link} target="_blank" rel="noopener noreferrer">
            <Image src={src} alt="Icon" width={width} height={height} />
        </Link>
        </div>
    );
}