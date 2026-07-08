# Chrome Extension — Manifest V3

The bodyguard: protects you while you browse, using the backend API.

**What it does:**

- 🚫 **Blocks phishing pages** — every page you navigate to is checked; if the model says phishing, you're redirected to a full-screen warning page (with a "proceed anyway" escape hatch).
- 💬 **Link tooltips** — hover any link on any page and a tooltip tells you if it's safe or dangerous.
- 🔍 **Popup checker** — click the extension icon to check any URL manually and see if the API is connected.

## Install (developer mode)

1. Make sure the backend is running — see [../backend/README.md](../backend/README.md)
2. Open Chrome and go to `chrome://extensions`
3. Turn on **Developer mode** (top-right toggle)
4. Click **Load unpacked**
5. Select this `extension/` folder

After changing any file here, click the ↻ reload icon on the extension card in `chrome://extensions`.

## Folder map

```
extension/
├── manifest.json    # extension config (permissions, scripts)
├── background.js    # service worker — checks every navigation, redirects to warning page
├── content.js       # injected into pages — shows safe/danger tooltips on link hover
├── popup.html/.js   # the popup when you click the extension icon
└── warning.html/.js # the full-screen "PHISHING DETECTED" block page
```

## Notes

- The API address is set at the top of `background.js` and `popup.js` (`http://127.0.0.1:8000`). Change it there if your backend runs elsewhere.
- Results are cached per URL for the browser session, so repeat visits are instant.
