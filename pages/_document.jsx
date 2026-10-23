import {Head, Html, Main, NextScript} from "next/document";

// Sets the theme before the page paints, so a light-mode visitor never sees a flash of the dark theme. The choice
// comes from the theme toggle (saved in localStorage) or, until one is made, the device's light/dark setting.
const THEME_SCRIPT = `(function () {
    var theme = "dark";
    try {
        var saved = localStorage.getItem("theme");
        theme = saved === "light" || saved === "dark" ? saved
            : matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    } catch (e) {}
    document.documentElement.dataset.theme = theme;
})();`;

export default function Document() {
    return (
        <Html lang="en" data-theme="dark">
            <Head>
                <script dangerouslySetInnerHTML={{__html: THEME_SCRIPT}}/>
            </Head>
            <body>
                <Main/>
                <NextScript/>
            </body>
        </Html>
    );
}
