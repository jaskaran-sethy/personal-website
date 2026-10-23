import {analyze, overallOf} from "./insights";

// Product reviews for Insight Extractor: recognise an Amazon or Flipkart product link, page through its reviews
// (fetched by the helper extension, from the visitor's own browser), and sum up what they say per label.
//
// Amazon: the product page carries the top ~10 reviews; more pages need the visitor to be signed in to Amazon.
// Flipkart: review pages are server-rendered with their data in window.__INITIAL_STATE__, 10 reviews a page.

export const MAX_PAGES = 10;
const PAUSE_MS = 400; // Between page requests, to be gentle on the shop (and look less like a bot).

// {shop, …ids} for a product link we can read, or null.
export function parseProductUrl(input) {
    let url;
    try {
        url = new URL(input.trim());
    } catch {
        return null;
    }
    const host = url.hostname.replace(/^(?:www|m)\./, "");
    if (host === "amazon.in" || host === "amazon.com") {
        const asin = url.pathname.match(/\/(?:dp|gp\/product|gp\/aw\/d|product-reviews)\/([a-z0-9]{10})(?:[/?]|$)/i)?.[1];
        return asin ? {shop: "amazon", origin: `https://www.${host}`, asin: asin.toUpperCase()} : null;
    }
    if (host === "flipkart.com") {
        const match = url.pathname.match(/^\/([^/]+)\/(?:p|product-reviews)\/(itm[a-z0-9]+)/i);
        const pid = url.searchParams.get("pid");
        return match && pid ? {shop: "flipkart", slug: match[1], item: match[2], pid, lid: url.searchParams.get("lid")} : null;
    }
    return null;
}

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const parseHtml = (html) => new DOMParser().parseFromString(html, "text/html"); // Inert: no scripts run, nothing loads.
const clean = (text = "") => text.replace(/[⭐★☆]/gu, " ").replace(/\s+/g, " ").trim();
const firstNumber = (text = "") => parseFloat(text.replace(/,/g, "").match(/\d+(?:\.\d+)?/)?.[0] ?? "NaN");

// Amazon

function amazonReviews(doc) {
    return [...doc.querySelectorAll('[data-hook="review"]')].map((el) => {
        // The rich-content container holds just the review; around it are screen-reader hints and "Read more".
        const body = el.querySelector('[data-hook="reviewRichContentContainer"]')
            ?? el.querySelector('[data-hook="review-body"] span')
            ?? el.querySelector('[data-hook="review-body"]');
        const title = el.querySelector('[data-hook="reviewTitle"], [data-hook="review-title"]');
        return {
            id: el.id,
            rating: firstNumber(el.querySelector('[data-hook*="review-star-rating"]')?.textContent),
            // Older markup puts "5.0 out of 5 stars" inside the title link.
            title: clean(title?.textContent).replace(/^\d(?:\.\d)? out of 5 stars\s*/i, ""),
            text: clean(body?.textContent),
        };
    }).filter((review) => review.id && (review.text || review.title));
}

function amazonDetails(doc) {
    return {
        name: clean(doc.querySelector("#productTitle")?.textContent) || null,
        rating: firstNumber(doc.querySelector('[data-hook="rating-out-of-text"]')?.textContent) || null,
        ratings: firstNumber(doc.querySelector('[data-hook="total-review-count"]')?.textContent) || null,
    };
}

const amazonBlocked = (doc) => Boolean(doc.querySelector('form[action*="validateCaptcha"]'));

// Flipkart

function flipkartState(html) {
    const script = [...parseHtml(html).scripts].find((s) => s.textContent.includes("__INITIAL_STATE__"));
    if (!script) return null;
    const code = script.textContent;
    try {
        return JSON.parse(code.slice(code.indexOf("{"), code.lastIndexOf("}") + 1));
    } catch {
        return null;
    }
}

// Walks the page state for review values and the rating summary.
function flipkartContent(state) {
    const reviews = [];
    let summary = null;
    (function walk(node) {
        if (!node || typeof node !== "object") return;
        if (node.type === "ProductReviewValue" && node.id) {
            reviews.push({id: node.id, rating: Number(node.rating), title: clean(node.title), text: clean(node.text)});
        }
        if (node.type === "UgcRatingValue" && !summary) summary = node;
        for (const key in node) walk(node[key]);
    })(state);
    return {reviews, summary};
}

// "apple-iphone-15-blue-128-gb" → "Apple Iphone 15 Blue 128 Gb". Flipkart's review page doesn't name the product.
const nameFromSlug = (slug) => slug.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");

