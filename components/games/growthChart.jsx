import {useEffect, useRef, useState} from "react";
import pc from "./portfolioCalculator.module.css";

// A line chart of a projection over years: one line per series, a recessive grid, labels at the line ends, and a
// crosshair with a tooltip on hover (or touch). Drawn at the container's real width so text stays crisp.
// `points` is [{year, …values}]; `series` is [{key, name, color, dashed?, area?}]; `format(value, compact)` formats money.
// Colours are applied as styles, not SVG attributes, so they can be CSS variables that follow the theme.

const PAD = {top: 12, right: 84, bottom: 26, left: 58};
const NARROW = 440; // Below this width the end labels go (the legend names the lines) so the plot keeps its room.
const LABEL_GAP = 14; // Minimum vertical room between end labels.
const TOOLTIP_WIDTH = 220; // Matches .tooltip; it sits right of the crosshair, or left when that would overflow.

function useWidth(ref) {
    const [width, setWidth] = useState(0);
    useEffect(() => {
        const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
        observer.observe(ref.current);
        return () => observer.disconnect();
    }, [ref]);
    return width;
}

// Round numbers for the y axis: about four steps of 1, 2 or 5 × a power of ten.
function niceTicks(max) {
    const raw = max / 4;
    const power = 10 ** Math.floor(Math.log10(raw || 1));
    const step = [1, 2, 5, 10].map((m) => m * power).find((s) => s >= raw);
    return Array.from({length: Math.ceil(max / step) + 1}, (_, i) => i * step);
}

// Spreads end labels so they don't overlap, keeping them as close to their lines as possible.
function spread(labels) {
    const sorted = [...labels].sort((a, b) => a.y - b.y);
    for (let i = 1; i < sorted.length; i++) sorted[i].y = Math.max(sorted[i].y, sorted[i - 1].y + LABEL_GAP);
    return sorted;
}

export default function GrowthChart({points, series, format}) {
    const box = useRef(null);
    const width = useWidth(box);
    const [hover, setHover] = useState(null);
    const years = points.length - 1;
    const narrow = width < NARROW;
    const height = narrow ? 220 : 260;
    const pad = narrow ? {...PAD, right: 12, left: 48} : PAD;
    const ticks = niceTicks(Math.max(1, ...points.flatMap((p) => series.map((s) => p[s.key]))));
    const top = ticks.at(-1);
    const plotWidth = Math.max(1, width - pad.left - pad.right);
    const plotHeight = height - pad.top - pad.bottom;
    const x = (year) => pad.left + (years ? (year / years) * plotWidth : 0);
    const y = (value) => pad.top + plotHeight - (value / top) * plotHeight;
    const line = (key) => points.map((p, i) => `${i ? "L" : "M"}${x(p.year).toFixed(1)},${y(p[key]).toFixed(1)}`).join("");
    const yearStep = years <= 10 ? 1 : years <= 20 ? 5 : 10;
    const last = points.at(-1);
    const endLabels = spread(series.map((s) => ({...s, y: y(last[s.key])})));

    function track(event) {
        const rect = box.current.getBoundingClientRect();
        const year = Math.round(((event.clientX - rect.left - pad.left) / plotWidth) * years);
        setHover(Math.min(years, Math.max(0, year)));
    }

    const point = hover === null ? null : points[hover];
    return (
        <div ref={box} className={pc.chartBox} onPointerMove={track} onPointerDown={track} onPointerLeave={() => setHover(null)}>
            {width ? (
                <svg width={width} height={height} role="img"
                     aria-label={`Projection over ${years} years: ${series.map((s) => `${s.name} ${format(last[s.key], true)}`).join(", ")}`}>
                    {ticks.map((tick) => (
                        <g key={tick}>
                            <line x1={pad.left} x2={pad.left + plotWidth} y1={y(tick)} y2={y(tick)} className={pc.grid}/>
                            <text x={pad.left - 8} y={y(tick)} className={pc.axis} textAnchor="end" dominantBaseline="middle">
                                {format(tick, true)}
                            </text>
                        </g>
                    ))}
                    {points.filter((p) => p.year % yearStep === 0).map((p) => (
                        <text key={p.year} x={x(p.year)} y={height - 6} className={pc.axis} textAnchor="middle">
                            {p.year ? `Y${p.year}` : "Now"}
                        </text>
                    ))}
                    {series.filter((s) => s.area).map((s) => (
                        <path key={`${s.key}-area`} style={{fill: s.color}} opacity="0.1"
                              d={`${line(s.key)}L${x(years)},${y(0)}L${x(0)},${y(0)}Z`}/>
                    ))}
                    {series.map((s) => (
                        <path key={s.key} d={line(s.key)} fill="none" style={{stroke: s.color}} strokeWidth="2"
                              strokeDasharray={s.dashed ? "5 4" : undefined} strokeLinejoin="round" strokeLinecap="round"/>
                    ))}
                    {narrow ? null : endLabels.map((s) => (
                        <text key={s.key} x={x(years) + 8} y={s.y} className={pc.endLabel} dominantBaseline="middle">
                            {s.name}
                        </text>
                    ))}
                    {point ? (
                        <g>
                            <line x1={x(point.year)} x2={x(point.year)} y1={pad.top} y2={pad.top + plotHeight} className={pc.crosshair}/>
                            {series.map((s) => (
                                <circle key={s.key} cx={x(point.year)} cy={y(point[s.key])} r="4.5" style={{fill: s.color}} className={pc.marker}/>
                            ))}
                        </g>
                    ) : null}
                </svg>
            ) : <div style={{height: 260}}/>}
            {point ? (
                <div className={pc.tooltip} style={x(point.year) + 12 + TOOLTIP_WIDTH > width
                    ? {left: Math.max(0, x(point.year) - 12 - TOOLTIP_WIDTH)} : {left: x(point.year) + 12}}>
                    <strong>{point.year ? `Year ${point.year}` : "Today"}</strong>
                    {series.map((s) => (
                        <span key={s.key} className={pc.tooltipRow}>
                            <span className={pc.swatch} style={{background: s.color}}/>
                            {s.name}
                            <span className={pc.tooltipValue}>{format(point[s.key])}</span>
                        </span>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
