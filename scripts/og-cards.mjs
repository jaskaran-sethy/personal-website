// Renders the link-preview image (1200x630) for every game and tool into public/og/<id>.png, using headless
// Edge or Chrome. Run it by hand when a game is added or renamed:
//     node scripts/og-cards.mjs
// Set BROWSER to the browser's path if it isn't in the usual place.

import {spawn} from "node:child_process";
import {existsSync, mkdirSync, mkdtempSync, writeFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {CATALOG} from "../components/games/catalog.js";

const BROWSERS = [
    process.env.BROWSER,
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
].filter(Boolean);
const PORT = 9338;

const FONTS = `<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Noto+Serif&display=block" rel="stylesheet">`;
const BASE_CSS = `* { margin: 0; box-sizing: border-box; } html, body { width: 1200px; height: 630px; }
    body { font-family: "DM Sans", sans-serif; color: #F4F4F5; background:
        radial-gradient(ellipse 760px 480px at 18% 0%, rgba(212, 175, 55, 0.16), transparent 70%), #121216; }`;
const escape = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;");

// A game or tool: its glyph large in gold, its name and blurb, and where it lives.
function card(game) {
    const tool = game.section === "tools";
    return `<!doctype html><html><head><meta charset="utf-8">${FONTS}<style>${BASE_CSS}
    body { display: flex; align-items: center; gap: 72px; padding: 0 96px; }
    .glyph { flex: none; display: flex; justify-content: center; align-items: center; width: 300px; height: 300px;
        border: 1px solid #2A2A31; border-radius: 28px; background: radial-gradient(circle at 50% 40%, rgba(212, 175, 55, 0.14), transparent 70%), #16161A;
        font-family: "Noto Serif", serif; font-size: ${game.glyph.length > 2 ? 84 : 132}px; color: #D4AF37; }
    .text { display: flex; flex-direction: column; gap: 22px; }
    .where { font-size: 24px; color: #9A9AA3; } .where b { font-weight: 500; color: #D4AF37; }
    h1 { font-family: "Noto Serif", serif; font-weight: 400; font-size: 76px; line-height: 1.05; letter-spacing: -0.02em; }
    p { font-size: 30px; line-height: 1.45; color: #C7C7CE; max-width: 640px; }
    </style></head><body>
    <div class="glyph">${escape(game.glyph)}</div>
    <div class="text">
        <span class="where"><b>${tool ? "Useful tools" : "Play in your browser"}</b> · jaskaransethy.com</span>
        <h1>${escape(game.name)}</h1>
        <p>${escape(game.blurb)}</p>
    </div></body></html>`;
}

// Insight Extractor shows what it does instead: a review with its insights highlighted, and the labels it finds.
function insightCard() {
    return `<!doctype html><html><head><meta charset="utf-8">${FONTS}<style>${BASE_CSS}
    body { display: flex; flex-direction: column; justify-content: center; gap: 44px; padding: 0 96px; }
    .where { font-size: 24px; color: #9A9AA3; } .where b { font-weight: 500; color: #D4AF37; }
    .message { font-size: 50px; font-weight: 500; line-height: 1.55; letter-spacing: -0.01em; color: #C7C7CE; }
    mark { padding: 2px 6px; border-radius: 6px; color: #F4F4F5; box-decoration-break: clone; -webkit-box-decoration-break: clone; }
    .pos { background: rgba(79, 143, 214, 0.2); box-shadow: inset 0 -5px 0 #4F8FD6; }
    .neg { background: rgba(224, 104, 79, 0.2); box-shadow: inset 0 -5px 0 #E0684F; }
    .chips { display: flex; gap: 16px; }
    .chip { display: flex; align-items: center; gap: 12px; padding: 10px 20px 10px 22px; border: 1px solid #2A2A31; border-radius: 999px; background: #19191E; font-size: 28px; color: #D4D4D8; }
    .tag { padding: 3px 14px; border: 2px solid currentColor; border-radius: 999px; font-size: 22px; font-weight: 600; }
    .tag.p { color: #6FA3E0; } .tag.n { color: #EC8670; }
    </style></head><body>
    <span class="where"><b>Insight Extractor</b> · jaskaransethy.com</span>
    <p class="message"><mark class="pos">The camera is stunning</mark>, but <mark class="neg">the battery drains fast</mark> and <mark class="neg">support never replied</mark>.</p>
    <div class="chips">
        <span class="chip">Camera <span class="tag p">Positive</span></span>
        <span class="chip">Battery <span class="tag n">Negative</span></span>
        <span class="chip">Support <span class="tag n">Negative</span></span>
    </div></body></html>`;
}

const browserPath = BROWSERS.find((path) => existsSync(path));
if (!browserPath) throw new Error("No Edge or Chrome found; set BROWSER to its path.");
const profile = mkdtempSync(join(tmpdir(), "og-cards-"));
const browser = spawn(browserPath, ["--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
    "--no-first-run", "--hide-scrollbars", "about:blank"], {stdio: "ignore"});
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

try {
    let targets;
    for (let i = 0; i < 40 && !targets; i++) {
        await sleep(250);
        targets = await fetch(`http://127.0.0.1:${PORT}/json/list`).then((r) => r.json()).catch(() => null);
    }
    const ws = new WebSocket(targets.find((t) => t.type === "page").webSocketDebuggerUrl);
    await new Promise((resolve) => ws.addEventListener("open", resolve));
    let id = 0;
    const pending = new Map();
    ws.addEventListener("message", (e) => {
        const message = JSON.parse(e.data);
        if (message.id && pending.has(message.id)) pending.get(message.id)(message);
    });
    const send = (method, params = {}) => new Promise((resolve) => {
        const i = ++id;
        pending.set(i, resolve);
        ws.send(JSON.stringify({id: i, method, params}));
    });

    await send("Emulation.setDeviceMetricsOverride", {width: 1200, height: 630, deviceScaleFactor: 1, mobile: false});
    mkdirSync("public/og", {recursive: true});
    const workDir = mkdtempSync(join(tmpdir(), "og-html-"));
    for (const game of CATALOG) {
        const file = join(workDir, `${game.id}.html`);
        writeFileSync(file, game.id === "insight-extractor" ? insightCard() : card(game));
        await send("Page.navigate", {url: `file:///${file.replace(/\\/g, "/")}`});
        await sleep(1800); // Web fonts.
        const shot = await send("Page.captureScreenshot", {format: "png"});
        writeFileSync(`public/og/${game.id}.png`, Buffer.from(shot.result.data, "base64"));
        console.log(`public/og/${game.id}.png`);
    }
    ws.close();
} finally {
    browser.kill();
}
