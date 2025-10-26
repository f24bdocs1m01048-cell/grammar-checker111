const btn = document.getElementById("checkBtn");
const input = document.getElementById("userInput");
const result = document.getElementById("result");

// Using a free grammar checking API that doesn't require authentication
const API_URL = "https://api.languagetool.org/v2/check";

btn.addEventListener("click", async () => {
    const text = input.value.trim();
    
    if (!text) {
        result.innerHTML = "Please enter some text to check.";
        return;
    }

    result.innerHTML = "Analyzing...";

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: `text=${encodeURIComponent(text)}&language=en-US`
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.matches && data.matches.length > 0) {
            let correctedText = text;
            let issues = [];
            
            // Apply corrections
            data.matches.forEach(match => {
                if (match.replacements && match.replacements.length > 0) {
                    const replacement = match.replacements[0].value;
                    const start = match.offset;
                    const end = match.offset + match.length;
                    correctedText = correctedText.substring(0, start) + replacement + correctedText.substring(end);
                    
                    issues.push({
                        issue: match.message,
                        suggestion: replacement
                    });
                }
            });
            
            let resultHTML = `<strong>Original:</strong> ${text}<br><br>`;
            resultHTML += `<strong>Corrected:</strong> ${correctedText}<br><br>`;
            resultHTML += `<strong>Issues found:</strong><ul>`;
            
            issues.forEach(issue => {
                resultHTML += `<li>${issue.issue} → <em>${issue.suggestion}</em></li>`;
            });
            
            resultHTML += `</ul>`;
            result.innerHTML = resultHTML;
        } else {
            result.innerHTML = "✅ No grammar issues found!";
        }
    } catch (error) {
        console.error("Error:", error);
        result.innerHTML = "❌ Error checking grammar. Please try again.";
    }
});
