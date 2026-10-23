import cx from "../../lib/cx";
import style from "./sectionTabs.module.css";

// Serif tabs for switching between a page's sections, e.g. "Normal games" / "Esoteric games". The selected one is
// bright with a gold underline; `count`, if given, shows in a small badge after the name, and `shortLabel`, if
// given, replaces the name on phones so the tabs fit on one row.
// `options` is [{value, label, shortLabel?, count?}]; `label` names the group for screen readers.
export default function SectionTabs({label, options, value, onChange}) {
    return (
        <div className={style.tabs} role="group" aria-label={label}>
            {options.map((option) => (
                <button key={option.value} type="button" aria-pressed={option.value === value}
                        className={cx(style.tab, option.value === value && style.active)}
                        onClick={() => onChange(option.value)}>
                    {option.shortLabel ? (
                        <>
                            <span className={style.long}>{option.label}</span>
                            <span className={style.short}>{option.shortLabel}</span>
                        </>
                    ) : option.label}
                    {option.count !== undefined ? <span className={style.count}>{option.count}</span> : null}
                </button>
            ))}
        </div>
    );
}
