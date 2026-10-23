import cx from "../../lib/cx";
import ie from "./insightExtractor.module.css";

// Pieces Insight Extractor's message and product views share.

export const SENTIMENT_LABELS = {positive: "Positive", negative: "Negative", neutral: "Neutral", mixed: "Mixed"};

export function SentimentChip({sentiment}) {
    return <span className={cx(ie.chip, ie[sentiment])}>{SENTIMENT_LABELS[sentiment]}</span>;
}

// The text split into plain runs and <mark>s, one per insight phrase, classed by sentiment. Insights share a
// phrase when one clause covers two labels, so phrases are de-duplicated by position.
export function highlightParts(text, insights) {
    const spans = [...new Map(insights.map((i) => [i.start, i])).values()].sort((a, b) => a.start - b.start);
    const parts = [];
    let at = 0;
    for (const span of spans) {
        if (span.start > at) parts.push(text.slice(at, span.start));
        parts.push(<mark key={span.start} className={cx(ie.mark, ie[span.sentiment])}>{text.slice(span.start, span.end)}</mark>);
        at = span.end;
    }
    parts.push(text.slice(at));
    return parts;
}

// Text with each insight's phrase highlighted in its sentiment colour.
export function Highlighted({text, insights, className}) {
    return <p className={cx(ie.highlighted, className)}>{highlightParts(text, insights)}</p>;
}

// The big overall sentiment word, with a line of detail under it. Shows a dash when there's nothing to judge.
export function OverallCard({sentiment, detail, empty}) {
    return (
        <div className={ie.overall}>
            <span className={ie.kicker}>OVERALL</span>
            <span className={cx(ie.overallWord, !empty && ie[sentiment])}>{empty ? "—" : SENTIMENT_LABELS[sentiment]}</span>
            {!empty && detail ? <span className={ie.counts}>{detail}</span> : null}
        </div>
    );
}
