// A small, in-browser take on aspect-based sentiment analysis, the idea behind Sprinklr's Product Insights.
// Production systems use fine-tuned transformers; this uses hand-built lexicons so it runs instantly with no
// server: split a message into clauses, tag each clause with what it's about (its aspect label), score its
// sentiment from opinion words (handling negation, intensifiers and set phrases), then roll the insights up into
// an overall sentiment and a label → sentiment summary.

// What an insight can be about. Each label lists the words or phrases that signal it (matched on whole words;
// a trailing * matches any ending, so "charg*" covers charge, charging, charger).
export const ASPECTS = [
    {label: "Battery", terms: ["battery", "batteries", "battery life", "charg*", "power bank"]},
    {label: "Display", terms: ["screen*", "display*", "brightness", "resolution", "pixels"]},
    {label: "Camera", terms: ["camera*", "photo*", "picture*", "selfie*", "lens", "video quality", "zoom"]},
    {label: "Performance", terms: ["performance", "speed", "lag*", "crash*", "freez*", "hang*", "processor", "ram", "stutter*", "load time*", "overheat*"]},
    {label: "Sound", terms: ["sound*", "audio", "speaker*", "volume", "bass", "mic", "microphone", "noise cancell*"]},
    {label: "Build quality", terms: ["build", "build quality", "material*", "plastic", "sturdy", "flimsy", "durab*", "scratch*", "hinge", "well made", "well-made", "made of"]},
    {label: "Design", terms: ["design*", "look", "looks", "colour*", "color*", "style", "aesthetic*", "finish"]},
    {label: "Price & value", terms: ["price*", "cost*", "expensive", "cheap", "value", "money", "worth", "deal", "overpriced", "afford*", "penny"]},
    {label: "Customer service", terms: ["customer service", "customer support", "support", "staff", "agent*", "representative*", "helpdesk", "help desk", "service", "waiter*", "waitress*"]},
    {label: "Delivery", terms: ["deliver*", "shipping", "shipped", "arriv*", "courier", "dispatch*", "tracking"]},
    {label: "Packaging", terms: ["packag*", "box", "packed", "unboxing"]},
    {label: "Software & app", terms: ["app", "apps", "software", "update*", "interface", "ui", "bug*", "feature*", "firmware", "settings"]},
    {label: "Ease of use", terms: ["setup", "set up", "easy to use", "user friendly", "user-friendly", "intuitive", "learning curve", "to use"]},
    {label: "Comfort & fit", terms: ["comfort*", "fit", "fits", "fitting", "size", "sizing", "weight", "heavy", "lightweight"]},
    {label: "Food", terms: ["food", "taste*", "tasty", "dish*", "meal*", "flavo*", "portion*", "menu", "pizza", "burger", "coffee", "dessert*", "breakfast", "lunch", "dinner"]},
    {label: "Ambience", terms: ["ambience", "ambiance", "atmosphere", "decor", "music", "vibe*", "seating"]},
    {label: "Cleanliness", terms: ["clean*", "dirty", "spotless", "filthy", "tidy", "messy", "hygien*", "smell*", "dust*", "stain*"]},
    {label: "Connectivity", terms: ["wifi", "wi-fi", "internet", "signal", "network", "bluetooth", "connection", "connectivity", "reception"]},
    {label: "Stay", terms: ["room*", "bed*", "stay", "hotel", "check-in", "check in", "checkout", "check-out", "pool", "view"]},
];

export const GENERAL = "Overall experience";

