const API = "http://127.0.0.1:8000";

async function checkApi() {
  try {
    const res = await fetch(`${API}/health`);
    if (res.ok) {
      document.getElementById("dot").style.background = "#00cc66";
      document.getElementById("status-text").textContent = "API Connected ✅";
    }
  } catch {
    document.getElementById("dot").style.background = "#ff4444";
    document.getElementById("status-text").textContent = "API Not Running ❌";
  }
}

document.getElementById("check-btn").addEventListener("click", async () => {
  const url = document.getElementById("url-input").value;
  if (!url.startsWith("http")) return;

  const btn = document.getElementById("check-btn");
  btn.textContent = "Checking...";

  try {
    const res = await fetch(`${API}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const data = await res.json();
    const result = document.getElementById("result");
    const verdict = document.getElementById("verdict");
    const prob = document.getElementById("prob");

    result.style.display = "block";

    if (data.prediction === "PHISHING") {
      result.className = "phish";
      verdict.style.color = "#ff4444";
      verdict.textContent = `🚨 PHISHING — ${data.risk_level}`;
      prob.textContent = `${data.phishing_probability}% phishing probability`;
    } else {
      result.className = "safe";
      verdict.style.color = "#00cc66";
      verdict.textContent = `✅ LEGITIMATE — SAFE`;
      prob.textContent = `${data.legitimate_probability}% legitimate`;
    }
  } catch {
    alert("API not running. Start the backend first.");
  }

  btn.textContent = "Check URL";
});

checkApi();