// Fetches up to MAX_PAGES pages of reviews. `fetchPage(url)` resolves to {ok, status, url, html}; `onProgress`
// gets the running count. Resolves to {details, reviews, stopped} where `stopped` says why paging ended early
// ("signin" when Amazon wants a sign-in for more pages, "captcha" when it asks for one), or throws when nothing
// could be read.
export async function fetchProductReviews(product, fetchPage, onProgress = () => {}) {
    const found = new Map();
    const add = (reviews) => {
        const before = found.size;
        for (const review of reviews) if (!found.has(review.id)) found.set(review.id, review);
        onProgress(found.size);
        return found.size - before;
    };
    let details = {};
    let stopped = null;

    if (product.shop === "amazon") {
        const first = await fetchPage(`${product.origin}/dp/${product.asin}`);
        const doc = parseHtml(first.html);
        if (amazonBlocked(doc)) throw new Error("Amazon asked for a captcha. Open Amazon in a tab, complete it, then try again.");
        if (!first.ok) throw new Error(`Amazon answered ${first.status}. Check the link opens the product.`);
        details = amazonDetails(doc);
        add(amazonReviews(doc));
        for (let page = 1; page <= MAX_PAGES; page++) {
            await pause(PAUSE_MS);
            const response = await fetchPage(`${product.origin}/product-reviews/${product.asin}?pageNumber=${page}`);
            if (/\/ap\/signin/.test(response.url)) {
                stopped = "signin";
                break;
            }
            const pageDoc = parseHtml(response.html);
            if (amazonBlocked(pageDoc)) {
                stopped = "captcha";
                break;
            }
            if (!response.ok || !add(amazonReviews(pageDoc))) break;
        }
    } else {
        const base = `https://www.flipkart.com/${product.slug}/product-reviews/${product.item}?pid=${product.pid}`
            + (product.lid ? `&lid=${product.lid}` : "");
        for (let page = 1; page <= MAX_PAGES; page++) {
            if (page > 1) await pause(PAUSE_MS);
            const response = await fetchPage(`${base}&page=${page}`);
            const state = response.ok ? flipkartState(response.html) : null;
            if (!state) {
                if (page === 1) throw new Error(`Flipkart answered ${response.status} without reviews. Check the link opens the product.`);
                break;
            }
            const {reviews, summary} = flipkartContent(state);
            if (page === 1) {
                details = {
                    name: nameFromSlug(product.slug),
                    rating: summary?.average ?? null,
                    ratings: summary?.histogram?.reduce((a, b) => a + b, 0) ?? null,
                };
            }
            if (!add(reviews)) break;
        }
    }

    if (!found.size) throw new Error("No reviews found on that product page.");
    return {details, reviews: [...found.values()], stopped};
}

// Runs the insight engine over each review (title and text together) and sums up:
// mix — how many reviews read positive / mixed / neutral / negative;
// labels — per label, how many reviews were positive / neutral / negative about it, with the strongest quotes;
// combos — label : sentiment pairs by how many reviews share them;
// overall — the product's sentiment across reviews; averageRating — the mean star rating of these reviews.
export function summarizeReviews(reviews) {
    const analysed = reviews.map((review) => {
        const title = review.title && !/[.!?]$/.test(review.title) ? `${review.title}.` : review.title;
        const body = [title, review.text].filter(Boolean).join(" ");
        const result = analyze(body);
        return {...review, body, result, sentiment: result.insights.length ? result.overall.sentiment : "neutral"};
    });

    const mix = {positive: 0, mixed: 0, neutral: 0, negative: 0};
    for (const review of analysed) mix[review.sentiment]++;

    const byLabel = new Map();
    for (const review of analysed) {
        for (const row of review.result.summary) {
            const entry = byLabel.get(row.label) ?? {label: row.label, positive: 0, neutral: 0, negative: 0, scores: [], quotes: []};
            entry[row.sentiment]++;
            entry.scores.push(row.score);
            for (const insight of review.result.insights) {
                if (insight.label === row.label) entry.quotes.push({phrase: insight.phrase, score: insight.score, sentiment: insight.sentiment});
            }
            byLabel.set(row.label, entry);
        }
    }
    const labels = [...byLabel.values()].map(({scores, quotes, ...entry}) => ({
        ...entry,
        total: scores.length,
        sentiment: overallOf(scores).sentiment,
        quotes: [...new Map(quotes.sort((a, b) => Math.abs(b.score) - Math.abs(a.score)).map((q) => [q.phrase.toLowerCase(), q])).values()].slice(0, 6),
    })).sort((a, b) => b.total - a.total);

    // The most common label : sentiment pairs, e.g. "Camera · positive" in 26 reviews.
    const combos = labels
        .flatMap((row) => ["positive", "neutral", "negative"].map((sentiment) => ({label: row.label, sentiment, count: row[sentiment]})))
        .filter((combo) => combo.count)
        .sort((a, b) => b.count - a.count);

    const opinionated = analysed.filter((review) => review.result.insights.length);
    const ratings = analysed.map((review) => review.rating).filter(Number.isFinite);
    return {
        reviews: analysed,
        mix,
        labels,
        combos,
        overall: overallOf(opinionated.map((review) => review.result.overall.score)),
        averageRating: ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null,
    };
}
