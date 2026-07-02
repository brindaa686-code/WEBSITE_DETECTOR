import { useState } from "react";
import axios from "axios";

const API = "http://127.0.0.1:8000";

export default function App() {
  const [activeTab, setActiveTab] = useState("single");
  const [url, setUrl] = useState("");
  const [emailText, setEmailText] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [result, setResult] = useState(null);
  const [bulkResults, setBulkResults] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── helpers ──────────────────────────────────────────
  const extractUrls = (text) =>
    [...text.matchAll(/https?:\/\/[^\s"'<>]+/g)].map((m) => m[0]);

  const checkSingle = async (targetUrl) => {
    const u = targetUrl || url;
    if (!u.startsWith("http"))
      return setError("URL must start with http:// or https://");
    setLoading(true); setResult(null); setError(null);
    try {
      const { data } = await axios.post(`${API}/predict`, { url: u });
      setResult(data);
      setHistory((h) => [
        { url: u, prediction: data.prediction,
          risk: data.risk_level,
          prob: data.phishing_probability,
          time: new Date().toLocaleTimeString() },
        ...h.slice(0, 9),
      ]);
    } catch { setError("Backend not running. Start the API first."); }
    finally { setLoading(false); }
  };

  const checkEmail = async () => {
    const urls = extractUrls(emailText);
    if (!urls.length) return setError("No URLs found in email text.");
    setLoading(true); setBulkResults([]); setError(null);
    const results = [];
    for (const u of urls) {
      try {
        const { data } = await axios.post(`${API}/predict`, { url: u });
        results.push(data);
      } catch { results.push({ url: u, prediction: "ERROR", risk_level: "UNKNOWN", phishing_probability: 0 }); }
    }
    setBulkResults(results); setLoading(false);
  };

  const checkBulk = async () => {
    const urls = bulkText.split("\n").map((u) => u.trim()).filter((u) => u.startsWith("http"));
    if (!urls.length) return setError("No valid URLs found. Each URL must start with http:// or https://");
    setLoading(true); setBulkResults([]); setError(null);
    const results = [];
    for (const u of urls) {
      try {
        const { data } = await axios.post(`${API}/predict`, { url: u });
        results.push(data);
      } catch { results.push({ url: u, prediction: "ERROR", risk_level: "UNKNOWN", phishing_probability: 0 }); }
    }
    setBulkResults(results); setLoading(false);
  };

  // ── colors ────────────────────────────────────────────
  const riskColor = (r) =>
    r === "HIGH RISK" ? "#ff4444" : r === "MEDIUM RISK" ? "#ffaa00" : "#00cc66";

  // ── styles ────────────────────────────────────────────
  const s = {
    page:   { maxWidth: 700, margin: "0 auto", padding: 20, fontFamily: "Segoe UI", background: "#0f0f1a", minHeight: "100vh", color: "#fff" },
    card:   { background: "#1a1a2e", borderRadius: 12, padding: 20, marginBottom: 16, border: "1px solid #2a2a3e" },
    input:  { width: "100%", padding: 12, borderRadius: 8, border: "1px solid #333", background: "#0f0f1a", color: "#fff", fontSize: 14, boxSizing: "border-box", marginBottom: 10 },
    btn:    { width: "100%", padding: 12, background: "#4a90e2", color: "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: "bold", cursor: "pointer", marginBottom: 8 },
    tab:    (active) => ({ padding: "10px 18px", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: "bold", fontSize: 13, background: active ? "#4a90e2" : "#1a1a2e", color: active ? "#fff" : "#888", marginRight: 8 }),
    badge:  (r) => ({ display: "inline-block", padding: "3px 12px", borderRadius: 20, fontSize: 12, fontWeight: "bold", background: riskColor(r), color: "#fff" }),
    label:  { fontSize: 11, color: "#666", textTransform: "uppercase", margin: "0 0 4px" },
  };

  // ── result card ───────────────────────────────────────
  const ResultCard = ({ r }) => (
    <div style={{ ...s.card, borderColor: riskColor(r.risk_level), borderWidth: 2 }}>

      {/* verdict */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
        <span style={{ fontSize: 44 }}>{r.prediction === "PHISHING" ? "🚨" : "✅"}</span>
        <div>
          <p style={{ fontSize: 26, fontWeight: "bold", color: riskColor(r.risk_level), margin: 0 }}>{r.prediction}</p>
          <span style={s.badge(r.risk_level)}>{r.risk_level}</span>
        </div>
      </div>
      <p style={{ color: "#888", fontSize: 12, wordBreak: "break-all", margin: "0 0 16px" }}>🔗 {r.url}</p>

      {/* USE CASE 4 — big red warning banner */}
      {r.phishing_probability >= 80 && (
        <div style={{ background: "#3a0000", border: "2px solid #ff4444", borderRadius: 10, padding: 14, marginBottom: 14, textAlign: "center" }}>
          <p style={{ color: "#ff4444", fontSize: 16, fontWeight: "bold", margin: 0 }}>
            🚨 DANGER — Do NOT click or visit this URL!
          </p>
          <p style={{ color: "#ff8888", fontSize: 13, margin: "6px 0 0" }}>
            This URL has a {r.phishing_probability}% chance of being a phishing attack.
          </p>
        </div>
      )}

      {/* confidence bars */}
      <p style={{ ...s.label, marginBottom: 10 }}>📊 Confidence</p>
      {[["🚨 Phishing", r.phishing_probability, "#ff4444"],
        ["✅ Legitimate", r.legitimate_probability, "#00cc66"]].map(([label, val, clr]) => (
        <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <span style={{ fontSize: 13, width: 90 }}>{label}</span>
          <div style={{ flex: 1, background: "#2a2a3e", borderRadius: 5, height: 10 }}>
            <div style={{ width: `${val}%`, background: clr, height: "100%", borderRadius: 5 }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: "bold", width: 45, textAlign: "right" }}>{val}%</span>
        </div>
      ))}

      {/* warnings */}
      {r.warning_signs?.length > 0 && (
        <div style={{ background: "#1a1500", borderRadius: 10, padding: 14, border: "1px solid #ffaa00", marginTop: 12 }}>
          <p style={{ ...s.label, color: "#ffaa00", marginBottom: 8 }}>⚠️ Warning Signs</p>
          {r.warning_signs.map((w, i) => <p key={i} style={{ color: "#ffdd88", fontSize: 14, margin: "4px 0" }}>• {w}</p>)}
        </div>
      )}

      {/* safe message */}
      {r.warning_signs?.length === 0 && r.prediction === "LEGITIMATE" && (
        <div style={{ background: "#001a0a", borderRadius: 10, padding: 14, border: "1px solid #00cc66", marginTop: 12 }}>
          <p style={{ color: "#00cc66", margin: 0 }}>✅ No suspicious patterns found. This URL looks safe!</p>
        </div>
      )}

      {/* feature grid */}
      {r.features && (
        <div style={{ marginTop: 12 }}>
          <p style={{ ...s.label, marginBottom: 8 }}>🔍 Analysis Details</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[["URL Length", `${r.features.url_length} chars`],
              ["HTTPS", r.features.has_https ? "Yes ✅" : "No 🚨"],
              ["IP Address", r.features.has_ip_address ? "Yes 🚨" : "No ✅"],
              ["Hyphens", r.features.num_hyphens],
              ["Subdomains", r.features.has_subdomain ? "Yes" : "No"],
              ["Suspicious Keywords", r.features.num_suspicious_keywords],
            ].map(([label, val]) => (
              <div key={label} style={{ background: "#0f0f1a", borderRadius: 8, padding: 10 }}>
                <p style={s.label}>{label}</p>
                <p style={{ fontSize: 14, fontWeight: "bold", margin: 0 }}>{val}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // ── bulk results table ────────────────────────────────
  const BulkTable = () => (
    <div style={s.card}>
      <p style={{ fontWeight: "bold", marginBottom: 12, color: "#ccc" }}>
        📋 Results — {bulkResults.length} URLs scanned
        — 🚨 {bulkResults.filter(r => r.prediction === "PHISHING").length} phishing
        — ✅ {bulkResults.filter(r => r.prediction === "LEGITIMATE").length} safe
      </p>
      {bulkResults.map((r, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderTop: "1px solid #2a2a3e" }}>
          <span style={{ fontSize: 20 }}>{r.prediction === "PHISHING" ? "🚨" : r.prediction === "LEGITIMATE" ? "✅" : "❓"}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 12, color: "#888", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.url}</p>
            <span style={s.badge(r.risk_level)}>{r.risk_level}</span>
          </div>
          <span style={{ fontSize: 13, fontWeight: "bold", color: riskColor(r.risk_level) }}>{r.phishing_probability}%</span>
        </div>
      ))}
    </div>
  );

  // ── main render ───────────────────────────────────────
  return (
    <div style={s.page}>

      {/* header */}
      <div style={{ textAlign: "center", padding: "20px 0 24px" }}>
        <h1 style={{ fontSize: 32, margin: "0 0 6px" }}>🛡️ Phishing Detector</h1>
        <p style={{ color: "#888", margin: 0 }}>Check if a URL is safe or malicious</p>
      </div>

      {/* tabs */}
      <div style={{ marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 4 }}>
        {[["single",  "🔍 Single URL"],
          ["email",   "📧 Email Scanner"],
          ["bulk",    "📋 Bulk Scanner"],
          ["history", "🕐 History"],
        ].map(([id, label]) => (
          <button key={id} style={s.tab(activeTab === id)} onClick={() => { setActiveTab(id); setError(null); setResult(null); setBulkResults([]); }}>
            {label}
          </button>
        ))}
      </div>

      {/* error */}
      {error && <div style={{ background: "#2a1a1a", border: "1px solid #ff4444", borderRadius: 8, padding: 14, marginBottom: 16, color: "#ff4444" }}>⚠️ {error}</div>}

      {/* loading */}
      {loading && <div style={{ ...s.card, textAlign: "center" }}>🔍 Analyzing... please wait</div>}

      {/* ── TAB 1: Single URL ── */}
      {activeTab === "single" && (
        <div>
          <div style={s.card}>
            <p style={{ ...s.label, marginBottom: 8 }}>Enter URL to check</p>
            <input style={s.input} placeholder="https://example.com" value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === "Enter" && checkSingle()} />
            <button style={s.btn} onClick={() => checkSingle()} disabled={loading}>
              {loading ? "Checking..." : "Check URL"}
            </button>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
              <span style={{ fontSize: 12, color: "#666" }}>Try:</span>
              {["https://www.google.com",
                "http://paypa1-secure.tk/login",
                "http://192.168.1.1/login.php"].map(u => (
                <button key={u} onClick={() => { setUrl(u); }}
                  style={{ fontSize: 11, padding: "4px 10px", background: "transparent", border: "1px solid #333", color: "#4a90e2", borderRadius: 6, cursor: "pointer" }}>
                  {u.replace("https://", "").replace("http://", "").split("/")[0]}
                </button>
              ))}
            </div>
          </div>
          {result && <ResultCard r={result} />}
        </div>
      )}

      {/* ── TAB 2: Email Scanner (Use Case 1) ── */}
      {activeTab === "email" && (
        <div>
          <div style={s.card}>
            <p style={{ ...s.label, marginBottom: 8 }}>📧 Paste email content below</p>
            <p style={{ color: "#666", fontSize: 12, marginBottom: 10 }}>
              All URLs found in the email will be automatically extracted and scanned
            </p>
            <textarea
              style={{ ...s.input, height: 160, resize: "vertical" }}
              placeholder={"Paste the full email text here...\n\nExample:\nDear user, click here to verify: http://paypa1-secure.tk/login\nOr visit: https://www.google.com"}
              value={emailText}
              onChange={e => setEmailText(e.target.value)}
            />
            <button style={s.btn} onClick={checkEmail} disabled={loading}>
              {loading ? "Scanning..." : "Scan Email Links"}
            </button>
          </div>
          {bulkResults.length > 0 && <BulkTable />}
        </div>
      )}

      {/* ── TAB 3: Bulk Scanner (Use Case 2 + 3) ── */}
      {activeTab === "bulk" && (
        <div>
          <div style={s.card}>
            <p style={{ ...s.label, marginBottom: 8 }}>📋 Bulk URL Scanner</p>
            <p style={{ color: "#666", fontSize: 12, marginBottom: 10 }}>
              Enter one URL per line — paste browser history or any list of URLs
            </p>
            <textarea
              style={{ ...s.input, height: 180, resize: "vertical" }}
              placeholder={"https://www.google.com\nhttp://paypa1-secure.tk/login\nhttps://www.github.com\nhttp://verify-account-now.com/bank"}
              value={bulkText}
              onChange={e => setBulkText(e.target.value)}
            />
            <button style={s.btn} onClick={checkBulk} disabled={loading}>
              {loading ? "Scanning..." : "Scan All URLs"}
            </button>
          </div>
          {bulkResults.length > 0 && <BulkTable />}
        </div>
      )}

      {/* ── TAB 4: History (Use Case 5) ── */}
      {activeTab === "history" && (
        <div style={s.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <p style={{ fontWeight: "bold", color: "#ccc", margin: 0 }}>🕐 Recently Checked URLs</p>
            {history.length > 0 && (
              <button onClick={() => setHistory([])}
                style={{ fontSize: 12, padding: "4px 10px", background: "transparent", border: "1px solid #ff4444", color: "#ff4444", borderRadius: 6, cursor: "pointer" }}>
                Clear History
              </button>
            )}
          </div>
          {history.length === 0
            ? <p style={{ color: "#666", textAlign: "center", padding: 20 }}>No URLs checked yet. Go to Single URL tab to start.</p>
            : history.map((h, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderTop: "1px solid #2a2a3e" }}>
                <span style={{ fontSize: 20 }}>{h.prediction === "PHISHING" ? "🚨" : "✅"}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, color: "#888", margin: "0 0 3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.url}</p>
                  <span style={s.badge(h.risk)}>{h.risk}</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 13, fontWeight: "bold", color: riskColor(h.risk), margin: 0 }}>{h.prob}%</p>
                  <p style={{ fontSize: 11, color: "#666", margin: 0 }}>{h.time}</p>
                </div>
              </div>
            ))
          }
        </div>
      )}

    </div>
  );
}