// Opinion words and their strength (-2 … +2). Set phrases come first so "stopped working" isn't read as "working".
const PHRASES = {
    "worth every penny": 2, "value for money": 1.2, "highly recommend": 2, "would recommend": 1.5, "must buy": 1.8,
    "blown away": 1.8, "works like a charm": 1.8, "works great": 1.5, "works perfectly": 1.8, "top notch": 1.6,
    "stopped working": -1.8, "waste of money": -2, "not worth": -1.5, "never again": -2, "falls apart": -1.6,
    "fell apart": -1.6, "dead on arrival": -2, "rip off": -1.8, "ripped off": -1.8, "let down": -1.3, "piece of junk": -2,
    "does not work": -1.6, "doesn't work": -1.6, "didn't work": -1.6, "no response": -1.3, "on time": 0.8,
    "never replied": -1.5, "never responded": -1.5, "never arrived": -1.8, "no reply": -1.3, "still waiting": -1.3,
    "too long": -1, "takes forever": -1.4, "took forever": -1.4, "dies quickly": -1.5, "drains fast": -1.5,
    "drains quickly": -1.5, "kept dropping": -1.5, "keeps dropping": -1.5, "keeps disconnecting": -1.5,"last all day": 1.4, "lasts all day": 1.4, "lasts forever": 1.5,
};

const WORDS = {
    // Positive
    love: 1.8, loved: 1.8, loves: 1.8, lovely: 1.4, great: 1.4, excellent: 1.8, amazing: 1.8, awesome: 1.7, good: 1,
    nice: 0.9, perfect: 1.8, perfectly: 1.5, fantastic: 1.8, wonderful: 1.7, impressive: 1.5, impressed: 1.5, happy: 1.2,
    satisfied: 1.1, pleased: 1.1, recommend: 1.2, fast: 0.9, quick: 0.9, quickly: 0.6, smooth: 1.1, smoothly: 1.1,
    easy: 1, easily: 0.8, beautiful: 1.5, gorgeous: 1.6, stunning: 1.7, sleek: 1.1, sturdy: 1.1, solid: 1, reliable: 1.2,
    crisp: 1.1, clear: 0.8, bright: 0.7, vibrant: 1.1, friendly: 1.2, helpful: 1.3, polite: 1.1, responsive: 1, prompt: 1,
    delicious: 1.7, tasty: 1.4, fresh: 1, comfortable: 1.3, comfy: 1.2, affordable: 1.1, reasonable: 0.8, premium: 1,
    best: 1.6, superb: 1.8, brilliant: 1.7, fine: 0.4, decent: 0.6, okay: 0.2, ok: 0.2, intuitive: 1.2, seamless: 1.3,
    efficient: 1, spacious: 1, cozy: 1, cosy: 1, clean: 0.9, spotless: 1.5, quiet: 0.6, worth: 0.9, flawless: 1.8,
    exceptional: 1.8, outstanding: 1.8, incredible: 1.7, enjoyed: 1.3, enjoy: 1.2, thanks: 0.6, thank: 0.6, glad: 1,
    // Negative
    bad: -1.3, terrible: -1.9, awful: -1.9, horrible: -1.9, poor: -1.3, poorly: -1.2, worst: -2, hate: -1.8, hated: -1.8,
    slow: -1.1, slowly: -0.9, laggy: -1.3, lags: -1.2, lagging: -1.2, broken: -1.6, broke: -1.4, breaks: -1.3,
    flimsy: -1.3, dirty: -1.4, rude: -1.6, unhelpful: -1.4, late: -1.1, delayed: -1.1, expensive: -0.7, overpriced: -1.4,
    disappointing: -1.5, disappointed: -1.5, annoying: -1.2, useless: -1.7, waste: -1.5, problem: -0.9, problems: -1,
    issue: -0.8, issues: -0.9, buggy: -1.3, bugs: -1, crashes: -1.4, crashed: -1.4, crashing: -1.4, freezes: -1.3,
    froze: -1.3, freezing: -1.2, noisy: -1, blurry: -1.3, grainy: -1.1, dim: -0.9, dull: -1, boring: -1.1, bland: -1.2,
    stale: -1.3, cold: -0.6, uncomfortable: -1.3, defective: -1.7, damaged: -1.6, faulty: -1.6, missing: -1.1,
    wrong: -1.1, difficult: -1, complicated: -1, confusing: -1.1, drains: -1.2, drain: -1, dies: -1.2, died: -1.4,
    cheap: -0.5, cheaply: -1, mediocre: -1, meh: -0.8, unreliable: -1.4, unusable: -1.8, scratched: -1.2,
    overheats: -1.4, overheating: -1.4, hot: -0.5, worse: -1.3, sucks: -1.7, horrid: -1.8, nightmare: -1.8,
    unresponsive: -1.4, ignored: -1.3, refund: -0.6, returned: -0.8, return: -0.4, regret: -1.5, avoid: -1.5,
};

