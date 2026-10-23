// The maths behind the Portfolio Calculator: allocation by asset class, a blended expected return, a month-by-month
// projection with a monthly SIP (that can step up each year), and what to buy or sell to reach a target mix.
// Returns are assumptions the user edits; nothing here predicts markets.

// In a fixed order that also fixes each class's chart colour.
export const ASSET_CLASSES = [
    {id: "equity", name: "Equity", expected: 12},
    {id: "debt", name: "Debt", expected: 7},
    {id: "realEstate", name: "Real estate", expected: 8},
    {id: "gold", name: "Gold", expected: 8},
    {id: "cash", name: "Cash", expected: 4},
    {id: "other", name: "Other", expected: 6},
];

const sum = (values) => values.reduce((a, b) => a + b, 0);

// Total value per asset class, in ASSET_CLASSES order, with each class's share of the whole (0–1).
export function allocation(holdings) {
    const total = sum(holdings.map((h) => h.value || 0));
    return ASSET_CLASSES.map((assetClass) => {
        const value = sum(holdings.filter((h) => h.assetClass === assetClass.id).map((h) => h.value || 0));
        return {...assetClass, value, share: total ? value / total : 0};
    });
}

// The portfolio's expected yearly return (percent): each class's assumed return, weighted by how much is in it.
export function blendedReturn(holdings, returns) {
    const classes = allocation(holdings);
    const total = sum(classes.map((c) => c.value));
    return total ? sum(classes.map((c) => c.value * returns[c.id])) / total : 0;
}

// Month by month for `years`: each class compounds at its own assumed return, and each month's SIP is split by
// `mix` (shares per class, summing to 1). The SIP grows by `stepUp` percent at the start of each new year.
// Returns one point per year (year 0 is today): {year, invested, value, real}, where `invested` is what went in
// (today's holdings plus SIPs) and `real` is `value` in today's money after `inflation` percent a year.
export function project({holdings, returns, mix, monthly, stepUp, years, inflation}) {
    const balances = Object.fromEntries(allocation(holdings).map((c) => [c.id, c.value]));
    const monthlyRate = Object.fromEntries(ASSET_CLASSES.map((c) => [c.id, (1 + returns[c.id] / 100) ** (1 / 12) - 1]));
    let invested = sum(Object.values(balances));
    let sip = monthly;
    const points = [{year: 0, invested, value: invested, real: invested}];
    for (let month = 1; month <= years * 12; month++) {
        for (const id of Object.keys(balances)) balances[id] = balances[id] * (1 + monthlyRate[id]) + sip * (mix[id] ?? 0);
        invested += sip;
        if (month % 12 === 0) {
            const year = month / 12;
            const value = sum(Object.values(balances));
            points.push({year, invested, value, real: value / (1 + inflation / 100) ** year});
            sip *= 1 + stepUp / 100;
        }
    }
    return points;
}

// What to buy (positive) or sell (negative) in each class to reach `targets` (percent per class) without adding
// money. Classes with nothing held and no target are left out.
export function rebalance(holdings, targets) {
    const classes = allocation(holdings);
    const total = sum(classes.map((c) => c.value));
    return classes
        .map((c) => ({...c, target: targets[c.id] ?? 0, change: (total * (targets[c.id] ?? 0)) / 100 - c.value}))
        .filter((c) => c.value || c.target);
}

// Money for display. Rupees use lakh and crore ("₹12.4 L", "₹1.25 Cr") and Indian digit grouping; dollars use K
// and M. `compact` shortens big numbers.
export function formatMoney(value, currency, compact = false) {
    const sign = value < 0 ? "−" : "";
    const amount = Math.abs(value);
    if (currency === "INR") {
        if (compact && amount >= 1e7) return `${sign}₹${trim(amount / 1e7)} Cr`;
        if (compact && amount >= 1e5) return `${sign}₹${trim(amount / 1e5)} L`;
        return `${sign}₹${Math.round(amount).toLocaleString("en-IN")}`;
    }
    if (compact && amount >= 1e6) return `${sign}$${trim(amount / 1e6)}M`;
    if (compact && amount >= 1e4) return `${sign}$${trim(amount / 1e3)}K`;
    return `${sign}$${Math.round(amount).toLocaleString("en-US")}`;
}

// Up to two decimals, without trailing zeros: 12.40 → "12.4".
function trim(number) {
    return String(Number(number.toFixed(number >= 100 ? 0 : 2)));
}
