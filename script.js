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
                // Use the API's suggested sentence directly if available
                let correctedText = originalText;
                const corrections = [];
                
                // First, try to find a "whole sentence" correction
                const sentenceCorrection = data.matches.find(match => 
                    match.rule && match.rule.category && 
                    match.rule.category.id === 'TYPOS' &&
                    match.replacements && match.replacements.some(rep => 
                        rep.value && rep.value.includes(' ')
                    )
                );

                if (sentenceCorrection && sentenceCorrection.replacements && sentenceCorrection.replacements.length > 0) {
                    // Use the full sentence correction
                    correctedText = sentenceCorrection.replacements[0].value;
                    corrections.push({
                        original: originalText,
                        corrected: correctedText,
                        message: sentenceCorrection.message
                    });
                } else {
                    // Apply individual corrections carefully
                    const sortedMatches = [...data.matches].sort((a, b) => b.offset - a.offset);
                    
                    sortedMatches.forEach(match => {
                        if (match.replacements && match.replacements.length > 0) {
                            const originalWord = correctedText.substring(match.offset, match.offset + match.length);
                            let bestReplacement = match.replacements[0].value;
                            
                            // Skip problematic replacements
                            if (bestReplacement === 'ie' || bestReplacement.length < 2) {
                                return;
                            }
                            
                            // Preserve capitalization
                            if (originalWord.length > 0 && originalWord[0] === originalWord[0].toUpperCase()) {
                                bestReplacement = bestReplacement.charAt(0).toUpperCase() + bestReplacement.slice(1);
                            }
                            
                            correctedText = correctedText.substring(0, match.offset) + 
                                          bestReplacement + 
                                          correctedText.substring(match.offset + match.length);
                            
                            corrections.unshift({
                                original: originalWord,
                                corrected: bestReplacement,
                                message: match.message
                            });
                        }
                    });
                }

                // Display results
                let resultHTML = `<strong>Original:</strong> ${originalText}<br><br>`;
                resultHTML += `<strong>Corrected:</strong> ${correctedText}<br><br>`;
                
                if (corrections.length > 0) {
                    resultHTML += `<strong>Issues found:</strong><ul>`;
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
});
