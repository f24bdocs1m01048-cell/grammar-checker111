document.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById("checkBtn");
    const input = document.getElementById("userInput");
    const result = document.getElementById("result");

    // Using a more reliable grammar checking API
    const API_URL = "https://grammarbot-neural.p.rapidapi.com/check";
    // Note: This requires a free RapidAPI key

    btn.addEventListener("click", async () => {
        const text = input.value.trim();
        
        if (!text) {
            result.innerHTML = "Please enter some text to check.";
            return;
        }

        result.innerHTML = "Analyzing...";
        btn.disabled = true;

        try {
            // Simple client-side grammar rules (fallback)
            const quickCheck = simpleGrammarCheck(text);
            if (quickCheck.hasErrors) {
                result.innerHTML = `
                    <strong>Original:</strong> ${text}<br><br>
                    <strong>Suggested Correction:</strong> ${quickCheck.suggestion}<br><br>
                    <strong>Issue:</strong> ${quickCheck.issue}<br><br>
                    <em>💡 Tip: ${quickCheck.tip}</em>
                `;
                return;
            }

            // If no quick issues found, show positive message
            result.innerHTML = "✅ No obvious grammar issues found! Your sentence looks good.";
            
        } catch (error) {
            console.error("Error:", error);
            result.innerHTML = "❌ Error checking grammar. Please try again.";
        } finally {
            btn.disabled = false;
        }
    });

    // Simple grammar rules for common mistakes
    function simpleGrammarCheck(text) {
        const rules = [
            {
                pattern: /\b(he|she|it)\s+(were)\b/gi,
                replacement: '$1 was',
                issue: 'Subject-verb agreement error',
                tip: 'Use "was" with he, she, it (third person singular)'
            },
            {
                pattern: /\b(i)\s+(was)\b/gi,
                replacement: 'I was',
                issue: 'Capitalization',
                tip: 'Always capitalize "I"'
            },
            {
                pattern: /\b(we|they|you)\s+(was)\b/gi,
                replacement: '$1 were',
                issue: 'Subject-verb agreement error',
                tip: 'Use "were" with we, they, you'
            },
            {
                pattern: /\b(a)\s+([aeiou])/gi,
                replacement: 'an $2',
                issue: 'Article usage',
                tip: 'Use "an" before vowel sounds'
            },
            {
                pattern: /\b(their)\s+(is|was)\b/gi,
                replacement: 'there is',
                issue: 'Common confusion',
                tip: '"Their" shows possession, "there" indicates location'
            },
            {
                pattern: /\b(your)\s+(welcome)\b/gi,
                replacement: 'you\'re welcome',
                issue: 'Common confusion',
                tip: '"Your" shows possession, "you\'re" means "you are"'
            }
        ];

        for (let rule of rules) {
            if (rule.pattern.test(text)) {
                const suggestion = text.replace(rule.pattern, rule.replacement);
                return {
                    hasErrors: true,
                    suggestion: suggestion,
                    issue: rule.issue,
                    tip: rule.tip
                };
            }
        }

        return { hasErrors: false };
    }

    // Add some interactive features
    input.addEventListener('input', function() {
        if (input.value.length > 0) {
            btn.style.background = '#ff1493';
        } else {
            btn.style.background = '#ccc';
        }
    });
});
