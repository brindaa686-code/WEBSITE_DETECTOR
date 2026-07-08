🛡️ AI-Powered Phishing Detection System

     An intelligent web security solution that detects phishing websites using Machine Learning. 
  Built with FastAPI, React, Scikit-learn, and a Chrome Extension.

 📖 Overview
       
       Phishing attacks continue to be one of the most prevalent cybersecurity threats, tricking users into revealing sensitive information through fraudulent websites.
This project presents an AI-powered phishing detection system capable of analyzing website URLs in real time and classifying them as **Legitimate** or **Phishing**. The system extracts multiple URL-based security features, processes them through a trained Machine Learning model, and returns prediction results with confidence scores and risk analysis.

Paste a URL into the web app (or just browse with the Chrome extension installed) and the system analyzes the URL's characteristics — length, HTTPS, suspicious keywords, IP addresses, hyphens, subdomains and more — then tells you whether it looks **legitimate** or **phishing**, with a confidence score and the warning signs it found.

Built with **Python (FastAPI + scikit-learn)**, **React**, and a **Chrome Extension (Manifest V3)**.

---

## 🗂️ How this repo is organized

The project has three independent parts that talk to each other over HTTP:

```
WEBSITE_DETECTOR/
├── backend/     → Python API + machine learning model (the brain)
├── frontend/    → React web app (the face)
├── extension/   → Chrome extension (the bodyguard)
├── CONTRIBUTING.md
├── LICENSE
└── README.md    → you are here
```

```
                       ┌──────────────────┐
                       │       User       │
                       └────────┬─────────┘
                ┌───────────────┼────────────────┐
                ▼                                ▼
     ┌────────────────────┐          ┌─────────────────────┐
     │  React Web App     │          │  Chrome Extension   │
     │  localhost:5173    │          │  (blocks bad sites) │
     └─────────┬──────────┘          └──────────┬──────────┘
               │         POST /predict          │
               └───────────────┬────────────────┘
                               ▼
                  ┌─────────────────────────┐
                  │  FastAPI Backend :8000  │
                  │  1. extract URL features│
                  │  2. run the ML model    │
                  │  3. return verdict      │
                  └─────────────────────────┘
```

Each folder has its own README with more detail:
[`backend/README.md`](backend/README.md) · [`frontend/README.md`](frontend/README.md) · [`extension/README.md`](extension/README.md)

---

## 🚀 Getting started

### What you need installed first

