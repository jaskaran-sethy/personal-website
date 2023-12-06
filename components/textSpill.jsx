import { useState } from 'react';
import style from './textSpill.module.css';

export default function TextSpill({text=""}) {
    const [isHovered, setIsHovered] = useState(false);
    const handleMouseEnter = () => {
        setIsHovered(true);
    };
    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    const letters = text.split('').map((letter, index) => {
        if (letter === " ") return <span>&nbsp;</span>;
        const translateX = translates[index % 12][0];
        const translateY = translates[index % 12][1];
        const rotate = rotates[index % 12];
        return (

            <span
                key={index}
                className={`${style.letter} ${isHovered ? `${style.hovered}` : ''}`}
                style={{"--translateX": translateX, "--translateY": translateY, "--rotate": rotate}}
            >
              {letter}
            </span>
    )});

    return (
        <div
            className="text-container"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{color: "white"}}
        >
            {letters}
        </div>
    );
}


const translates = [
    ["-80%", "60%"],
    ["-40%", "20%"],
    ["-10%", "60%"],
    ["0%", "8%"],
    ["0%", "-20%"],
    ["0%", "20%"],
    ["0%", "-40%"],
    ["0%", "15%"],
    ["0%", "-50%"],
    ["0%", "15%"],
    ["50%", "-10%"],
    ["120%", "-30%"]]

const rotates = [
    "8deg",
    "4deg",
    "-6deg",
    "-8deg",
    "5deg",
    "-3deg",
    "-5deg",
    "10deg",
    "8deg",
    "-6deg",
    "-3deg",
    "5deg"
]