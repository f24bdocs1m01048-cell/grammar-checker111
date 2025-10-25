const btn = document.getElementById("checkBtn");
const input = document.getElementById("userInput");
const result = document.getElementById("result");

const API_URL = "https://api-inference.huggingface.co/models/pszemraj/flan-t5-large-grammar-synthesis";
const API_KEY = "YOUR_API_KEY_HERE";

btn.addEventListener("click", async () => {
    const original = input.value.trim();

    result.innerHTML = "Analyzing...";

    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: original })
    });

    const data = await response.json();
    const corrected = data[0].generated_text;

    if (corrected === original) {
        result.innerHTML = "✅ No grammar issues found!";
    } else {
        result.innerHTML = `Original: ${original}<br>Corrected: ${corrected}`;
    }
});
