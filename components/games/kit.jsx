import cx from "../../lib/cx";
import style from "./games.module.css";

// The building blocks every game page shares: the status line, the stat row, buttons and two-way switches.
// Layout and look live in games.module.css; games add their own board styles in their own module.

// The serif line above a board. Wrap words in <em> to set them in gold. Announced to screen readers.
export function Status({children}) {
    return <p className={style.status} aria-live="polite">{children}</p>;
}

// A row of numbers under a board, in equal columns so it stays centred.
export function Stats({children}) {
    return <div className={style.scores}>{children}</div>;
}

export function Stat({value, label, className}) {
    return <span className={cx(style.score, className)}><strong>{value}</strong>{label}</span>;
}

// A pill button. `active` gives it the gold outline used for the selected option or the main action.
export function GameButton({active, className, ...props}) {
    return <button type="button" className={cx(style.button, active && style.buttonActive, className)} {...props}/>;
}

// A row of pill buttons where one is selected, e.g. "vs Computer" / "2 Players".
export function ButtonGroup({options, value, onChange}) {
    return (
        <div className={style.controls}>
            {options.map((option) => (
                <GameButton key={String(option.value)} active={option.value === value} aria-pressed={option.value === value}
                            onClick={() => onChange(option.value)}>
                    {option.label}
                </GameButton>
            ))}
        </div>
    );
}

// A compact two-or-more-way switch, e.g. Easy / Hard or Dig / Flag. `label` names the group for screen readers.
export function Toggle({label, options, value, onChange}) {
    return (
        <div className={style.toggle} role="group" aria-label={label}>
            {options.map((option) => (
                <button key={String(option.value)} type="button" aria-pressed={option.value === value}
                        className={cx(style.toggleOption, option.value === value && style.toggleActive)}
                        onClick={() => onChange(option.value)}>
                    {option.label}
                </button>
            ))}
        </div>
    );
}
