import {useEffect, useMemo, useState} from "react";
import cx from "../../lib/cx";
import {ASSET_CLASSES, allocation, blendedReturn, formatMoney, project, rebalance} from "../../lib/portfolio";
import {readJSON, writeJSON} from "../../lib/storage";
import {GameButton, Toggle} from "./kit";
import GrowthChart from "./growthChart";
import pc from "./portfolioCalculator.module.css";

// Portfolio Calculator: list what you hold, see how it's split across asset classes and its blended expected return,
// project it forward with a monthly SIP, and see what to buy or sell to reach a target mix. The maths is in
// lib/portfolio.js; inputs are kept in this browser so they're there next time.

const STORAGE_KEY = "tools.portfolio.v1";
// The reference chart palette's first six slots, in order, checked for colour-blind separation on this surface.
const CLASS_COLORS = {equity: "#3987e5", debt: "#d95926", realEstate: "#199e70", gold: "#c98500", cash: "#d55181", other: "#008300"};
const SERIES = [
    {key: "value", name: "Value", color: "#3987e5", area: true},
    {key: "invested", name: "Invested", color: "#d95926"},
    {key: "real", name: "Today's money", color: "#199e70", dashed: true},
];
// Tagged so Armor's analytics can tell visits from this calculator apart.
const ARMOR_URL = "https://yourarmor.ai/?utm_source=jaskaransethy.com&utm_medium=referral&utm_campaign=portfolio-calculator";
const CURRENCIES = [{value: "INR", label: "₹ Rupees"}, {value: "USD", label: "$ Dollars"}];

const DEFAULTS = {
    currency: "INR",
    holdings: [
        {id: 1, name: "Nifty 50 index fund", assetClass: "equity", value: 600000},
        {id: 2, name: "PPF", assetClass: "debt", value: 300000},
        {id: 3, name: "Gold ETF", assetClass: "gold", value: 50000},
        {id: 4, name: "Savings account", assetClass: "cash", value: 150000},
    ],
    returns: Object.fromEntries(ASSET_CLASSES.map((c) => [c.id, c.expected])),
    targets: {equity: 65, debt: 25, realEstate: 0, gold: 10, cash: 0, other: 0},
    monthly: 25000,
    stepUp: 10,
    years: 15,
    inflation: 6,
};

const sumOf = (values) => values.reduce((a, b) => a + b, 0);

// A money amount after its currency sign, shown with digit grouping (6,00,000 or 600,000) except while it's being
// typed in.
function MoneyInput({value, onChange, currency, label}) {
    const [editing, setEditing] = useState(false);
    return (
        <span className={pc.inputWrap}>
            <span className={pc.affix}>{currency === "INR" ? "₹" : "$"}</span>
            <input className={pc.input} type="text" inputMode="numeric" aria-label={label}
                   value={editing ? String(value || "") : (value || 0).toLocaleString(currency === "INR" ? "en-IN" : "en-US")}
                   onFocus={() => setEditing(true)} onBlur={() => setEditing(false)}
                   onChange={(e) => onChange(Math.round(Number(e.target.value.replace(/[^\d.]/g, ""))) || 0)}/>
        </span>
    );
}

// A labelled number input with an optional suffix (%, yrs), or a money input when `currency` is given.
function NumberField({label, value, onChange, currency, suffix, min = 0, max, step = 1}) {
    return (
        <label className={pc.field}>
            <span className={pc.fieldLabel}>{label}</span>
            {currency ? <MoneyInput value={value} onChange={onChange} currency={currency} label={label}/> : (
                <span className={pc.inputWrap}>
                    <input className={pc.input} type="number" inputMode="decimal" value={value} min={min} max={max} step={step}
                           onChange={(e) => onChange(e.target.value === "" ? 0 : Math.max(min, Number(e.target.value)))}/>
                    {suffix ? <span className={pc.affix}>{suffix}</span> : null}
                </span>
            )}
        </label>
    );
}

function Swatch({id}) {
    return <span className={pc.swatch} style={{background: CLASS_COLORS[id]}}/>;
}

