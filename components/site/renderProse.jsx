import {renderToStaticMarkup} from "react-dom/server";
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
            <img src={src} alt={alt || ""} loading="lazy" decoding="async"/>
            {title ? <figcaption>{title}</figcaption> : null}
        </figure>
    );
}

const COMPONENTS = {p: Paragraph};

// Turns a post's Markdown into HTML for <Prose>. Only call this from getStaticProps, so it runs at build time.
export default function renderProse(markdown) {
    return renderToStaticMarkup(<ReactMarkdown components={COMPONENTS}>{markdown}</ReactMarkdown>);
}
