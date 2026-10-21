import ReactMarkdown from "react-markdown";
import style from "./prose.module.css";

// A paragraph holding nothing but an image becomes a figure, its Markdown title as the caption:
// ![alt](/path.svg "Caption")
function Paragraph({node, children}) {
    const [only, ...rest] = node.children;
    if (rest.length || only?.tagName !== "img") return <p>{children}</p>;
    const {src, alt, title} = only.properties;
    return (
        <figure className={style.figure}>
            <img src={src} alt={alt || ""}/>
            {title ? <figcaption>{title}</figcaption> : null}
        </figure>
    );
}

const COMPONENTS = {p: Paragraph};

// Long-form Markdown set in the site's reading typography.
export default function Prose({children}) {
    return (
        <div className={style.prose}>
            <ReactMarkdown components={COMPONENTS}>{children}</ReactMarkdown>
        </div>
    );
}
