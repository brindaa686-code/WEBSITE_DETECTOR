const API = "http://127.0.0.1:8000";
const cache = {};

async function checkUrl(url) {
  if (cache[url]) return cache[url];
  try {
    const res = await fetch(`${API}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const data = await res.json();
    cache[url] = data;
    return data;
  } catch {
    return null;
  }
}

chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId !== 0) return;
  const url = details.url;
  if (!url.startsWith("http")) return;
  if (url.startsWith("chrome-extension")) return;

  const result = await checkUrl(url);
  if (!result) return;

  if (result.prediction === "PHISHING") {
    const warns = (result.warning_signs || []).join("|");
    const warningUrl = chrome.runtime.getURL("warning.html") +
      `?url=${encodeURIComponent(url)}` +
      `&prob=${result.phishing_probability}` +
      `&risk=${encodeURIComponent(result.risk_level)}` +
      `&warns=${encodeURIComponent(warns)}`;

    chrome.tabs.update(details.tabId, { url: warningUrl });
  }
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "CHECK_URL") {
    checkUrl(msg.url).then((result) => sendResponse(result));
    return true;
  }
});