| Tool | Why you need it | Get it here |
|------|-----------------|-------------|
| [Python](https://www.python.org/downloads/) 3.10+ | runs the backend | python.org/downloads |
| [Node.js](https://nodejs.org/) 18+ | runs the web app | nodejs.org |
| [Git](https://git-scm.com/downloads) | downloads this project | git-scm.com *(or skip it and use Download ZIP below)* |
| [Google Chrome](https://www.google.com/chrome/) | for the extension | google.com/chrome |

> 💡 **Never used a terminal?** It's the app where you type commands.
> - **macOS:** press `Cmd + Space`, type **Terminal**, press Enter
> - **Windows:** press the Windows key, type **PowerShell**, press Enter
>
> Type (or paste) each command below **one line at a time** and press Enter. The ✅ lines tell you what success looks like.

### Step 0 — Get the code

```bash
git clone https://github.com/yourusername/WEBSITE_DETECTOR.git
cd WEBSITE_DETECTOR
```

> **Don't have Git?** On the GitHub page, click the green **Code** button → **Download ZIP** → unzip it, then in your terminal type `cd ` (with a space) and drag the unzipped folder onto the terminal window, and press Enter.

### Step 1 — Start the backend (the brain)

Everything depends on this part, so start here.

**macOS / Linux:**

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn src.api.main:app --reload
```

**Windows (PowerShell):**

```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn src.api.main:app --reload
```

✅ You should see `Uvicorn running on http://127.0.0.1:8000`.
**Keep this window open** — closing it stops the backend.

Try it: open http://127.0.0.1:8000/docs in your browser to see the interactive API playground.

> A trained model is already included in `backend/models/`, so no training is needed — it works out of the box. Want to retrain it? See [backend/README.md](backend/README.md).

### Step 2 — Start the web app (the face)

Open a **second** terminal window (leave the first one running!), go back into the project folder, then:

```bash
cd frontend
npm install
npm run dev
```

✅ Open **http://localhost:5173** in your browser — paste any URL and click **Check URL**.

> ⚙️ **No configuration needed.** The web app already knows the backend lives at `http://127.0.0.1:8000`. Only if you run the backend at a *different* address: copy the file `frontend/.env.example`, rename the copy to `.env`, and change the address inside it.

### Step 3 — Load the Chrome extension (optional but fun)

1. Open Chrome and go to `chrome://extensions`
2. Turn on **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `extension/` folder from this repo

✅ Now try visiting a suspicious URL — the extension checks every page you navigate to and shows a full-screen warning if it looks like phishing. Hovering links shows a safe/unsafe tooltip.

> The extension needs the backend running (Step 1) to work.

---

## 📡 API reference

**`GET /health`** — check the API is alive

```json
{ "status": "healthy" }
```

**`POST /predict`** — analyze a URL

Request:
```json
{ "url": "http://paypa1-secure.tk/login" }
```

Response:
```json
{
  "url": "http://paypa1-secure.tk/login",
  "prediction": "PHISHING",
  "risk_level": "HIGH RISK",
  "phishing_probability": 97.42,
  "legitimate_probability": 2.58,
  "warning_signs": [
    "No HTTPS encryption",
    "Hyphens in domain name"
  ],
  "features": { "url_length": 32, "has_https": 0, "...": "..." }
}
```

Full interactive docs are auto-generated at http://127.0.0.1:8000/docs while the backend is running.

---

## 🧠 How the detection works

1. **Feature extraction** — the URL is broken down into ~25 numeric features: length, dots, hyphens, digits, HTTPS or not, IP-address-as-domain, suspicious keywords (`login`, `verify`, `secure`, brand names…), subdomain length, and so on. See [`backend/src/features/url_features.py`](backend/src/features/url_features.py).
2. **Classification** — a [Random Forest](https://scikit-learn.org/stable/modules/ensemble.html#forests-of-randomized-trees) model (many decision trees voting together) trained on labeled phishing/legitimate URLs scores the features.
3. **Verdict** — the phishing probability is mapped to a risk level (**SAFE** < 50% ≤ **MEDIUM RISK** < 80% ≤ **HIGH RISK**) and human-readable warning signs are attached.

---

## 🔧 Troubleshooting

| Problem | Fix |
|---------|-----|
| Web app says *"Backend not running"* | Start the backend (Step 1) and keep that terminal window open |
| Extension popup shows *"API Not Running ❌"* | Same — the backend must be running on port 8000 |
| `python3: command not found` (Windows) | Use `python` instead of `python3` |
| `running scripts is disabled` when activating venv (Windows) | In PowerShell run `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`, then try again |
| `npm: command not found` | Install Node.js from [nodejs.org](https://nodejs.org), then close and reopen the terminal |
| `uvicorn: command not found` | Activate the virtual environment first (`source venv/bin/activate`, or `venv\Scripts\activate` on Windows) |
| `Model not found` error | Run `python -m src.model.train` inside `backend/` |
| Port 8000 already in use | Start the backend with `uvicorn src.api.main:app --reload --port 8001`, then copy `frontend/.env.example` to `frontend/.env` and set `VITE_API_URL=http://127.0.0.1:8001` |

---

## 🤝 Contributing

Contributions are welcome — this is a great first open-source project to hack on. See [CONTRIBUTING.md](CONTRIBUTING.md) for how to set up, test, and submit changes.

Some ideas if you want to jump in:

- Train on a real public dataset (e.g. PhishTank) instead of the small sample set
- Wire the WHOIS / SSL certificate features (already written in `backend/src/features/`) into the model
- Publish the extension to the Chrome Web Store
- Dockerize the backend

## ⚠️ Disclaimer

This is an **educational project**. The included model is trained on a small sample dataset, so it will make mistakes — do not rely on it as your only protection against phishing.

## 📄 License

[MIT](LICENSE) — free to use, modify, and share.
