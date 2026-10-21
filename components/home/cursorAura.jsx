import {useEffect, useRef} from "react";
import style from "./cursorAura.module.css";

// The soft glow that follows the pointer (from the 2023 site). Moved via a ref so the page doesn't re-render.
export default function CursorAura() {
    const auraRef = useRef(null);

    useEffect(() => {
        const aura = auraRef.current;
        function handleMouseMove(event) {
            aura.style.transform = `translate(${event.clientX}px, ${event.clientY}px) translate(-50%, -50%)`;
            aura.style.opacity = "1";
        }
        document.addEventListener("mousemove", handleMouseMove);
        return () => document.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return <div ref={auraRef} className={style.aura} aria-hidden="true"/>;
}
