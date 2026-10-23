import {useEffect, useState} from "react";

// Talks to the Insight Extractor helper extension (github.com/jaskaran-sethy/insight-extractor-extension; the
// message names below must match its content.js) through window messages. The
// extension's content script answers pings and relays fetches to its background worker, which can read Amazon and
// Flipkart pages from the visitor's own browser, something this page can't do (the browser blocks cross-site reads).

const FROM_PAGE = "insight-extractor";
const FROM_EXTENSION = "insight-extractor-extension";
const FETCH_TIMEOUT_MS = 30000;

function fromExtension(event) {
    return event.source === window && event.data?.source === FROM_EXTENSION;
}

// "checking" until the extension answers a ping (or doesn't, after a moment), then "ready" or "missing".
export function useExtension() {
    const [state, setState] = useState({status: "checking", version: null});
    useEffect(() => {
        const onMessage = (event) => {
            if (fromExtension(event) && event.data.type === "ready") setState({status: "ready", version: event.data.version});
        };
        window.addEventListener("message", onMessage);
        window.postMessage({source: FROM_PAGE, type: "ping"}, location.origin);
        const timer = setTimeout(() => setState((s) => (s.status === "checking" ? {status: "missing", version: null} : s)), 800);
        return () => {
            window.removeEventListener("message", onMessage);
            clearTimeout(timer);
        };
    }, []);
    return state;
}

let nextId = 0;

// Fetches a page through the extension. Resolves to {ok, status, url, html} (url is where redirects ended up).
export function fetchThroughExtension(url) {
    const id = ++nextId;
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => finish(() => reject(new Error("The extension didn't answer in time."))), FETCH_TIMEOUT_MS);
        function onMessage(event) {
            if (!fromExtension(event) || event.data.type !== "fetched" || event.data.id !== id) return;
            const {ok, status, url: finalUrl, html, error} = event.data;
            finish(() => (error ? reject(new Error(error)) : resolve({ok, status, url: finalUrl, html})));
        }
        function finish(settle) {
            clearTimeout(timer);
            window.removeEventListener("message", onMessage);
            settle();
        }
        window.addEventListener("message", onMessage);
        window.postMessage({source: FROM_PAGE, type: "fetch", id, url}, location.origin);
    });
}
