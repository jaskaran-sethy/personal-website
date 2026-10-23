import {useState} from "react";
import {fetchThroughExtension, useExtension} from "../../lib/extensionBridge";
import {MAX_PAGES, fetchProductReviews, parseProductUrl, summarizeReviews} from "../../lib/productReviews";
import {GameButton} from "./kit";
import {Highlighted, OverallCard, SentimentChip} from "./insightParts";
import {LabelBreakdown, SentimentBreakdown, TopCombos} from "./insightCharts";
import ie from "./insightExtractor.module.css";
import pi from "./productInsights.module.css";

// Insight Extractor's product view: paste an Amazon or Flipkart product link and it reads the product's reviews
// through the helper extension (from the visitor's own browser, never this site's server), runs the insight engine
// over each, and charts the result.

const EXAMPLES = [
    {name: "iPhone 15 on Amazon", url: "https://www.amazon.in/dp/B0CHX1W1XY"},
    {name: "iPhone 15 on Flipkart", url: "https://www.flipkart.com/apple-iphone-15-blue-128-gb/p/itm387c20f1f5347?pid=MOBHQV9YZGYG64U7"},
];
const SHOP_NAMES = {amazon: "Amazon", flipkart: "Flipkart"};
// The helper extension lives in its own public repo; its releases carry the built zip.
const EXTENSION_REPO = "https://github.com/jaskaran-sethy/insight-extractor-extension";
const EXTENSION_ZIP = `${EXTENSION_REPO}/releases/latest/download/insight-extractor-extension.zip`;
const CHART_ROWS = 8;

const stars = (rating) => (Number.isFinite(rating) ? "★".repeat(Math.round(rating)) + "☆".repeat(5 - Math.round(rating)) : "");

function InstallGuide() {
    return (
        <div className={pi.install}>
            <span className={ie.kicker}>ONE-TIME SETUP</span>
            <p>
                Shops don&rsquo;t let other websites read their pages, so a tiny browser extension fetches the reviews
                from <em>your</em> browser. Nothing goes through my server.
            </p>
            <ol className={pi.steps}>
                <li><a href={EXTENSION_ZIP}>Download the extension</a> and unzip it.</li>
                <li>Open <code>chrome://extensions</code> (or <code>edge://extensions</code>) and turn on <strong>Developer mode</strong>.</li>
                <li>Click <strong>Load unpacked</strong> and pick the unzipped folder.</li>
                <li>Reload this page.</li>
            </ol>
            <p className={pi.fine}>
                Desktop Chrome, Edge or Brave. It can only read amazon.in, amazon.com and flipkart.com, and only when you
                press Analyse here. <a href={EXTENSION_REPO}>Source on GitHub</a>.
            </p>
        </div>
    );
}

