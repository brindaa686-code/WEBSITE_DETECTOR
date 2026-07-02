let tooltip = null;

function createTooltip() {
  const t = document.createElement("div");
  t.id = "phishing-tooltip";
  t.style.cssText = `
    position: fixed;
    padding: 8px 14px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: bold;
    z-index: 999999;
    pointer-events: none;
    display: none;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    font-family: Segoe UI, sans-serif;
  `;
  document.body.appendChild(t);
  return t;
}

function showTooltip(x, y, text, color, bg) {
  if (!tooltip) tooltip = createTooltip();
  tooltip.textContent = text;
  tooltip.style.color = color;
  tooltip.style.background = bg;
  tooltip.style.border = `1px solid ${color}`;
  tooltip.style.left = `${x + 10}px`;
  tooltip.style.top = `${y + 10}px`;
  tooltip.style.display = "block";
}

function hideTooltip() {
  if (tooltip) tooltip.style.display = "none";
}

// Check links on hover
document.addEventListener("mouseover", async (e) => {
  const link = e.target.closest("a");
  if (!link) return;

  const url = link.href;
  if (!url.startsWith("http")) return;

  chrome.runtime.sendMessage(
    { type: "CHECK_URL", url },
    (result) => {
      if (!result) return;
      if (result.prediction === "PHISHING") {
        showTooltip(
          e.clientX, e.clientY,
          `🚨 PHISHING DETECTED! ${result.phishing_probability}% risk`,
          "#ff4444", "#1a0000"
        );
        link.style.outline = "2px solid #ff4444";
        link.style.borderRadius = "3px";
      } else {
        showTooltip(
          e.clientX, e.clientY,
          `✅ Safe — ${result.legitimate_probability}% legitimate`,
          "#00cc66", "#001a0a"
        );
        link.style.outline = "";
      }
    }
  );
});

document.addEventListener("mouseout", (e) => {
  const link = e.target.closest("a");
  if (link) hideTooltip();
});