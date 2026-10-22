import style from "./prose.module.css";

// Long-form writing set in the site's reading typography. The HTML comes from renderProse() at build time,
// so the Markdown renderer never ships to the browser.
export default function Prose({html}) {
    return <div className={style.prose} dangerouslySetInnerHTML={{__html: html}}/>;
}
