document.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById("checkBtn");
    const input = document.getElementById("userInput");
    const result = document.getElementById("result");

    // Free API - no key required for basic usage
    const API_URL = "https://api.languagetool.org/v2/check";

    btn.addEventListener("click", async () => {
        const text = input.value.trim();
        
        if (!text) {
            showResult("Please enter some text to check.", "error");
            return;
        }

        showResult("🔍 Analyzing with AI Grammar Checker...", "loading");
        btn.disabled = true;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `text=${encodeURIComponent(text)}&language=en-US`
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            displayResults(text, data);
            
        } catch (error) {
            console.error("Error:", error);
            // Fallback to client-side checking if API fails
            showResult("⚠️ Using basic checker...", "loading");
            const fallbackResult = basicGrammarCheck(text);
            displayFallbackResults(text, fallbackResult);
        } finally {
            btn.disabled = false;
        }
    });

    function displayResults(original, data) {
        if (data.matches && data.matches.length > 0) {
            let correctedText = original;
            const corrections = [];

            // Apply corrections
            const sortedMatches = [...data.matches].sort((a, b) => b.offset - a.offset);
            
            sortedMatches.forEach(match => {
                if (match.replacements && match.replacements.length > 0) {
                    const originalWord = correctedText.substring(match.offset, match.offset + match.length);
                    let replacement = match.replacements[0].value;
                    
                    // Filter out bad replacements
                    if (replacement.length < 2 || replacement === 'ie') {
                        return;
                    }
                    
                    // Preserve capitalization
                    if (originalWord[0] === originalWord[0].toUpperCase()) {
                        replacement = replacement.charAt(0).toUpperCase() + replacement.slice(1);
                    }
                    
                    correctedText = correctedText.substring(0, match.offset) + replacement + correctedText.substring(match.offset + match.length);
                    
                    corrections.push({
                        original: originalWord,
                        corrected: replacement,
                        message: match.message
                    });
                }
            });

            let html = `
                <div class="result-header">
                    <h3>📊 Grammar Analysis</h3>
                    <div class="score">Found ${corrections.length} issue(s)</div>
                </div>

                <div class="text-comparison">
                    <div class="text-box">
                        <label>Your Text:</label>
                        <div class="text original">${original}</div>
                    </div>
                    <div class="text-box">
                        <label>Improved Version:</label>
                        <div class="text corrected">${correctedText}</div>
                    </div>
                </div>
            `;

            if (corrections.length > 0) {
                html += `
                    <div class="corrections">
                        <h4>🔧 Corrections Made:</h4>
                        <div class="corrections-list">
                `;
                
                corrections.forEach(corr => {
                    html += `
                        <div class="correction-item">
                            <span class="change">"${corr.original}" → "${corr.corrected}"</span>
                            <span class="reason">${corr.message}</span>
                        </div>
                    `;
                });
                
                html += `</div></div>`;
            }

            result.innerHTML = html;
        } else {
            result.innerHTML = `
                <div class="result-success">
                    <div class="success-icon">✅</div>
                    <h3>Perfect Grammar!</h3>
                    <p>No issues found in your text:</p>
                    <div class="original-text">"${original}"</div>
                </div>
            `;
        }
    }

    function basicGrammarCheck(text) {
        // Simple client-side fallback
        const rules = [
            { regex: /\bi\b/g, correction: 'I', issue: 'Capitalize "I"' },
            { regex: /\bI\s+is\b/gi, correction: 'I am', issue: 'Use "am" with "I"' },
            { regex: /\b(he|she|it)\s+(are|were)\b/gi, correction: '$1 is', issue: 'Use "is" with he/she/it' },
            { regex: /\b(he|she|it)\s+have\b/gi, correction: '$1 has', issue: 'Use "has" with he/she/it' }
        ];

        let corrected = text;
        const issues = [];

        rules.forEach(rule => {
            if (rule.regex.test(corrected)) {
                corrected = corrected.replace(rule.regex, rule.correction);
                issues.push(rule.issue);
            }
        });

        return { corrected, issues, hasIssues: issues.length > 0 };
    }

    function displayFallbackResults(original, result) {
        if (result.hasIssues) {
            result.innerHTML = `
                <div class="result-with-issues">
                    <h3>🔍 Basic Grammar Check</h3>
                    <p><strong>Original:</strong> ${original}</p>
                    <p><strong>Suggested:</strong> ${result.corrected}</p>
                    <div class="issues">
                        <strong>Issues fixed:</strong>
                        <ul>${result.issues.map(issue => `<li>${issue}</li>`).join('')}</ul>
                    </div>
                </div>
            `;
        } else {
            result.innerHTML = `
                <div class="result-success">
                    <h3>✅ Looks Good!</h3>
                    <p>No obvious grammar issues found.</p>
                </div>
            `;
        }
    }

    function showResult(message, type) {
        result.innerHTML = message;
        result.className = type;
    }
});
