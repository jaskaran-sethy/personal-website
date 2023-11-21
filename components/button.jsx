import style from "./button.module.css";

export default function Button({ text= "Click", icon= "🌍" }) {
    return (
        <button id={style["futuristicButton"]}>
            <span className="buttonText">{text}</span>
            <span className="buttonIcon">{icon}</span>
        </button>
    )
}