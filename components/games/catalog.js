// Every game and tool on /games, in grid order, as plain data: what the site needs to list, link and describe
// them. Kept apart from the components (registry.js adds those) so build scripts can read it too.
export const CATALOG = [
    {id: "tic-tac-toe", name: "Tic Tac Toe", glyph: "×○", blurb: "Beat the computer on Easy. Try to draw on Hard."},
    {id: "memory", name: "Memory Match", glyph: "♠♥", blurb: "Find all eight pairs in as few moves as you can."},
    {id: "reaction", name: "Reaction Time", glyph: "↯", blurb: "Wait for gold, then click as fast as you can."},
    {id: "snake", name: "Snake", glyph: "∿", blurb: "Eat, grow, and don't bite your own tail."},
    {id: "2048", name: "2048", glyph: "2048", blurb: "Slide and merge tiles until you reach 2048."},
    {id: "minesweeper", name: "Minesweeper", glyph: "✹", blurb: "Clear the field without hitting one of ten mines."},
    {id: "connect-four", name: "Connect Four", glyph: "○●", blurb: "Drop discs and line up four before the computer does."},
    {id: "sliding-puzzle", name: "Sliding Puzzle", glyph: "15", blurb: "Slide the tiles back into order, 1 to 15."},
    {id: "word-guess", name: "Word Guess", glyph: "Aa", blurb: "Find the five-letter word in six guesses."},
    {id: "simon", name: "Simon", glyph: "◐", blurb: "Watch the pattern, then play it back. It keeps growing."},
    {id: "lights-out", name: "Lights Out", glyph: "☼", blurb: "Each tap flips a light and its neighbours. Turn them all off."},
    {id: "whack-a-mole", name: "Whack-a-Mole", glyph: "◉", blurb: "Thirty seconds. Hit every mole you can."},
    {id: "typing", name: "Typing Test", glyph: "wpm", blurb: "How many words a minute can you type?"},
    {id: "code-typing", name: "Code Typing", glyph: "{ }", blurb: "The typing test, but for code. Brackets, semicolons and all."},
    {id: "aura-farm", name: "Aura Farm", glyph: "✦", section: "esoteric",
        blurb: "Stay still to farm aura. Good calls double your multiplier; bad ones reset it."},
    {id: "aura-farm-idle", name: "Aura Farm Idle", glyph: "✧", section: "esoteric",
        blurb: "Farm aura even while you're away. Build habits, buy upgrades, touch grass."},
    {id: "insight-extractor", name: "Insight Extractor", glyph: "❝", section: "tools",
        blurb: "Paste feedback; get insights by topic and sentiment, like Sprinklr's Product Insights."},
    {id: "portfolio-calculator", name: "Portfolio Calculator", glyph: "₹", section: "tools",
        blurb: "Your holdings by asset class, a projection with a monthly SIP, and what to buy or sell to rebalance."},
];

export const SECTIONS = [
    {id: "normal", title: "Normal games", short: "Normal", blurb: "The classics. Rules you already know."},
    {id: "esoteric", title: "Esoteric games", short: "Esoteric", blurb: "Stranger ones, with rules you'll have to work out."},
    // Not games: `tools` keeps them out of the games' Next chain (see nextGame).
    {id: "tools", title: "Useful tools", short: "Tools", blurb: "Not games at all. Small things that do a real job.", tools: true},
];
