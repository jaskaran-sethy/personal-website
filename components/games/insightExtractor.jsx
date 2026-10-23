import {useEffect, useLayoutEffect, useMemo, useRef, useState} from "react";
import cx from "../../lib/cx";
import {analyze} from "../../lib/insights";
import {Toggle} from "./kit";
import {highlightParts, InsightSidePanel, OverallCard, SentimentChip} from "./insightParts";
import {useDocked} from "./sidePanel";
import ProductInsights from "./productInsights";
import ie from "./insightExtractor.module.css";

// Insight Extractor: type or paste customer feedback and it pulls out the insightful phrases, labels what each is
// about, scores its sentiment, then gives the whole message a sentiment and sums up each label. A small, in-browser
// take on Sprinklr's Product Insights (see lib/insights.js for how it works). It updates as you type.
// "Product reviews" does the same across an Amazon or Flipkart product's reviews (see productInsights.jsx).

const EXAMPLES = [
    {name: "Phone review", text: "The camera is absolutely stunning and the screen is so bright, but the battery drains fast and it overheats while gaming. Customer service was not helpful at all."},
    {name: "Restaurant", text: "The pizza was cold and bland, and the waiter was rude. Great view though! Desserts were delicious and fairly priced."},
    {name: "Hotel stay", text: "Check-in was quick and the staff were super friendly. The room was spotless and the bed was comfortable, but the wifi kept dropping and breakfast was overpriced."},
    {name: "Online order", text: "Delivery was late by three days and the box was damaged. The headphones sound great though, and noise cancelling is impressive for the price."},
];

const MODES = [{value: "message", label: "Message"}, {value: "product", label: "Product reviews"}];

// A bar centred on zero: right for positive, left for negative. Scores run about -2 … +2.
function ScoreBar({score}) {
    const amount = Math.min(1, Math.abs(score) / 2) * 50;
    return (
        <span className={ie.bar} aria-hidden="true">
            <span className={cx(ie.barFill, score >= 0 ? ie.barPositive : ie.barNegative)}
                  style={score >= 0 ? {left: "50%", width: `${amount}%`} : {right: "50%", width: `${amount}%`}}/>
        </span>
    );
}

// Measures before paint in the browser; falls back quietly when server rendering.
const useBrowserLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

// The feedback box, with each insight highlighted right in it: a backdrop behind the (transparent) textarea draws
// the same text, in the same font and wrapping, with the highlights. The box grows to fit its text, so it never
// scrolls and the two layers stay lined up.
function HighlightedInput({text, insights, onChange}) {
    const field = useRef(null);
    useBrowserLayoutEffect(() => {
        field.current.style.height = "auto";
        field.current.style.height = `${field.current.scrollHeight}px`;
    }, [text]);
    return (
        <div className={ie.editor}>
            <div className={ie.backdrop} aria-hidden="true">
                {highlightParts(text, insights)}
                {/* A trailing newline needs something after it to take up a line, as it does in the textarea. */}
                {"​"}
            </div>
            <textarea id="insight-input" ref={field} className={ie.textarea} rows={4} value={text} spellCheck={false}
                      placeholder="Paste a review, a support message or a tweet…" onChange={(e) => onChange(e.target.value)}/>
        </div>
    );
}

function MessageInsights() {
    const [text, setText] = useState(EXAMPLES[0].text);
    // Analysed on every keystroke (it's quick), so the highlights always match what's in the box.
    const {insights, summary, overall} = useMemo(() => analyze(text), [text]);
    const docked = useDocked();
    const counts = {positive: 0, negative: 0, neutral: 0};
    for (const span of new Map(insights.map((i) => [i.start, i])).values()) counts[span.sentiment]++;

    return (
        <>
            <div className={ie.input}>
                <label htmlFor="insight-input" className={ie.kicker}>CUSTOMER FEEDBACK</label>
                <HighlightedInput text={text} insights={insights} onChange={setText}/>
                <div className={ie.examples}>
                    <span className={ie.kicker}>TRY</span>
                    {EXAMPLES.map((example) => (
                        <button key={example.name} type="button" className={ie.example} onClick={() => setText(example.text)}>
                            {example.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className={cx(ie.results, docked && ie.resultsDocked)}>
                <div className={ie.main}>
                    <h3 className={ie.kicker}>INSIGHTS</h3>
                    {insights.length ? (
                        <>
                            <ul className={ie.insights}>
                                {insights.map((insight, i) => (
                                    <li key={i} className={ie.insight}>
                                        <span className={ie.phrase}>“{insight.phrase}”</span>
                                        <span className={ie.meta}>
                                            <span className={ie.label}>{insight.label}</span>
                                            <SentimentChip sentiment={insight.sentiment}/>
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </>
                    ) : (
                        <p className={ie.empty}>No opinions found yet. Try saying how something was, e.g. “the battery is great”.</p>
                    )}
                </div>

                <InsightSidePanel>
                    <OverallCard sentiment={overall.sentiment} empty={!insights.length}
                                 detail={`${counts.positive} positive · ${counts.negative} negative${counts.neutral ? ` · ${counts.neutral} neutral` : ""}`}/>
                    <div className={ie.summary}>
                        <span className={ie.kicker}>BY LABEL</span>
                        {summary.length ? (
                            <ul className={ie.summaryList}>
                                {summary.map((row) => (
                                    <li key={row.label} className={ie.summaryRow}>
                                        <span className={ie.summaryLabel}>{row.label}</span>
                                        <ScoreBar score={row.score}/>
                                        <SentimentChip sentiment={row.sentiment}/>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className={ie.empty}>Labels appear here.</p>}
                    </div>
                </InsightSidePanel>
            </div>
        </>
    );
}

export default function InsightExtractor() {
    const [mode, setMode] = useState("message");
    // ?mode=product opens the product view (the helper extension's toolbar button links there).
    useEffect(() => {
        if (new URLSearchParams(location.search).get("mode") === "product") setMode("product");
    }, []);
    return (
        <div className={ie.extractor}>
            <div className={ie.modes}>
                <Toggle label="What to analyse" options={MODES} value={mode} onChange={setMode}/>
            </div>
            {mode === "message" ? <MessageInsights/> : <ProductInsights/>}
            <p className={ie.note}>
                Runs entirely in your browser with a hand-built lexicon: a small take on Product Insights at Sprinklr,
                where I worked on the NLP models (fine-tuned transformers) that do this at scale.
            </p>
        </div>
    );
}
