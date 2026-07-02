function getParam(name) {
  const url = window.location.href;
  const param = name + "=";
  const start = url.indexOf(param);
  if (start === -1) return null;
  const valueStart = start + param.length;
  const end = url.indexOf("&", valueStart);
  return decodeURIComponent(
    end === -1
      ? url.substring(valueStart)
      : url.substring(valueStart, end)
  );
}

const blockedUrl = getParam("url")   || "Unknown URL";
const prob       = getParam("prob")  || "96";
const warns      = getParam("warns") || "";

document.getElementById("blocked-url").textContent = blockedUrl;
document.getElementById("prob").textContent = prob + "%";

const warnDiv  = document.getElementById("warnings");
const warnList = warns.length > 0
  ? warns.split("|").filter(w => w.length > 0)
  : [];

if (warnList.length > 0) {
  warnDiv.innerHTML =
    "<p><strong style='color:#ffaa00'>⚠️ Warning Signs:</strong></p>" +
    warnList.map(w => "<p>• " + w + "</p>").join("");
} else {
  warnDiv.innerHTML =
    "<p><strong style='color:#ffaa00'>⚠️ Warning Signs:</strong></p>" +
    "<p>• No HTTPS encryption</p>" +
    "<p>• Suspicious domain pattern</p>" +
    "<p>• Possible phishing keywords</p>";
}

function proceed() {
  window.location.href = blockedUrl;
}