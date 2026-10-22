import cx from "../../lib/cx";
import {lift} from "./lift";
import style from "./tagPills.module.css";

// A row of pills where exactly one is selected, used to filter a list (blog tags, game sections).
// `options` is [{value, label}]; `label` names the group for screen readers.
export default function PillFilter({label, options, value, onChange}) {
    return (
        <div className={style.pills} role="group" aria-label={label}>
            {options.map((option) => (
                <button key={String(option.value)} type="button" aria-pressed={option.value === value}
                        className={cx(style.pill, option.value === value && style.active, lift)}
                        onClick={() => onChange(option.value)}>
                    {option.label}
                </button>
            ))}
        </div>
    );
}
