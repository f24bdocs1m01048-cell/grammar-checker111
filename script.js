document.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById("checkBtn");
    const input = document.getElementById("userInput");
    const result = document.getElementById("result");

    // Check if elements exist
    if (!btn || !input || !result) {
        console.error("One or more elements not found!");
        return;
    }

    console.log("Grammar checker loaded successfully!");

    const API_URL = "https://api.languagetool.org/v2/check";

    btn.addEventListener("click", async () => {
        console.log("Button clicked!");
        
        const text = input.value.trim();
        
        if (!text) {
            result.innerHTML = "Please enter some text to check.";
            return;
        }

        result.innerHTML = "Analyzing...";
        btn.disabled = true;
        btn.textContent = "Checking...";

        try {
            console.log("Making API request...");
            
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: `text=${encodeURIComponent(text)}&language=en-US`
            });

            console.log("Response received:", response.status);

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            console.log("Data parsed:", data);
            
            if (data.matches && data.matches.length > 0) {
                let resultHTML = `<strong>Found ${data.matches.length} issue(s):</strong><br><br>`;
                
                data.matches.forEach((match, index) => {
                    const context = text.substring(match.offset, match.offset + match.length);
                    resultHTML += `<strong>Issue ${index + 1}:</strong> ${match.message}<br>`;
                    resultHTML += `<strong>Context:</strong> "${context}"<br>`;
                    if (match.replacements && match.replacements.length > 0) {
                        resultHTML += `<em>Suggestions: ${match.replacements.slice(0, 3).map(r => r.value).join(', ')}</em><br>`;
                    }
                    resultHTML += `<br>`;
                });
                
                result.innerHTML = resultHTML;
            } else {
                result.innerHTML = "✅ No grammar issues found!";
            }
        } catch (error) {
            console.error("Error:", error);
            result.innerHTML = "❌ Error checking grammar. Please try again later.";
        } finally {
            btn.disabled = false;
            btn.textContent = "Check Grammar";
        }
    });

    // Add Enter key support
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && e.ctrlKey) {
            btn.click();
        }
    });
});
