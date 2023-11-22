
export default function Button({ text= "Click", icon= "🌍", onButtonClick, buttonClass }) {

    return (
        <button className={buttonClass} onClick={onButtonClick}>
            <span className="buttonText">{text}</span>
            <span className="buttonIcon">{icon}</span>
        </button>
    )
}