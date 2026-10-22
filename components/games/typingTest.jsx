import {useEffect, useRef, useState} from "react";
import cx from "../../lib/cx";
import {useHighScore} from "../../lib/highScores";
import {pick} from "../../lib/random";
import style from "./games.module.css";
import {GameButton, Stat, Stats, Status} from "./kit";
import tt from "./typingTest.module.css";

const WORDS = (
    "the be to of and a in that have it for not on with he as you do at this but his by from they we say her she " +
    "or an will my one all would there their what so up out if about who get which go me when make can like time " +
    "no just him know take people into year your good some could them see other than then now look only come its " +
    "over think also back after use two how our work first well way even new want because any these give day most " +
    "us is was are been has had did said made find where long down very through still own last never before same " +
    "much more each right too might place small great old big high different follow world line move live start " +
    "hand light turn close water open seem house point home read page letter mother answer found study learn " +
    "should near add food between keep tree city earth eye story far sea draw left late run while press few " +
    "under name night walk paper music those both mark often until mile river car feet care second book " +
    "carry took science room friend began idea fish mountain stop once base hear horse cut sure watch color face " +
    "wood main enough plain girl usual young ready above ever red list though feel talk bird soon body dog family " +
    "leave song door black short class wind question happen ship area half rock order fire south problem piece " +
    "told knew pass since top whole king space heard best hour better true during hundred five remember step early"
).split(" ");
const PASSAGE_WORDS = 30;
const TEST_MS = 30000;
const BEST_KEY = "games.typing.best";

function makePassage() {
    return Array.from({length: PASSAGE_WORDS}, () => pick(WORDS)).join(" ");
}

// ready → running (timer starts on the first keystroke) → done (time's up or passage finished).
export default function TypingTest() {
    // Picked in an effect, so the server render and first client render agree.
    const [passage, setPassage] = useState("");
    const [typed, setTyped] = useState("");
    const [phase, setPhase] = useState("ready");
    const [timeLeft, setTimeLeft] = useState(TEST_MS);
    const [result, setResult] = useState(null);
    const [best, recordBest] = useHighScore(BEST_KEY);
    const [keystrokes, setKeystrokes] = useState({total: 0, correct: 0});
    const startedAt = useRef(0);
    const ticker = useRef(null);
    const input = useRef(null);
    const refocus = useRef(false);
    // Read by the ticker, which outlives the render it was created in.
    const latest = useRef({typed: "", passage: "", keystrokes});
    latest.current = {typed, passage, keystrokes};

    useEffect(() => {
        setPassage(makePassage());
        return () => clearInterval(ticker.current);
    }, []);

    function finish(finalTyped, finalKeystrokes) {
        clearInterval(ticker.current);
        const elapsed = Math.min(TEST_MS, performance.now() - startedAt.current);
        const target = latest.current.passage;
        let correctChars = 0;
        for (let i = 0; i < finalTyped.length; i++) if (finalTyped[i] === target[i]) correctChars++;
        // Standard WPM: five characters make a word.
        const wpm = Math.round(correctChars / 5 / (Math.max(elapsed, 1000) / 60000));
        const accuracy = finalKeystrokes.total ? Math.round(finalKeystrokes.correct / finalKeystrokes.total * 100) : 0;
        setResult({wpm, accuracy});
        setPhase("done");
        setTimeLeft(Math.max(0, TEST_MS - elapsed));
        recordBest(wpm);
    }

    function onChange(e) {
        if (phase === "done" || !passage) return;
        const value = e.target.value.slice(0, passage.length);
        if (phase === "ready" && value) {
            setPhase("running");
            startedAt.current = performance.now();
            ticker.current = setInterval(() => {
                const left = TEST_MS - (performance.now() - startedAt.current);
                if (left <= 0) finish(latest.current.typed, latest.current.keystrokes);
                else setTimeLeft(left);
            }, 100);
        }
        // Count each newly added character once, so fixed mistakes still cost accuracy.
        let {total, correct} = keystrokes;
        if (value.length > typed.length && value.startsWith(typed)) {
            for (let i = typed.length; i < value.length; i++) {
                total++;
                if (value[i] === passage[i]) correct++;
            }
        }
        const nextKeystrokes = {total, correct};
        setKeystrokes(nextKeystrokes);
        setTyped(value);
        if (value.length === passage.length) finish(value, nextKeystrokes);
    }

    function restart() {
        clearInterval(ticker.current);
        setPassage(makePassage());
        setTyped("");
        setPhase("ready");
        setTimeLeft(TEST_MS);
        setResult(null);
        setKeystrokes({total: 0, correct: 0});
        refocus.current = true;
    }

    // The input is disabled when a test ends, so focus it once the restart has rendered.
    useEffect(() => {
        if (!refocus.current) return;
        refocus.current = false;
        input.current?.focus();
    }, [passage]);

    let status;
    if (phase === "done") status = <><em>{result.wpm}</em> WPM at <em>{result.accuracy}%</em> accuracy</>;
    else if (phase === "running") status = "Keep going…";
    else status = "Start typing to begin";

    return (
        <div className={style.game}>
            <Status>{status}</Status>
            <div className={tt.passage} onClick={() => input.current?.focus()} aria-hidden="true">
                {[...passage].map((char, i) => {
                    const state = i >= typed.length ? null : typed[i] === char ? tt.correct : tt.wrong;
                    return (
                        <span key={i} className={cx(state, i === typed.length && phase !== "done" && tt.cursor,
                            char === " " && state === tt.wrong && tt.wrongSpace)}>
                            {char}
                        </span>
                    );
                })}
            </div>
            <input ref={input} className={tt.input} type="text" value={typed} onChange={onChange}
                   onPaste={(e) => e.preventDefault()} disabled={phase === "done" || !passage}
                   aria-label="Type the passage here" placeholder={phase === "ready" ? "Type here…" : ""}
                   autoCapitalize="off" autoCorrect="off" autoComplete="off" spellCheck={false}
                   enterKeyHint="done"/>
            <Stats>
                <Stat value={Math.ceil(timeLeft / 1000)} label="SECONDS"/>
                <Stat value={result ? result.wpm : "–"} label="WPM"/>
                <Stat value={best ?? "–"} label="BEST WPM"/>
            </Stats>
            <GameButton onClick={restart}>
                {phase === "done" ? "Try again" : "Restart"}
            </GameButton>
        </div>
    );
}
