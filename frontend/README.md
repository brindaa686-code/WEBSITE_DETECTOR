# Frontend — React + Vite

The web interface: check a single URL, scan all links inside a pasted email, bulk-scan a list of URLs, and see your check history.

## Run it

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173.

> The app talks to the backend API, so make sure it's running first — see [../backend/README.md](../backend/README.md).

## Configuration (optional)

**You don't need to configure anything to run the app** — by default it looks for the backend at `http://127.0.0.1:8000`, which is exactly where the backend runs if you followed the main README.

Only if your backend runs at a different address, make a copy of `.env.example` named `.env`:

```bash
cp .env.example .env        # macOS / Linux
copy .env.example .env      # Windows
```

…then open `.env` and change the address:

```bash
VITE_API_URL=http://127.0.0.1:8001
```

Restart `npm run dev` after changing it.

## Folder map

```
frontend/
├── index.html          # page shell
├── src/
│   ├── main.jsx        # React entry point
│   ├── App.jsx         # the whole app (tabs, result cards, API calls)
│   └── index.css       # global reset + dark background
└── public/favicon.svg
```

## Other commands

```bash
npm run build      # production build → dist/
npm run preview    # preview the production build
npm run lint       # run oxlint
```