function Results({result, selected, onSelect}) {
    const {product, details, stopped, summary} = result;
    const {reviews, mix, labels, combos, overall, averageRating} = summary;
    const label = labels.find((row) => row.label === selected);
    const opinionated = reviews.length - mix.neutral;

    return (
        <>
            <div className={pi.product}>
                <span className={ie.kicker}>{SHOP_NAMES[product.shop].toUpperCase()}</span>
                <h3 className={pi.name}>{details.name ?? "This product"}</h3>
                {details.rating ? (
                    <span className={pi.shopRating}>
                        {details.rating.toFixed(1)} ★ on {SHOP_NAMES[product.shop]}
                        {details.ratings ? ` from ${details.ratings.toLocaleString("en-IN")} ratings` : ""}
                    </span>
                ) : null}
                {stopped === "signin" ? (
                    <p className={pi.notice}>Amazon only shows the top reviews to signed-out visitors. Sign in to Amazon in this browser to analyse more.</p>
                ) : null}
                {stopped === "captcha" ? (
                    <p className={pi.notice}>Amazon asked for a captcha partway through, so this covers the reviews read before it.</p>
                ) : null}
            </div>

            <div className={ie.results}>
                <div className={ie.main}>
                    {labels.length ? (
                        <>
                            <LabelBreakdown labels={labels.slice(0, CHART_ROWS)} selected={selected} onSelect={onSelect}/>
                            <TopCombos combos={combos.slice(0, CHART_ROWS)} onSelect={onSelect}/>
                            {label ? (
                                <div className={ie.main}>
                                    <h3 className={ie.kicker}>WHAT REVIEWS SAY ABOUT {label.label.toUpperCase()}</h3>
                                    <ul className={ie.insights}>
                                        {label.quotes.map((quote) => (
                                            <li key={quote.phrase} className={ie.insight}>
                                                <span className={ie.phrase}>“{quote.phrase}”</span>
                                                <SentimentChip sentiment={quote.sentiment}/>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : null}
                        </>
                    ) : <p className={ie.empty}>These reviews don&rsquo;t say how anything in particular was.</p>}

                    <details className={pi.reviews}>
                        <summary className={pi.reviewsToggle}>Read all {reviews.length} reviews</summary>
                        <ul className={pi.reviewList}>
                            {reviews.map((review) => (
                                <li key={review.id} className={pi.review}>
                                    <span className={pi.reviewHead}>
                                        <span className={pi.stars} aria-label={`${review.rating} out of 5 stars`}>{stars(review.rating)}</span>
                                        <SentimentChip sentiment={review.sentiment}/>
                                    </span>
                                    <Highlighted text={review.body} insights={review.result.insights} className={pi.reviewText}/>
                                </li>
                            ))}
                        </ul>
                    </details>
                </div>

                <aside className={ie.side}>
                    <OverallCard sentiment={overall.sentiment} empty={!opinionated}
                                 detail={`Across ${opinionated} review${opinionated === 1 ? "" : "s"} with an opinion`}/>
                    <SentimentBreakdown mix={mix}/>
                    <div className={ie.summary}>
                        <span className={ie.kicker}>REVIEWS READ</span>
                        <span className={pi.big}>{reviews.length}</span>
                        {averageRating ? <span className={ie.counts}>averaging {averageRating.toFixed(1)} ★</span> : null}
                    </div>
                </aside>
            </div>
        </>
    );
}

export default function ProductInsights() {
    const extension = useExtension();
    const [link, setLink] = useState("");
    const [state, setState] = useState({status: "idle"});
    const [selected, setSelected] = useState(null);
    const product = parseProductUrl(link);
    const busy = state.status === "loading";

    async function analyse(event) {
        event.preventDefault();
        if (!product || busy) return;
        setState({status: "loading", count: 0});
        try {
            const {details, reviews, stopped} = await fetchProductReviews(product, fetchThroughExtension,
                (count) => setState({status: "loading", count}));
            const summary = summarizeReviews(reviews);
            setSelected(summary.labels[0]?.label ?? null);
            setState({status: "done", result: {product, details, stopped, summary}});
        } catch (error) {
            setState({status: "error", message: error.message});
        }
    }

    return (
        <>
            {extension.status === "missing" ? <InstallGuide/> : null}

            <form className={ie.input} onSubmit={analyse}>
                <label htmlFor="product-link" className={ie.kicker}>AMAZON OR FLIPKART PRODUCT LINK</label>
                <div className={pi.linkRow}>
                    <input id="product-link" className={pi.link} type="url" inputMode="url" value={link} spellCheck={false}
                           placeholder="https://www.amazon.in/dp/…" onChange={(e) => setLink(e.target.value)}/>
                    <GameButton type="submit" active disabled={extension.status !== "ready" || !product || busy}>
                        {busy ? "Reading…" : "Analyse"}
                    </GameButton>
                </div>
                {link && !product ? (
                    <p className={pi.hint}>That doesn&rsquo;t look like an amazon.in, amazon.com or flipkart.com product page link.</p>
                ) : null}
                <div className={ie.examples}>
                    <span className={ie.kicker}>TRY</span>
                    {EXAMPLES.map((example) => (
                        <button key={example.name} type="button" className={ie.example} onClick={() => setLink(example.url)}>
                            {example.name}
                        </button>
                    ))}
                </div>
            </form>

            <p className={pi.status} aria-live="polite">
                {busy ? `Reading reviews… ${state.count} so far (up to ${MAX_PAGES} pages).` : null}
                {state.status === "error" ? state.message : null}
            </p>

            {state.status === "done" ? <Results result={state.result} selected={selected} onSelect={setSelected}/> : null}
        </>
    );
}
