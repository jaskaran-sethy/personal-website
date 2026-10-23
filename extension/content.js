// Runs on jaskaransethy.com. Relays the Insight Extractor page's fetch requests to the background worker and posts
// the answers back. The page can't fetch Amazon or Flipkart itself (the browser blocks cross-site reads); the
// extension can, from the visitor's own browser.

const FROM_PAGE = "insight-extractor";
const FROM_EXTENSION = "insight-extractor-extension";
const VERSION = chrome.runtime.getManifest().version;

function reply(message) {
    window.postMessage({source: FROM_EXTENSION, ...message}, location.origin);
}

window.addEventListener("message", (event) => {
    if (event.source !== window || event.data?.source !== FROM_PAGE) return;
    const {type, id, url} = event.data;
    if (type === "ping") reply({type: "ready", version: VERSION});
    if (type === "fetch" && typeof url === "string") {
        chrome.runtime.sendMessage({type: "fetch", url}, (response) => {
            reply({type: "fetched", id, ...(response ?? {ok: false, error: chrome.runtime.lastError?.message ?? "No response"})});
        });
    }
});

// Announce on load too, in case the page asked before this script was ready.
reply({type: "ready", version: VERSION});
