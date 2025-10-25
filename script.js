// script.js — replace entire file with this
const btn = document.getElementById("check-btn");
const input = document.getElementById("text-input");
const result = document.getElementById("result");

// NOTE: use pszemraj/flan-t5-base-grammar-synthesis (reliable)
const API_URL = "https://api-inference.huggingface.co/models/pszemraj/flan-t5-base-grammar-synthesis";

// IMPORTANT: DO NOT commit a real key to a public repo long-term.
// For now you can place it here to test, but **revoke it afterwards**.
const API_KEY = "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"; // <-- replace with your token for testing

if (!btn || !input || !result) {
  console.error("Required DOM elements not found. Check index.html IDs.");
  alert("Page setup error: required elements missing. See console.");
}

btn.addEventListener("click", async () => {
  const text = (input.value || "").trim();
  if (!text) {
    result.innerText = "Please type something.";
    return;
  }

  result.innerText = "Analyzing... (may take 20-90s if model is waking up)";

  try {
    const resp = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: text })
    });

    // show status for debugging
    if (!resp.ok) {
      const body = await resp.text();
      console.error("HTTP error:", resp.status, body);
      result.innerText = `Error: ${resp.status}. Check console.`;
      return;
    }

    const data = await resp.json();
    console.log("HuggingFace response:", data);

    // handle different model return shapes
    const corrected = (Array.isArray(data) && (data[0].generated_text || data[0].summary_text || data[0].output)) || data.generated_text || data.summary_text || null;

    if (!corrected) {
      result.innerText = "No valid response from model. Check console for details.";
      return;
    }

    result.innerText = corrected;
  } catch (err) {
    console.error("Fetch error:", err);
    result.innerText = "Network or CORS error — see console.";
  }
});

