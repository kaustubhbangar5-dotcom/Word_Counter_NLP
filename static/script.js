/**
 * WordWise NLP — Client-side Interactivity, Live Tokenization & NLP Dispatcher
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const userText = document.getElementById('userText');
    const textForm = document.getElementById('textForm');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const clearTextBtn = document.getElementById('clearTextBtn');
    const copyTextBtn = document.getElementById('copyTextBtn');
    const copyStatsBtn = document.getElementById('copyStatsBtn');
    const exportReportBtn = document.getElementById('exportReportBtn');
    const liveStatus = document.getElementById('liveStatus');

    // Ribbon Elements
    const ribbonWords = document.getElementById('ribbonWords');
    const ribbonChars = document.getElementById('ribbonChars');
    const ribbonSentences = document.getElementById('ribbonSentences');

    // Primary Stat Elements
    const statWords = document.getElementById('statWords');
    const statChars = document.getElementById('statChars');
    const statCharsNoSpaces = document.getElementById('statCharsNoSpaces');
    const statSentences = document.getElementById('statSentences');
    const statParagraphs = document.getElementById('statParagraphs');
    const statAvgWordLen = document.getElementById('statAvgWordLen');
    const statAvgSentenceLen = document.getElementById('statAvgSentenceLen');

    // Pace & Readability Elements
    const statReadingTime = document.getElementById('statReadingTime');
    const statSpeakingTime = document.getElementById('statSpeakingTime');
    const statReadabilityScore = document.getElementById('statReadabilityScore');
    const statReadabilityGrade = document.getElementById('statReadabilityGrade');
    const readabilityBadge = document.getElementById('readabilityBadge');
    const statLexicalPct = document.getElementById('statLexicalPct');
    const lexicalProgressBar = document.getElementById('lexicalProgressBar');
    const statUniqueCount = document.getElementById('statUniqueCount');
    const statUniqueTotal = document.getElementById('statUniqueTotal');

    // Dropdowns
    const transformDropdownBtn = document.getElementById('transformDropdownBtn');
    const fontDropdownBtn = document.getElementById('fontDropdownBtn');
    const currentFontLabel = document.getElementById('currentFontLabel');

    // Font Size Stepper
    const btnDecreaseFont = document.getElementById('btnDecreaseFont');
    const btnIncreaseFont = document.getElementById('btnIncreaseFont');
    const fontSizeBadge = document.getElementById('fontSizeBadge');

    // Toast Container
    const toastContainer = document.getElementById('toastContainer');

    // State Variables
    let currentAnalysisData = null;
    let activeFrequencyTab = 'keywords'; // 'keywords' | 'all'
    let debounceTimer = null;
    let currentFontSize = parseInt(localStorage.getItem('wordwise_font_size') || '16', 10);
    let currentFontFamily = localStorage.getItem('wordwise_font') || "'Outfit', sans-serif";

    // Load initial server stats if present
    const serverStatsScript = document.getElementById('serverStatsData');
    if (serverStatsScript && serverStatsScript.textContent) {
        try {
            currentAnalysisData = JSON.parse(serverStatsScript.textContent);
        } catch (e) {
            console.warn("Could not parse server stats JSON", e);
        }
    }

    if (lexicalProgressBar) {
        const initWidth = lexicalProgressBar.getAttribute('data-initial-width') || (currentAnalysisData ? currentAnalysisData.lexical_diversity : 0);
        lexicalProgressBar.style.width = `${Math.min(100, parseFloat(initWidth) || 0)}%`;
    }

    // Clear any previous dark theme setting from browser cache
    localStorage.removeItem('wordwise_theme');
    document.documentElement.removeAttribute('data-theme');

    // =========================================================================
    // Font Family & Size Initializations
    // =========================================================================
    function applyFont(fontFamily, labelName) {
        userText.style.fontFamily = fontFamily;
        if (labelName) {
            currentFontLabel.textContent = labelName;
        }
        localStorage.setItem('wordwise_font', fontFamily);
        if (labelName) localStorage.setItem('wordwise_font_label', labelName);

        // Update active class
        document.querySelectorAll('.font-opt').forEach(opt => {
            if (opt.getAttribute('data-font') === fontFamily) {
                opt.classList.add('active');
            } else {
                opt.classList.remove('active');
            }
        });
    }

    function applyFontSize(size) {
        currentFontSize = Math.max(12, Math.min(28, size));
        userText.style.fontSize = `${currentFontSize}px`;
        fontSizeBadge.textContent = `${currentFontSize}px`;
        localStorage.setItem('wordwise_font_size', currentFontSize);
    }

    // Apply saved font & size on boot (defaults to Outfit)
    const savedFontLabel = localStorage.getItem('wordwise_font_label') || 'Outfit';
    applyFont(currentFontFamily, savedFontLabel);
    applyFontSize(currentFontSize);

    // Font option click listener
    document.querySelectorAll('.font-opt').forEach(opt => {
        opt.addEventListener('click', () => {
            const font = opt.getAttribute('data-font');
            const label = opt.querySelector('strong').textContent.split(' ')[0];
            applyFont(font, label);
            showToast(`Font changed to ${label}`, 'info');
            document.querySelectorAll('.dropdown-wrapper.open').forEach(w => w.classList.remove('open'));
        });
    });

    // Font Size Stepper Listeners
    btnDecreaseFont.addEventListener('click', () => {
        applyFontSize(currentFontSize - 2);
    });

    btnIncreaseFont.addEventListener('click', () => {
        applyFontSize(currentFontSize + 2);
    });

    // =========================================================================
    // Toast Notification System
    // =========================================================================
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        const icon = type === 'success' ? '✓' : 'ℹ';
        toast.innerHTML = `<span><strong>${icon}</strong> ${message}</span>`;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 3000);
    }

    // =========================================================================
    // Dropdown Handlers (Close when clicking outside & Smart Right/Left Positioning)
    // =========================================================================
    function setupDropdown(button) {
        if (!button) return;
        const wrapper = button.closest('.dropdown-wrapper');
        const menu = wrapper.querySelector('.dropdown-menu');
        
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            // Close other dropdowns
            document.querySelectorAll('.dropdown-wrapper.open').forEach(w => {
                if (w !== wrapper) w.classList.remove('open');
            });
            
            wrapper.classList.toggle('open');
            
            // Smart positioning: check if opening to the right exceeds window boundary
            if (wrapper.classList.contains('open') && menu) {
                const rect = menu.getBoundingClientRect();
                if (rect.right > window.innerWidth - 15) {
                    menu.classList.add('align-right');
                } else {
                    menu.classList.remove('align-right');
                }
            }
        });
    }

    setupDropdown(fontDropdownBtn);
    setupDropdown(transformDropdownBtn);

    document.addEventListener('click', () => {
        document.querySelectorAll('.dropdown-wrapper.open').forEach(w => w.classList.remove('open'));
    });

    // =========================================================================
    // Fast Synchronous Client-Side Live Counter (0ms Latency, Zero Buffering)
    // =========================================================================
    function formatPaceDuration(seconds) {
        if (seconds <= 0) return '0 sec';
        if (seconds < 60) return `${Math.max(1, Math.round(seconds))} sec`;
        const mins = Math.floor(seconds / 60);
        const secs = Math.round(seconds % 60);
        return secs === 0 ? `${mins} min` : `${mins} min ${secs} sec`;
    }

    function updateInstantLiveMetrics(text) {
        const trimmed = text.trim();
        if (!trimmed) {
            ribbonWords.textContent = '0';
            ribbonChars.textContent = '0';
            ribbonSentences.textContent = '0';

            statWords.textContent = '0';
            statChars.textContent = '0';
            statCharsNoSpaces.textContent = '0';
            statSentences.textContent = '0';
            statParagraphs.textContent = '0';
            statAvgWordLen.textContent = '0';
            statAvgSentenceLen.textContent = '0';
            statReadingTime.textContent = '0 sec';
            statSpeakingTime.textContent = '0 sec';
            return;
        }

        // Fast and accurate word extraction (matches alphanumeric tokens)
        const words = trimmed.match(/\b[\w\d'-]+\b/g) || [];
        const wordCount = words.length;
        const charCount = text.length;
        const charCountNoSpaces = text.replace(/\s+/g, '').length;
        
        // Fast sentence splitting
        const sentences = trimmed.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
        const sentenceCount = Math.max(1, sentences.length);

        // Paragraphs
        const paragraphs = text.split(/\n+/).filter(p => p.trim().length > 0);
        const paragraphCount = Math.max(1, paragraphs.length);

        // Averages
        const totalCharsInWords = words.reduce((acc, w) => acc + w.length, 0);
        const avgWordLen = wordCount > 0 ? (totalCharsInWords / wordCount).toFixed(1) : '0';
        const avgSentenceLen = wordCount > 0 ? (wordCount / sentenceCount).toFixed(1) : '0';

        // Pacing (200 WPM reading, 130 WPM speaking)
        const readSecs = (wordCount / 200.0) * 60.0;
        const speakSecs = (wordCount / 130.0) * 60.0;

        // Instant DOM Sync (Zero buffering delay)
        ribbonWords.textContent = wordCount;
        ribbonChars.textContent = charCount;
        ribbonSentences.textContent = sentenceCount;

        statWords.textContent = wordCount;
        statChars.textContent = charCount;
        statCharsNoSpaces.textContent = charCountNoSpaces;
        statSentences.textContent = sentenceCount;
        statParagraphs.textContent = paragraphCount;
        statAvgWordLen.textContent = avgWordLen;
        statAvgSentenceLen.textContent = avgSentenceLen;
        statReadingTime.textContent = formatPaceDuration(readSecs);
        statSpeakingTime.textContent = formatPaceDuration(speakSecs);
    }

    // =========================================================================
    // Asynchronous NLP Deep Analytics (Background Fetch without UI Buffer)
    // =========================================================================
    let nlpAbortController = null;

    async function fetchNLPAnalysis(text) {
        if (!text.trim()) {
            renderDashboard({
                word_count: 0,
                character_count: 0,
                character_count_no_spaces: 0,
                sentence_count: 0,
                paragraph_count: 0,
                avg_word_length: 0,
                avg_sentence_length: 0,
                reading_time: '0 sec',
                speaking_time: '0 sec',
                readability_score: 0,
                readability_label: 'N/A',
                readability_grade: 'N/A',
                lexical_diversity: 0,
                unique_words_count: 0,
                top_keywords: [],
                top_words_all: [],
                longest_words: [],
                sentences_preview: []
            });
            return;
        }

        // Abort previous in-flight request to prevent network race condition
        if (nlpAbortController) {
            nlpAbortController.abort();
        }
        nlpAbortController = new AbortController();

        try {
            const response = await fetch('/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: text }),
                signal: nlpAbortController.signal
            });

            if (!response.ok) throw new Error('Analysis request failed');

            const result = await response.json();
            if (result.status === 'success' && result.data) {
                currentAnalysisData = result.data;
                renderDashboard(result.data);
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error("NLP analysis error:", err);
            }
        }
    }

    // Live Typing Listener (Zero-latency instant calculation + smooth debounced NLP)
    userText.addEventListener('input', () => {
        const text = userText.value;
        updateInstantLiveMetrics(text);

        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            fetchNLPAnalysis(text);
        }, 300);
    });

    // Handle Form Submit via AJAX (Prevents page reload flicker)
    textForm.addEventListener('submit', (e) => {
        e.preventDefault();
        fetchNLPAnalysis(userText.value);
    });

    // Keyboard shortcut: Ctrl + Enter to analyze
    userText.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            fetchNLPAnalysis(userText.value);
            showToast('Analyzed text with NLTK NLP', 'info');
        }
    });

    // =========================================================================
    // Render Dashboard UI with NLP Analysis Payload
    // =========================================================================
    function renderDashboard(data) {
        // Primary Cards
        statWords.textContent = data.word_count;
        statChars.textContent = data.character_count;
        statCharsNoSpaces.textContent = data.character_count_no_spaces;
        statSentences.textContent = data.sentence_count;
        statParagraphs.textContent = data.paragraph_count;
        statAvgWordLen.textContent = data.avg_word_length;
        statAvgSentenceLen.textContent = data.avg_sentence_length;

        // Ribbon update
        ribbonWords.textContent = data.word_count;
        ribbonChars.textContent = data.character_count;
        ribbonSentences.textContent = data.sentence_count;

        // Reading Pace
        statReadingTime.textContent = data.reading_time;
        statSpeakingTime.textContent = data.speaking_time;

        // Readability & Diversity
        statReadabilityScore.textContent = data.readability_score;
        statReadabilityGrade.textContent = data.readability_grade;
        readabilityBadge.textContent = data.readability_label;

        statLexicalPct.textContent = `${data.lexical_diversity}%`;
        lexicalProgressBar.style.width = `${Math.min(100, data.lexical_diversity)}%`;
        statUniqueCount.textContent = data.unique_words_count;
        statUniqueTotal.textContent = data.word_count;
    }

    // =========================================================================
    // Text Transformation Tools
    // =========================================================================
    document.getElementById('btnUpper').addEventListener('click', () => {
        userText.value = userText.value.toUpperCase();
        updateInstantLiveMetrics(userText.value);
        fetchNLPAnalysis(userText.value);
        showToast('Converted to UPPERCASE');
        document.querySelectorAll('.dropdown-wrapper.open').forEach(w => w.classList.remove('open'));
    });

    document.getElementById('btnLower').addEventListener('click', () => {
        userText.value = userText.value.toLowerCase();
        updateInstantLiveMetrics(userText.value);
        fetchNLPAnalysis(userText.value);
        showToast('Converted to lowercase');
        document.querySelectorAll('.dropdown-wrapper.open').forEach(w => w.classList.remove('open'));
    });

    document.getElementById('btnTitle').addEventListener('click', () => {
        userText.value = userText.value.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
        updateInstantLiveMetrics(userText.value);
        fetchNLPAnalysis(userText.value);
        showToast('Converted to Title Case');
        document.querySelectorAll('.dropdown-wrapper.open').forEach(w => w.classList.remove('open'));
    });

    document.getElementById('btnSentence').addEventListener('click', () => {
        userText.value = userText.value.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase());
        updateInstantLiveMetrics(userText.value);
        fetchNLPAnalysis(userText.value);
        showToast('Converted to Sentence case');
        document.querySelectorAll('.dropdown-wrapper.open').forEach(w => w.classList.remove('open'));
    });

    const btnToggle = document.getElementById('btnToggle');
    if (btnToggle) {
        btnToggle.addEventListener('click', () => {
            userText.value = userText.value.split('').map(char => {
                if (char === char.toUpperCase()) return char.toLowerCase();
                return char.toUpperCase();
            }).join('');
            updateInstantLiveMetrics(userText.value);
            fetchNLPAnalysis(userText.value);
            showToast('Toggled letter casing');
            document.querySelectorAll('.dropdown-wrapper.open').forEach(w => w.classList.remove('open'));
        });
    }

    document.getElementById('btnCleanSpaces').addEventListener('click', () => {
        userText.value = userText.value.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
        updateInstantLiveMetrics(userText.value);
        fetchNLPAnalysis(userText.value);
        showToast('Cleaned extra whitespace');
        document.querySelectorAll('.dropdown-wrapper.open').forEach(w => w.classList.remove('open'));
    });

    // =========================================================================
    // Action Buttons: Copy, Clear, Export
    // =========================================================================
    copyTextBtn.addEventListener('click', () => {
        if (!userText.value.trim()) {
            showToast('No text to copy!', 'info');
            return;
        }
        navigator.clipboard.writeText(userText.value)
            .then(() => showToast('Text copied to clipboard!'))
            .catch(() => showToast('Failed to copy', 'info'));
    });

    clearTextBtn.addEventListener('click', () => {
        if (!userText.value) return;
        userText.value = '';
        updateInstantLiveMetrics('');
        fetchNLPAnalysis('');
        showToast('Text cleared');
        userText.focus();
    });

    copyStatsBtn.addEventListener('click', () => {
        if (!currentAnalysisData || currentAnalysisData.word_count === 0) {
            showToast('Please analyze some text first', 'info');
            return;
        }

        const d = currentAnalysisData;
        const summary = [
            `📊 WordWise NLP Analysis Summary`,
            `----------------------------------`,
            `• Words: ${d.word_count}`,
            `• Characters (with spaces): ${d.character_count}`,
            `• Characters (no spaces): ${d.character_count_no_spaces}`,
            `• Sentences: ${d.sentence_count}`,
            `• Paragraphs: ${d.paragraph_count}`,
            `• Average Word Length: ${d.avg_word_length} chars`,
            `• Average Sentence Length: ${d.avg_sentence_length} words`,
            `• Reading Time (200 wpm): ${d.reading_time}`,
            `• Speaking Time (130 wpm): ${d.speaking_time}`,
            `• Flesch Reading Ease: ${d.readability_score}/100 (${d.readability_label} - ${d.readability_grade})`,
            `• Lexical Diversity: ${d.lexical_diversity}% (${d.unique_words_count} unique words)`,
            `• Engine: ${d.nlp_engine}`
        ].join('\n');

        navigator.clipboard.writeText(summary)
            .then(() => showToast('Statistics summary copied to clipboard!'))
            .catch(() => showToast('Failed to copy summary', 'info'));
    });

    exportReportBtn.addEventListener('click', () => {
        if (!currentAnalysisData || currentAnalysisData.word_count === 0) {
            showToast('Please analyze some text first', 'info');
            return;
        }

        const d = currentAnalysisData;
        const reportContent = [
            `=============================================================`,
            `  WORDWISE NLP: TEXT ANALYSIS REPORT`,
            `  Generated on: ${new Date().toLocaleString()}`,
            `=============================================================`,
            ``,
            `1. CORE METRICS`,
            `-------------------------------------------------------------`,
            `• Total Words               : ${d.word_count}`,
            `• Total Characters          : ${d.character_count}`,
            `• Characters (Without Spaces): ${d.character_count_no_spaces}`,
            `• Sentences Count           : ${d.sentence_count}`,
            `• Paragraphs Count          : ${d.paragraph_count}`,
            ``,
            `2. LINGUISTIC & READABILITY ANALYSIS`,
            `-------------------------------------------------------------`,
            `• Flesch Reading Ease Score : ${d.readability_score} / 100`,
            `• Reading Level Descriptor  : ${d.readability_label} (${d.readability_grade})`,
            `• Lexical Diversity Ratio   : ${d.lexical_diversity}%`,
            `• Unique Vocabulary Count   : ${d.unique_words_count} unique words`,
            `• Average Word Length       : ${d.avg_word_length} characters`,
            `• Average Sentence Length   : ${d.avg_sentence_length} words`,
            ``,
            `3. ESTIMATED PACING`,
            `-------------------------------------------------------------`,
            `• Estimated Reading Time    : ${d.reading_time}`,
            `• Estimated Speaking Time   : ${d.speaking_time}`,
            ``,
            `4. TOP KEYWORDS (STOPWORDS FILTERED)`,
            `-------------------------------------------------------------`,
            d.top_keywords.map(k => `  - ${k.word.padEnd(16)} : ${k.count} times (${k.percentage}%)`).join('\n') || '  None',
            ``,
            `5. LONGEST WORDS`,
            `-------------------------------------------------------------`,
            d.longest_words.map(w => `  - ${w.word} (${w.length} chars)`).join('\n') || '  None',
            ``,
            `6. ORIGINAL TEXT`,
            `-------------------------------------------------------------`,
            d.text,
            `=============================================================`
        ].join('\n');

        const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `WordWise_NLP_Report_${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Exported NLP Report as .txt');
    });

    // Initialize with text if pre-filled
    if (userText.value.trim().length > 0) {
        updateInstantLiveMetrics(userText.value);
        if (!currentAnalysisData || currentAnalysisData.word_count === 0) {
            fetchNLPAnalysis(userText.value);
        }
    }
});
