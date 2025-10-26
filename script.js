document.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById("checkBtn");
    const input = document.getElementById("userInput");
    const result = document.getElementById("result");

    const API_URL = "https://api.languagetool.org/v2/check";

    btn.addEventListener("click", async () => {
        const originalText = input.value.trim();
        
        if (!originalText) {
            result.innerHTML = "Please enter some text to check.";
            return;
        }

        result.innerHTML = "Analyzing...";
        btn.disabled = true;
        btn.textContent = "Checking...";

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: `text=${encodeURIComponent(originalText)}&language=en-US`
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.matches && data.matches.length > 0) {
                // Apply corrections in reverse order (from end to beginning)
                // to avoid position shifting issues
                let correctedText = originalText;
                const corrections = [];
                
                // Sort matches by offset in descending order
                const sortedMatches = [...data.matches].sort((a, b) => b.offset - a.offset);
                
                sortedMatches.forEach(match => {
                    if (match.replacements && match.replacements.length > 0) {
                        const bestReplacement = match.replacements[0].value;
                        const start = match.offset;
                        const end = match.offset + match.length;
                        
                        // Store correction info before modifying text
                        const originalWord = correctedText.substring(start, end);
                        
                        // Apply the correction
                        correctedText = correctedText.substring(0, start) + bestReplacement + correctedText.substring(end);
                        
                        corrections.unshift({
                            original: originalWord,
                            corrected: bestReplacement,
                            message: match.message,
                            context: correctedText.substring(Math.max(0, start - 10), start + bestReplacement.length + 10)
                        });
                    }
                });

                // Display results
                let resultHTML = `<strong>Original:</strong> ${originalText}<br><br>`;
                resultHTML += `<strong>Corrected:</strong> ${correctedText}<br><br>`;
                
                if (corrections.length > 0) {
                    resultHTML += `<strong>Corrections made:</strong><ul>`;
                    corrections.forEach(correction => {
                        resultHTML += `<li>"${correction.original}" → "${correction.corrected}"<br><em>${correction.message}</em></li>`;
                    });
                    resultHTML += `</ul>`;
                }
                
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
