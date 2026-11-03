// Every game and tool on /games, in grid order, as plain data: what the site needs to list, link and describe
// them. Kept apart from the components (registry.js adds those) so build scripts can read it too.
export const CATALOG = [
    {id: "reaction", name: "Reaction Time", glyph: "↯", blurb: "Wait for gold, then click as fast as you can."},
    {id: "code-typing", name: "Code Typing", glyph: "{ }", blurb: "Type famous code from LLVM, Linux, Quake III and more. Brackets, semicolons and all."},
    {id: "aura-farm", name: "Aura Farm", glyph: "✦",
        blurb: "Stay still to farm aura. Good calls double your multiplier; bad ones reset it."},
    {id: "aura-farm-idle", name: "Aura Farm Idle", glyph: "✧",
        blurb: "Farm aura even while you're away. Build habits, buy upgrades, touch grass."},
    {id: "insight-extractor", name: "Insight Extractor", glyph: "❝", section: "tools",
        blurb: "Paste feedback; get insights by topic and sentiment, like Sprinklr's Product Insights."},
    {id: "portfolio-calculator", name: "Portfolio Calculator", glyph: "₹", section: "tools",
        blurb: "Your holdings by asset class, a projection with a monthly SIP, and what to buy or sell to rebalance."},
];

export const SECTIONS = [
    {id: "games", title: "Games", short: "Games", blurb: "Small games with a twist, and a few rules you'll have to work out."},
    // Not games: `tools` keeps them out of the games' Next chain (see nextGame).
    {id: "tools", title: "Useful tools", short: "Tools", blurb: "Not games at all. Small things that do a real job.", tools: true},
];
