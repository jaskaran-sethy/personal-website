import {useEffect, useMemo, useRef, useState} from "react";
import cx from "../../lib/cx";
import {useHighScore} from "../../lib/highScores";
import {randomInt} from "../../lib/random";
import {GameButton, Stat, Stats, Status} from "./kit";
import {SNIPPETS} from "./codeSnippets";
import ct from "./codeTyping.module.css";

const TEST_MS = 120000;
const BEST_KEY = "games.code.best";

// Which characters are a line's leading indentation. Those are filled in for you, like an editor would.
function indentMask(code) {
    const mask = [];
    let atLineStart = true;
    for (const char of code) {
        if (char === "\n") atLineStart = true;
        else if (char !== " ") atLineStart = false;
        mask.push(atLineStart && char === " ");
    }
    return mask;
}

// The indentation that follows position `at`, which is just after a newline.
function indentAt(code, at) {
    return code.slice(at).match(/^ */)[0];
}

// What counts toward WPM: characters typed right, leaving out the indentation you were given.
function correctChars(typed, code, auto) {
    let count = 0;
    for (let i = 0; i < typed.length; i++) if (!auto[i] && typed[i] === code[i]) count++;
    return count;
}

// m:ss, counting down.
function formatClock(ms) {
    const seconds = Math.ceil(ms / 1000);
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

// A different snippet from the current one.
function nextIndex(current) {
    return (current + 1 + randomInt(SNIPPETS.length - 1)) % SNIPPETS.length;
}

// ready → running (two minutes, from the first keystroke; finish a snippet and the next follows) → done.
export default function CodeTyping() {
    // Picked in an effect, so the server render and first client render agree.
    const [index, setIndex] = useState(null);
    const [typed, setTyped] = useState("");
    const [phase, setPhase] = useState("ready");
    const [timeLeft, setTimeLeft] = useState(TEST_MS);
    const [result, setResult] = useState(null);
    const [focused, setFocused] = useState(false);
    const [best, recordBest] = useHighScore(BEST_KEY);
    const [keystrokes, setKeystrokes] = useState({total: 0, correct: 0});
    const startedAt = useRef(0);
    const ticker = useRef(null);
    const input = useRef(null);
    const codeBox = useRef(null);
    const refocus = useRef(false);
    // Correct characters from snippets already finished this run.
    const banked = useRef(0);

    const snippet = index === null ? null : SNIPPETS[index];
    const code = snippet?.code ?? "";
    const auto = useMemo(() => indentMask(code), [code]);
    const lines = useMemo(() => {
        // Each line with the offset of its first character, so spans can be matched against what's typed.
        let offset = 0;
        return code.split("\n").map((text) => {
            const line = {text, offset};
            offset += text.length + 1;
            return line;
        });
    }, [code]);
    // Read by the ticker, which outlives the render it was created in.
    const latest = useRef(null);
    latest.current = {typed, code, auto, keystrokes};

    useEffect(() => {
        setIndex(randomInt(SNIPPETS.length));
        return () => clearInterval(ticker.current);
    }, []);

    function finish() {
        clearInterval(ticker.current);
        const {typed, code, auto, keystrokes} = latest.current;
        // Standard words of five characters, over the full two minutes.
        const words = (banked.current + correctChars(typed, code, auto)) / 5;
        const wpm = Math.round(words / (TEST_MS / 60000));
        const accuracy = keystrokes.total ? Math.round(keystrokes.correct / keystrokes.total * 100) : 0;
        setResult({wpm, accuracy});
        setTimeLeft(0);
        setPhase("done");
        recordBest(wpm);
    }

    function onChange(e) {
        if (phase === "done" || !code) return;
        let value = e.target.value.replace(/\t/g, "");
        if (phase === "ready" && value) {
            setPhase("running");
            startedAt.current = performance.now();
            ticker.current = setInterval(() => {
                const left = TEST_MS - (performance.now() - startedAt.current);
                if (left <= 0) finish();
                else setTimeLeft(left);
            }, 100);
        }
        let {total, correct} = keystrokes;
        if (value.length > typed.length && value.startsWith(typed)) {
            // Usually one character, but a phone keyboard can add several at once.
            let grown = typed;
            for (const char of value.slice(typed.length)) {
                if (grown.length >= code.length) break;
                // Count each newly added character once, so fixed mistakes still cost accuracy.
                total++;
                if (char === code[grown.length]) correct++;
                grown += char;
                // A newline where one belongs brings the next line's indentation with it.
                if (char === "\n" && code[grown.length - 1] === "\n") grown += indentAt(code, grown.length);
            }
            value = grown;
        } else if (value.length < typed.length) {
            // Backspacing into given indentation takes all of it, and the newline, back to the line above.
            const lineStart = value.lastIndexOf("\n") + 1;
            const tail = value.slice(lineStart);
            if (lineStart > 0 && /^ *$/.test(tail) && tail.length < indentAt(code, lineStart).length
                && typed.slice(0, lineStart) === code.slice(0, lineStart)) {
                value = value.slice(0, lineStart - 1);
            }
        }
        value = value.slice(0, code.length);
        const nextKeystrokes = {total, correct};
        setKeystrokes(nextKeystrokes);
        if (value.length === code.length) {
            // Snippet done with time to spare: bank it and carry on with the next.
            banked.current += correctChars(value, code, auto);
            setIndex(nextIndex);
            setTyped("");
        } else {
            setTyped(value);
        }
    }

    // Typing always happens at the end: clicking or arrowing into the middle would scramble the comparison.
    function pinCaret(e) {
        const end = e.target.value.length;
        if (e.target.selectionStart !== end || e.target.selectionEnd !== end) e.target.setSelectionRange(end, end);
    }

    function onKeyDown(e) {
        // Tab would leave the field; indentation is already done for you.
        if (e.key === "Tab") e.preventDefault();
    }

    function restart() {
        clearInterval(ticker.current);
        setIndex(nextIndex);
        setTyped("");
        setPhase("ready");
        setTimeLeft(TEST_MS);
        banked.current = 0;
        setResult(null);
        setKeystrokes({total: 0, correct: 0});
        refocus.current = true;
    }

    // Long snippets run past the screen: scroll the page to keep the cursor in view, about a third of the way down.
    useEffect(() => {
        const cursor = codeBox.current?.querySelector(`.${ct.cursor}`);
        if (!cursor) return;
        const at = cursor.getBoundingClientRect();
        // The hidden field goes where the cursor is: browsers scroll a field into view as you type in it, and left
        // at the top of the box it would drag the page back up there.
        const field = input.current;
        field.style.top = `${at.top - field.offsetParent.getBoundingClientRect().top}px`;
        if (at.top < 2 * at.height || at.bottom > window.innerHeight - 3 * at.height) {
            window.scrollBy({top: at.top - window.innerHeight / 3});
        }
    }, [typed, focused]);

    // The field is disabled when a run ends, so focus it once the restart has rendered.
    useEffect(() => {
        if (!refocus.current) return;
        refocus.current = false;
        input.current?.focus({preventScroll: true});
    }, [index]);

    let status;
    if (phase === "done") status = <><em>{result.wpm}</em> WPM at <em>{result.accuracy}%</em> accuracy</>;
    else if (phase === "running") status = "Keep going…";
    else if (focused) status = "Start typing to begin";
    else status = "Click the code, then start typing";

    // `shown` stands in for characters you can't see, like the newline.
    function renderChar(char, i, shown = char) {
        const state = i >= typed.length ? null : typed[i] === char ? ct.correct : ct.wrong;
        const isCursor = i === typed.length && phase !== "done" && focused;
        return (
            <span key={i} className={cx(state, isCursor && ct.cursor, auto[i] && ct.indent,
                char === " " && state === ct.wrong && ct.wrongSpace)}>
                {shown}
            </span>
        );
    }

    return (
        <div className={ct.game}>
            <Status>{status}</Status>
            <p className={ct.hint}>Enter for new lines. Indentation is typed for you.</p>
            {/* Pressing on the code focuses the hidden field without blurring it first. */}
            <div className={cx(ct.editor, focused && phase !== "done" && ct.focused)}
                 onMouseDown={(e) => {
                     if (e.target === input.current) return;
                     e.preventDefault();
                     input.current?.focus({preventScroll: true});
                 }}
                 onClick={() => input.current?.focus({preventScroll: true})}>
                <div className={ct.header}>
                    <span className={ct.lang}>{snippet?.lang ?? ""}</span>
                    <span className={ct.source}>{snippet?.source ?? ""}</span>
                    <span className={ct.license}>{snippet?.license ?? ""}</span>
                </div>
                <pre ref={codeBox} className={ct.code} aria-hidden="true">
                    {lines.map(({text, offset}, n) => (
                        <div key={n} className={ct.line}>
                            <span className={ct.lineNumber}>{n + 1}</span>
                            <span>
                                {[...text].map((char, j) => renderChar(char, offset + j))}
                                {n < lines.length - 1 ? (
                                    <span className={ct.newline}>{renderChar("\n", offset + text.length, "↵")}</span>
                                ) : null}
                            </span>
                        </div>
                    ))}
                </pre>
                <textarea ref={input} className={ct.input} value={typed} onChange={onChange} onKeyDown={onKeyDown}
                          onSelect={pinCaret} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                          onPaste={(e) => e.preventDefault()} disabled={phase === "done" || !code}
                          aria-label="Type the code here" autoCapitalize="off" autoCorrect="off"
                          autoComplete="off" spellCheck={false}/>
            </div>
            <Stats>
                <Stat value={formatClock(timeLeft)} label="TIME LEFT"/>
                <Stat value={result ? result.wpm : "–"} label="WPM"/>
                <Stat value={best ?? "–"} label="BEST WPM"/>
            </Stats>
            <GameButton onClick={restart}>
                {phase === "done" ? "Try again" : phase === "running" ? "Restart" : "New snippet"}
            </GameButton>
        </div>
    );
}