function Holdings({holdings, currency, onChange}) {
    const update = (id, patch) => onChange(holdings.map((h) => (h.id === id ? {...h, ...patch} : h)));
    const add = () => onChange([...holdings, {id: Math.max(0, ...holdings.map((h) => h.id)) + 1, name: "", assetClass: "equity", value: 0}]);
    return (
        <section className={pc.card}>
            <h3 className={pc.heading}>Holdings</h3>
            <ul className={pc.holdings}>
                {holdings.map((h) => (
                    <li key={h.id} className={pc.holding}>
                        <input className={cx(pc.input, pc.holdingName)} value={h.name} placeholder="Name" aria-label="Holding name"
                               onChange={(e) => update(h.id, {name: e.target.value})}/>
                        <select className={cx(pc.input, pc.select)} value={h.assetClass} aria-label="Asset class"
                                onChange={(e) => update(h.id, {assetClass: e.target.value})}>
                            {ASSET_CLASSES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <MoneyInput value={h.value} currency={currency} label={`${h.name || "Holding"} value`}
                                    onChange={(value) => update(h.id, {value})}/>
                        <button type="button" className={pc.remove} aria-label={`Remove ${h.name || "holding"}`}
                                onClick={() => onChange(holdings.filter((other) => other.id !== h.id))}>×</button>
                    </li>
                ))}
            </ul>
            <GameButton className={pc.add} onClick={add}>Add a holding</GameButton>
        </section>
    );
}

// A stacked bar of the split across classes, with a legend that carries the numbers. Hovering either picks out
// a class.
function Allocation({classes, total, blended, currency}) {
    const [hover, setHover] = useState(null);
    const held = classes.filter((c) => c.value);
    const hoverProps = (id) => ({onMouseEnter: () => setHover(id), onMouseLeave: () => setHover(null)});
    return (
        <section className={pc.card}>
            <h3 className={pc.heading}>Allocation</h3>
            <div className={pc.totals}>
                <span><span className={pc.big}>{formatMoney(total, currency, true)}</span><span className={pc.caption}>Total</span></span>
                <span><span className={pc.big}>{blended.toFixed(1)}%</span><span className={pc.caption}>Expected a year</span></span>
            </div>
            {held.length ? (
                <>
                    <div className={pc.stack} role="img" aria-label={held.map((c) => `${c.name} ${Math.round(c.share * 100)}%`).join(", ")}>
                        {held.map((c) => (
                            <span key={c.id} className={cx(pc.segment, hover && hover !== c.id && pc.dim)}
                                  style={{flexGrow: c.value, background: CLASS_COLORS[c.id]}} {...hoverProps(c.id)}/>
                        ))}
                    </div>
                    <ul className={pc.legend}>
                        {held.map((c) => (
                            <li key={c.id} className={cx(pc.legendItem, hover && hover !== c.id && pc.dim)} {...hoverProps(c.id)}>
                                <Swatch id={c.id}/>
                                <span className={pc.legendName}>{c.name}</span>
                                <span className={pc.legendValue}>{formatMoney(c.value, currency, true)}</span>
                                <span className={pc.legendShare}>{Math.round(c.share * 100)}%</span>
                            </li>
                        ))}
                    </ul>
                </>
            ) : <p className={pc.empty}>Add a holding to see the split.</p>}
        </section>
    );
}

function Rebalance({rows, targets, onTargets, currency}) {
    const targetTotal = sumOf(Object.values(targets));
    return (
        <section className={pc.card}>
            <h3 className={pc.heading}>Rebalance to a target mix</h3>
            <p className={pc.note}>Set the mix you want. This shows what to buy or sell to get there without adding money, and new SIPs are split the same way.</p>
            <div className={pc.table} role="table">
                <div className={cx(pc.row, pc.headRow)} role="row">
                    <span role="columnheader">Class</span>
                    <span role="columnheader" className={pc.num}>Now</span>
                    <span role="columnheader" className={pc.num}>Target</span>
                    <span role="columnheader" className={pc.num}>Change</span>
                </div>
                {ASSET_CLASSES.map((c) => {
                    const row = rows.find((r) => r.id === c.id);
                    const change = row?.change ?? 0;
                    return (
                        <div key={c.id} className={pc.row} role="row">
                            <span role="cell" className={pc.className}><Swatch id={c.id}/>{c.name}</span>
                            <span role="cell" className={pc.num}>{row ? `${Math.round(row.share * 100)}%` : "0%"}</span>
                            <span role="cell" className={pc.num}>
                                <span className={cx(pc.inputWrap, pc.targetInput)}>
                                    <input className={pc.input} type="number" inputMode="decimal" min="0" max="100" value={targets[c.id] ?? 0}
                                           aria-label={`${c.name} target percent`}
                                           onChange={(e) => onTargets({...targets, [c.id]: Math.min(100, Math.max(0, Number(e.target.value) || 0))})}/>
                                    <span className={pc.affix}>%</span>
                                </span>
                            </span>
                            <span role="cell" className={cx(pc.num, pc.change)}>
                                {Math.abs(change) < 1 ? "—" : `${change > 0 ? "Buy" : "Sell"} ${formatMoney(Math.abs(change), currency, true)}`}
                            </span>
                        </div>
                    );
                })}
            </div>
            <p className={cx(pc.note, targetTotal !== 100 && pc.warn)}>
                Targets add up to {targetTotal}%{targetTotal === 100 ? "." : ". Make them add up to 100% for the buy and sell amounts to balance."}
            </p>
        </section>
    );
}

export default function PortfolioCalculator() {
    const [state, setState] = useState(DEFAULTS);
    const [loaded, setLoaded] = useState(false);
    // Read saved inputs after mounting, so the server render and the first client render agree.
    useEffect(() => {
        const saved = readJSON(STORAGE_KEY);
        if (saved) setState({...DEFAULTS, ...saved});
        setLoaded(true);
    }, []);
    useEffect(() => {
        if (loaded) writeJSON(STORAGE_KEY, state);
    }, [state, loaded]);
    const set = (patch) => setState((s) => ({...s, ...patch}));

    const {currency, holdings, returns, targets, monthly, stepUp, years, inflation} = state;
    const classes = useMemo(() => allocation(holdings), [holdings]);
    const total = sumOf(classes.map((c) => c.value));
    const blended = blendedReturn(holdings, returns);
    const points = useMemo(() => {
        // SIPs follow the target mix; until that adds up to 100%, they follow today's split.
        const mix = sumOf(Object.values(targets)) === 100
            ? Object.fromEntries(Object.entries(targets).map(([id, pct]) => [id, pct / 100]))
            : Object.fromEntries(classes.map((c) => [c.id, c.share]));
        return project({holdings, returns, mix, monthly, stepUp, years, inflation});
    }, [holdings, classes, returns, targets, monthly, stepUp, years, inflation]);
    const end = points.at(-1);
    const money = (value, compact) => formatMoney(value, currency, compact);

    return (
        <div className={pc.calculator}>
            <div className={pc.topBar}>
                <Toggle label="Currency" options={CURRENCIES} value={currency} onChange={(value) => set({currency: value})}/>
                <button type="button" className={pc.reset} onClick={() => setState(DEFAULTS)}>Reset to example</button>
            </div>

            <div className={pc.pair}>
                <Holdings holdings={holdings} currency={currency} onChange={(next) => set({holdings: next})}/>
                <Allocation classes={classes} total={total} blended={blended} currency={currency}/>
            </div>

            <section className={pc.card}>
                <h3 className={pc.heading}>Projection</h3>
                <div className={pc.fields}>
                    <NumberField label="Monthly SIP" currency={currency} value={monthly} onChange={(v) => set({monthly: v})}/>
                    <NumberField label="Yearly step-up" suffix="%" value={stepUp} max={50} onChange={(v) => set({stepUp: v})}/>
                    <NumberField label="Years" suffix="yrs" value={years} min={1} max={50} onChange={(v) => set({years: Math.min(50, Math.round(v) || 1)})}/>
                    <NumberField label="Inflation" suffix="%" value={inflation} max={20} step={0.5} onChange={(v) => set({inflation: v})}/>
                </div>
                <ul className={pc.stats}>
                    <li><span className={pc.big}>{money(end.value, true)}</span><span className={pc.caption}>Projected value</span></li>
                    <li><span className={pc.big}>{money(end.invested, true)}</span><span className={pc.caption}>Invested</span></li>
                    <li><span className={pc.big}>{money(end.value - end.invested, true)}</span><span className={pc.caption}>Growth</span></li>
                    <li><span className={pc.big}>{money(end.real, true)}</span><span className={pc.caption}>In today&rsquo;s money</span></li>
                </ul>
                <div className={pc.chartLegend}>
                    {SERIES.map((s) => (
                        <span key={s.key} className={pc.legendItem}>
                            <span className={cx(pc.swatch, s.dashed && pc.dashedSwatch)} style={{background: s.color}}/>{s.name}
                        </span>
                    ))}
                </div>
                <GrowthChart points={points} series={SERIES} format={money}/>
                <details className={pc.assumptions}>
                    <summary>Return assumptions</summary>
                    <p className={pc.note}>Expected yearly return for each class. Change them to match your own view.</p>
                    <div className={pc.fields}>
                        {ASSET_CLASSES.map((c) => (
                            <NumberField key={c.id} label={c.name} suffix="%" value={returns[c.id]} max={40} step={0.5}
                                         onChange={(v) => set({returns: {...returns, [c.id]: v}})}/>
                        ))}
                    </div>
                </details>
            </section>

            <Rebalance rows={rebalance(holdings, targets)} targets={targets} onTargets={(next) => set({targets: next})} currency={currency}/>

            <a href={ARMOR_URL} target="_blank" rel="noopener" className={pc.armor}>
                <img src="/logos/armor.svg" alt="" className={pc.armorLogo}/>
                <span className={pc.armorText}>
                    <span className={pc.armorTitle}>Want a calculator backed by years of financial advisory?</span>
                    <span className={pc.armorSub}>Try Armor at yourarmor.ai</span>
                </span>
                <span className={pc.armorGlyph} aria-hidden="true">→</span>
            </a>

            <p className={pc.disclaimer}>
                A calculator, not advice. Projections assume each class returns its assumed rate every year; real markets
                don&rsquo;t move in straight lines. Everything stays in your browser.
            </p>
        </div>
    );
}
