const btn = document.getElementById("check-btn");
const input = document.getElementById("text-input");
const result = document.getElementById("result");

const API_URL = "https://api-inference.huggingface.co/models/pszemraj/flan-t5-base-grammar-synthesis";
const API_KEY = "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";

btn.addEventListener("click", async () => {
  const text = input.value;
  result.innerText = "Analyzing...";

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ inputs: text })
  });

  const data = await response.json();
  const corrected = data[0].generated_text || data[0].summary_text;

  result.innerText = corrected;
});
