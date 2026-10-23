import {createContext, useContext, useEffect, useState} from "react";
import {createPortal} from "react-dom";

// Lets a tool put a summary in the game page's right-hand column, where it stays in view as the tool scrolls.
// The page provides the column's slot element through SideSlot; a tool wraps its summary in <SidePanel>. On wide
// screens the summary is portalled into the slot ("docked"); below that the column stacks under the tool, far from
// what it summarises, so the summary renders inline where the tool put it instead. Tools can ask useDocked() to
// adjust their own layout (e.g. drop a column the summary used to fill).

export const SideSlot = createContext(null);

// Matches the game page's two-column breakpoint (pages/games/index.module.css).
const WIDE = "(min-width: 1101px)";

function useWide() {
    const [wide, setWide] = useState(false);
    useEffect(() => {
        const query = window.matchMedia(WIDE);
        const update = () => setWide(query.matches);
        update();
        query.addEventListener("change", update);
        return () => query.removeEventListener("change", update);
    }, []);
    return wide;
}

export function useDocked() {
    const slot = useContext(SideSlot);
    return useWide() && Boolean(slot);
}

export function SidePanel({children}) {
    const slot = useContext(SideSlot);
    return useDocked() ? createPortal(children, slot) : children;
}
