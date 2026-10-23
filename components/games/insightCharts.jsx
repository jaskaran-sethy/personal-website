import cx from "../../lib/cx";
import {SENTIMENT_LABELS} from "./insightParts";
import ie from "./insightExtractor.module.css";
import ch from "./insightCharts.module.css";

// Summary charts for Insight Extractor's product view, all horizontal bar charts on one component. Positive is
// blue and negative red (a pair that stays apart for colour-blind readers); mixed is the two striped together and
// neutral is grey. Every bar has its words beside it, so nothing is told by colour alone.

const MIX_ORDER = ["positive", "mixed", "neutral", "negative"];
const SPLIT_ORDER = ["positive", "neutral", "negative"];
const percent = (part, total) => (total ? Math.round((part / total) * 100) : 0);

function Legend({sentiments}) {
    return (
        <span className={ch.legend}>
            {sentiments.map((sentiment) => (
                <span key={sentiment} className={ch.legendItem}>
                    <span className={cx(ch.swatch, ch[sentiment])}/>{SENTIMENT_LABELS[sentiment]}
                </span>
            ))}
        </span>
    );
}

// A titled list of bars. Each row: {key, label, segments: [{sentiment, value}], value, tooltip}. A row's bar
// length is its total against the biggest row; its segments split it by sentiment. With `onSelect`, rows are
// buttons (and `selected` marks one); hovering or focusing a row shows its tooltip.
function BarChart({title, legend, rows, selected, onSelect}) {
    const max = Math.max(1, ...rows.map((row) => row.segments.reduce((sum, s) => sum + s.value, 0)));
    const Row = onSelect ? "button" : "div";
    return (
        <figure className={ch.chart}>
            <figcaption className={ch.caption}>
                <h3 className={ie.heading}>{title}</h3>
                {legend ? <Legend sentiments={legend}/> : null}
            </figcaption>
            <ul className={ch.rows}>
                {rows.map((row) => {
                    const total = row.segments.reduce((sum, s) => sum + s.value, 0);
                    return (
                        <li key={row.key}>
                            <Row className={cx(ch.row, onSelect && ch.clickable, selected === row.key && ch.rowActive)}
                                 {...(onSelect ? {type: "button", "aria-pressed": selected === row.key, onClick: () => onSelect(row.key)} : {})}
                                 aria-label={row.tooltip} tabIndex={onSelect ? undefined : 0}>
                                <span className={ch.rowLabel}>{row.label}</span>
                                <span className={ch.track}>
                                    <span className={ch.bar} style={{width: `${(total / max) * 100}%`}}>
                                        {row.segments.filter((s) => s.value).map((s) => (
                                            <span key={s.sentiment} className={cx(ch.segment, ch[s.sentiment])} style={{flexGrow: s.value}}/>
                                        ))}
                                    </span>
                                </span>
                                <span className={ch.value}>{row.value}</span>
                                <span className={ch.tooltip} aria-hidden="true">{row.tooltip}</span>
                            </Row>
                        </li>
                    );
                })}
            </ul>
        </figure>
    );
}

// How many reviews read positive, mixed, neutral or negative overall.
export function SentimentBreakdown({mix}) {
    const total = MIX_ORDER.reduce((sum, key) => sum + mix[key], 0);
    return (
        <BarChart title="Sentiment breakdown" rows={MIX_ORDER.map((sentiment) => ({
            key: sentiment,
            label: SENTIMENT_LABELS[sentiment],
            segments: [{sentiment, value: mix[sentiment]}],
            value: `${mix[sentiment]} · ${percent(mix[sentiment], total)}%`,
            tooltip: `${mix[sentiment]} of ${total} reviews read ${sentiment}`,
        }))}/>
    );
}

// How many reviews talk about each label, split by how they feel about it.
export function LabelBreakdown({labels, selected, onSelect}) {
    return (
        <BarChart title="Label breakdown" legend={SPLIT_ORDER} selected={selected} onSelect={onSelect}
                  rows={labels.map((row) => ({
                      key: row.label,
                      label: row.label,
                      segments: SPLIT_ORDER.map((sentiment) => ({sentiment, value: row[sentiment]})),
                      value: row.total,
                      tooltip: `${row.label}: ${row.positive} positive · ${row.neutral} neutral · ${row.negative} negative`,
                  }))}/>
    );
}

// The most common label : sentiment pairs. Picking one shows that label's quotes.
export function TopCombos({combos, selected, onSelect}) {
    return (
        <BarChart title="Most common label : sentiment" selected={selected} onSelect={(key) => onSelect(key.split("|")[0])}
                  rows={combos.map((combo) => ({
                      key: `${combo.label}|${combo.sentiment}`,
                      label: <>{combo.label} <span className={ch.sentimentWord}>· {SENTIMENT_LABELS[combo.sentiment]}</span></>,
                      segments: [{sentiment: combo.sentiment, value: combo.count}],
                      value: combo.count,
                      tooltip: `${combo.count} review${combo.count === 1 ? " was" : "s were"} ${combo.sentiment} about ${combo.label}`,
                  }))}/>
    );
}