const NEGATORS = new Set(["not", "no", "never", "hardly", "barely", "without", "isn't", "wasn't", "aren't", "weren't",
    "don't", "doesn't", "didn't", "can't", "cannot", "won't", "nothing", "neither", "nor", "isnt", "wasnt", "dont", "doesnt",
    "didnt", "cant", "wont"]);

const INTENSIFIERS = {
    very: 1.4, really: 1.35, extremely: 1.6, super: 1.4, so: 1.3, incredibly: 1.6, absolutely: 1.5, totally: 1.3,
    quite: 1.15, too: 1.25, highly: 1.4, insanely: 1.6, most: 1.3, pretty: 1.1,
    slightly: 0.6, somewhat: 0.7, little: 0.7, bit: 0.7, kinda: 0.7, fairly: 0.8, mildly: 0.6,
};

// Clauses break on sentence ends, semicolons, commas, words that turn the opinion ("but", "however"…), and an
// "and" that starts a new statement ("…and the screen is…", "…and it overheats"), so two opinions joined by
// "and" are scored separately, as is "…and breakfast was…". A plain "and" inside a list ("fast and smooth") doesn't split.
const CONTRAST = /\b(?:but|however|although|though|yet|whereas|except)\b|\band(?=\s+(?:the|it|its|it's|my|our|their|this|that|they|we|i|he|she|you|your)\b|\s+[a-z-]+\s+(?:is|was|are|were|kept|keeps|felt|feels|seemed|tasted|looked)\b)/gi;
const LEADING_FILLER = /^(?:and|also|then|so|plus|overall|honestly|basically|but|however|although|though|yet)\b[\s,]*/i;

// Thresholds for turning a score into a word.
const POSITIVE = 0.35;
const NEGATIVE = -0.35;

function sentimentOf(score) {
    if (score >= POSITIVE) return "positive";
    if (score <= NEGATIVE) return "negative";
    return "neutral";
}

function escapeRegex(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// A term like "charg*" or "battery life" as a whole-word regex.
function termPattern(term) {
    const wildcard = term.endsWith("*");
    const body = escapeRegex(wildcard ? term.slice(0, -1) : term).replace(/\s+/g, "[\\s-]+");
    return new RegExp(`\\b${body}${wildcard ? "[a-z]*" : ""}\\b`, "i");
}

const ASPECT_PATTERNS = ASPECTS.map((aspect) => ({label: aspect.label, patterns: aspect.terms.map(termPattern)}));
const PHRASE_PATTERNS = Object.entries(PHRASES)
    .sort((a, b) => b[0].length - a[0].length)
    .map(([phrase, value]) => ({pattern: new RegExp(`\\b${escapeRegex(phrase).replace(/\s+/g, "\\s+")}\\b`, "gi"), value}));

// Splits text into clauses, keeping each clause's position in the original so it can be highlighted later.
function splitClauses(text) {
    const cuts = [];
    for (const match of text.matchAll(/[.!?;,\n]+/g)) cuts.push({at: match.index, length: match[0].length});
    for (const match of text.matchAll(CONTRAST)) cuts.push({at: match.index, length: 0});
    cuts.sort((a, b) => a.at - b.at);

    const clauses = [];
    let start = 0;
    for (const cut of [...cuts, {at: text.length, length: 0}]) {
        if (cut.at > start) clauses.push({start, end: cut.at});
        start = Math.max(start, cut.at + cut.length);
    }
    return clauses.map(({start: s, end}) => {
        // Trim spaces and filler words from the front, and spaces from the back, adjusting the offsets.
        let raw = text.slice(s, end);
        const lead = raw.length - raw.trimStart().length;
        raw = raw.trim();
        const filler = raw.match(LEADING_FILLER)?.[0].length ?? 0;
        const begin = s + lead + filler;
        const finish = begin + raw.slice(filler).length;
        return {start: begin, end: finish, text: text.slice(begin, finish)};
    }).filter((clause) => /[a-z]/i.test(clause.text));
}

// Scores one clause: set phrases first (then blanked out so their words aren't counted again), then single
// opinion words, each scaled by an intensifier just before it and flipped by a negator in the three words before.
function scoreClause(clause) {
    let text = clause.toLowerCase();
    let score = 0;
    let hits = 0;
    for (const {pattern, value} of PHRASE_PATTERNS) {
        text = text.replace(pattern, (match) => {
            score += value;
            hits++;
            return " ".repeat(match.length);
        });
    }
    const words = text.match(/[a-z']+/g) ?? [];
    words.forEach((word, i) => {
        const value = WORDS[word];
        if (value === undefined) return;
        let weight = value;
        const before = words.slice(Math.max(0, i - 3), i);
        const boost = INTENSIFIERS[words[i - 1]] ?? (words[i - 1] === "a" ? INTENSIFIERS[words[i - 2]] : undefined);
        if (boost) weight *= boost;
        // "not bad" is mildly good, "not great" is mildly bad: flip and soften.
        if (before.some((w) => NEGATORS.has(w))) weight *= -0.7;
        score += weight;
        hits++;
    });
    if (/!/.test(clause)) score *= 1.1;
    return {score, hits};
}

function labelsOf(clause) {
    return ASPECT_PATTERNS.filter(({patterns}) => patterns.some((p) => p.test(clause))).map(({label}) => label);
}

// The main entry point. Returns the insights (phrase, label, sentiment, score, position), the overall sentiment
// of the message, and a summary of each label's sentiment.
export function analyze(text) {
    const insights = [];
    for (const clause of splitClauses(text)) {
        const {score, hits} = scoreClause(clause.text);
        const labels = labelsOf(clause.text);
        // A clause is an insight if it says something about a topic with an opinion, or gives a clear opinion
        // about nothing in particular ("Absolutely love it").
        if (!hits) continue;
        for (const label of labels.length ? labels : [GENERAL]) {
            insights.push({phrase: clause.text, start: clause.start, end: clause.end, label, score, sentiment: sentimentOf(score)});
        }
    }

    const byLabel = new Map();
    for (const insight of insights) {
        const entry = byLabel.get(insight.label) ?? {label: insight.label, total: 0, count: 0};
        entry.total += insight.score;
        entry.count++;
        byLabel.set(insight.label, entry);
    }
    const summary = [...byLabel.values()]
        .map(({label, total, count}) => ({label, count, score: total / count, sentiment: sentimentOf(total / count)}))
        .sort((a, b) => b.count - a.count || Math.abs(b.score) - Math.abs(a.score));

    // Overall: the average opinion, but "mixed" when there are clear positives and clear negatives in one message.
    const unique = new Map(insights.map((i) => [i.start, i.score]));
    const scores = [...unique.values()];
    const average = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const positives = scores.filter((s) => s >= POSITIVE).length;
    const negatives = scores.filter((s) => s <= NEGATIVE).length;
    const balanced = positives && negatives && Math.min(positives, negatives) / Math.max(positives, negatives) >= 0.5;
    const overall = {score: average, sentiment: balanced && Math.abs(average) < 0.8 ? "mixed" : sentimentOf(average)};

    return {insights, summary, overall};
}
