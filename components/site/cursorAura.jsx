import {useEffect, useRef} from "react";
import style from "./cursorAura.module.css";

// The soft glow that follows the pointer (from the 2023 site). Moved via a ref so the page doesn't re-render,
// and at most once per frame, since mice can fire mousemove far faster than the screen refreshes.
export default function CursorAura() {
    const auraRef = useRef(null);

    useEffect(() => {
        const aura = auraRef.current;
        let frame = 0;
        let x = 0;
        let y = 0;
        function draw() {
            frame = 0;
            aura.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
            aura.style.opacity = "1";
        }
        function handleMouseMove(event) {
            x = event.clientX;
            y = event.clientY;
            if (!frame) frame = requestAnimationFrame(draw);
        }
        document.addEventListener("mousemove", handleMouseMove, {passive: true});
        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            cancelAnimationFrame(frame);
        };
    }, []);

    return <div ref={auraRef} className={style.aura} aria-hidden="true"/>;
}
