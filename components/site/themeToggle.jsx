import {useEffect, useState} from "react";
import Icon from "./icon";
import style from "./themeToggle.module.css";

// Switches between the dark and light themes by setting data-theme on <html> (the tokens in siteShell.module.css
// follow it). pages/_document.jsx sets the starting theme before paint; a click here saves the choice. Until the
// visitor picks one, the site follows the device's light/dark setting, live.

const QUERY = "(prefers-color-scheme: light)";

// Applies a theme in one step: transitions are switched off for a frame (styles/global.css), otherwise elements
// that fade their colours on hover would fade into the new theme while the rest snap.
function apply(theme) {
    const root = document.documentElement;
    root.classList.add("theme-switching");
    root.dataset.theme = theme;
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove("theme-switching")));
}

function savedTheme() {
    try {
        const theme = localStorage.getItem("theme");
        return theme === "light" || theme === "dark" ? theme : null;
    } catch {
        return null;
    }
}

export default function ThemeToggle() {
    const [theme, setTheme] = useState(null); // Unknown until mounted; the button renders without an icon until then.

    useEffect(() => {
        setTheme(document.documentElement.dataset.theme === "light" ? "light" : "dark");
        const query = window.matchMedia(QUERY);
        const follow = () => {
            if (savedTheme()) return;
            const next = query.matches ? "light" : "dark";
            apply(next);
            setTheme(next);
        };
        query.addEventListener("change", follow);
        return () => query.removeEventListener("change", follow);
    }, []);

    function toggle() {
        const next = theme === "light" ? "dark" : "light";
        apply(next);
        try {
            localStorage.setItem("theme", next);
        } catch {
            // It just won't persist.
        }
        setTheme(next);
    }

    const label = theme === "light" ? "Switch to dark theme" : "Switch to light theme";
    return (
        <button type="button" className={style.toggle} onClick={toggle} aria-label={label} title={label}>
            {theme ? <Icon name={theme === "light" ? "moon" : "sun"} size={18}/> : null}
        </button>
    );
}
