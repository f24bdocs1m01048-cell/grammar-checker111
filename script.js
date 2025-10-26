const btn = document.getElementById("checkBtn");
const input = document.getElementById("userInput");
const result = document.getElementById("result");

// Using the free LanguageTool API without API key (limited but works)
const API_URL = "https://api.languagetool.org/v2/check";

btn.addEventListener("click", async () => {
    const original = input.value.trim();

    if (!original) {
        result.innerHTML = "Please enter some text to check.";
        return;
    }

    result.innerHTML = "Analyzing...";
    btn.disabled = true;

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: `text=${encodeURIComponent(original)}&language=en-US`
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.matches && data.matches.length > 0) {
            let corrected = original;
            let issues = [];
            
            // Apply corrections from end to beginning to avoid position issues
            const sortedMatches = [...data.matches].sort((a, b) => b.offset - a.offset);
            
            sortedMatches.forEach(match => {
                if (match.replacements && match.replacements.length > 0) {
                    const replacement = match.replacements[0].value;
                    const start = match.offset;
                    const end = match.offset + match.length;
                    
                    // Only apply if replacement makes sense
                    if (replacement && replacement.length > 1 && replacement !== 'ie') {
                        corrected = corrected.substring(0, start) + replacement + corrected.substring(end);
                        issues.push({
                            original: original.substring(start, end),
                            corrected: replacement,
                            message: match.message
                        });
                    }
                }
            });

            let resultHTML = `<strong>Original:</strong> ${original}<br>`;
            resultHTML += `<strong>Corrected:</strong> ${corrected}<br><br>`;
            
            if (issues.length > 0) {
                resultHTML += `<strong>Issues fixed:</strong><ul>`;
                issues.forEach(issue => {
                    resultHTML += `<li>"${issue.original}" → "${issue.corrected}" - ${issue.message}</li>`;
                });
                resultHTML += `</ul>`;
            }
            
            result.innerHTML = resultHTML;
        } else {
            result.innerHTML = "✅ No grammar issues found!";
        }
    } catch (error) {
        console.error("Error:", error);
        result.innerHTML = "❌ Error checking grammar. Please try again.";
    } finally {
        btn.disabled = false;
    }
});
