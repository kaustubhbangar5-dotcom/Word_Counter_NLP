# WordWise NLP: Word Counter Using Natural Language Processing
### *Intelligent Text Analysis & Word Counting Engine*

<p align="center">
  <img src="static/logo.png" alt="WordWise NLP Logo" width="130" style="border-radius: 16px; box-shadow: 0 8px 24px rgba(99, 102, 241, 0.2);"/>
</p>

<p align="center">
  <strong>Fast. Accurate. Intelligent.</strong><br>
  A high-precision web-based word counter and text analytics platform powered by <strong>Python</strong>, <strong>Flask</strong>, and <strong>NLTK (Natural Language Toolkit)</strong>.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python&logoColor=white" alt="Python Version">
  <img src="https://img.shields.io/badge/Framework-Flask-black?logo=flask" alt="Flask">
  <img src="https://img.shields.io/badge/NLP-NLTK-green" alt="NLTK">
  <img src="https://img.shields.io/badge/UI-Clean%20Light%20Theme-blue" alt="Light Theme">
  <img src="https://img.shields.io/badge/Typography-Outfit-indigo" alt="Outfit Font">
</p>

---

## 🚀 Overview

**WordWise NLP** transforms standard text counting into an intelligent, linguistically aware analysis tool. Unlike basic character counters that rely solely on naive whitespace splitting, WordWise utilizes **NLTK tokenization** to parse genuine vocabulary tokens while ignoring isolated punctuation marks, segment sentences using grammatical boundaries, and compute readability indices.

The interface is engineered with a **zero-latency real-time typing engine**: standard word and character metrics update instantaneously (0ms delay), while deep linguistic metrics run seamlessly in the background via debounced asynchronous fetch calls with request cancellation.

```
                           User Text Input
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
       [Instant Client-Side]           [Debounced Async Fetch]
       • Real-time Word Count          • Deep NLTK Tokenization
       • Character Count (+/- space)   • Sentence Segmentation
       • Paragraph Count               • Flesch Reading Ease
       • Live Status Ribbon            • Lexical Diversity %
                 │                               │
                 └───────────────┬───────────────┘
                                 ▼
                     Dynamic WordWise Dashboard
```

---

## 🏗️ System Architecture

<p align="center">
  <img src="static/WordWise NLP System Architecture.png" alt="WordWise NLP System Architecture" width="100%" style="border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);"/>
</p>

---

## 📸 Application Interface & Results

<p align="center">
  <img src="static/WordWise NLP Result.png" alt="WordWise NLP Result" width="100%" style="border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);"/>
</p>

---

## ✨ Key Features

- **⚡ Instant 0ms Live Counting**: Zero lag or buffering while typing; live status indicator provides immediate feedback.
- **🧠 NLTK Linguistic Tokenization**:
  - **Word Count**: Accurately counts discrete lexical words, filtering out standalone punctuation.
  - **Character Count**: Provides both total character count and character count excluding spaces.
  - **Sentence Segmentation**: Uses NLTK's `sent_tokenize` (with fallback) to identify real sentence boundaries, accounting for abbreviations and periods.
  - **Paragraph Count**: Computes non-empty structured paragraphs.
  - **Average Metrics**: Computes average sentence length (words/sentence) and average word length (chars/word).
- **⏱️ Estimated Reading & Speaking Pace**:
  - **Reading Time**: Calculated at standard reading pace (~200 words per minute).
  - **Speaking Time**: Calculated at conversational speaking pace (~130 words per minute).
- **📖 Readability & Lexical Diversity**:
  - **Flesch Reading Ease**: Scaled from 0 to 100 with qualitative reading levels (*Very Easy*, *Standard*, *College*, etc.).
  - **Lexical Diversity**: Dynamic progress bar showcasing vocabulary richness (unique words vs. total words).
- **🔤 Editor Toolbar & Typography Controls**:
  - **Font Selector**: Choose between **Outfit** (modern geometric default), **Inter**, **Merriweather** (editorial serif), and **JetBrains Mono** (monospace).
  - **Font Size Stepper**: Step editor font size up or down (`A−` / `A+`) from 12px to 28px with live pixel badge.
  - **Text Case Converter**: One-click transformations:
    - `UPPERCASE`
    - `lowercase`
    - `Title Case`
    - `Sentence case`
    - `tOGGLE cASE`
    - `Clean Extra Spaces` (strips excessive spaces and tabs)
  - **Quick Action Buttons**: One-click **Copy Text** and **Clear Text**.
- **📋 Export & Sharing**:
  - **Export Report**: Download full analysis summary as a formatted `.txt` report file.
  - **Copy Stats**: Copy structured statistics summary to clipboard with toast notification.
- **🎨 Modern Aesthetic Design**:
  - Curated, clean pure white / light mode interface.
  - Google Font typography with full weight support (Outfit 300–900).
  - Glassmorphic elevated cards, smooth shadows, and animated ambient gradient orbs.

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
|---|---|---|
| **Backend Engine** | [Python 3](https://www.python.org/) | Core application logic and linguistic calculations |
| **NLP Framework** | [NLTK](https://www.nltk.org/) | Natural Language Toolkit (`punkt_tab`, `punkt`, `stopwords`) |
| **Web Framework** | [Flask](https://flask.palletsprojects.com/) | RESTful API routing, template rendering, and JSON endpoints |
| **Frontend UI** | HTML5 & Vanilla CSS3 | Modern light theme, CSS variables, elevated glass cards |
| **Reactivity** | Vanilla JavaScript (ES6+) | 0ms event listeners, debounced AJAX with `AbortController`, clipboard APIs |
| **Typography** | Google Fonts | Outfit, Inter, Merriweather, JetBrains Mono |

---

## 📁 Project Structure

```
Word-Counter-NLP/
│
├── app.py                                  # Flask server, NLP analysis pipeline, & API endpoints
├── requirements.txt                        # Python dependencies (Flask, nltk)
├── README.md                               # Project documentation & guides
├── .gitignore                              # Git exclusion list
├── WordWise NLP Result.png                 # Interface preview screenshot
│
├── templates/
│   └── index.html                          # Main HTML5 application interface
│
└── static/
    ├── logo.png                            # Official WordWise NLP logo
    ├── favicon.png                         # Browser tab icon
    ├── WordWise NLP Result.png             # Full resolution dashboard result screenshot
    ├── WordWise NLP System Architecture.png# Comprehensive system architecture diagram
    ├── style.css                           # Design system, CSS variables & responsive layout
    └── script.js                           # Live typing engine, debounced NLP fetch & UI toolbar
```

---

## ⚡ Installation & Local Setup

### 1. Prerequisites
Ensure you have **Python 3.10+** installed on your system. Verify with:
```bash
python --version
```

### 2. Navigate to Project Directory
```bash
cd "c:\Kaustubh Bangar\Word-Counter-NLP"
```

### 3. Install Dependencies
Install Flask and NLTK from `requirements.txt`:
```bash
pip install -r requirements.txt
```

### 4. Run the Application
Start the Flask development server:
```bash
python app.py
```
*Note: NLTK corpora (`punkt_tab`, `punkt`, `stopwords`) will automatically download on the first run if not already cached.*

### 5. Open in Web Browser
Open your browser and navigate to:
```
http://127.0.0.1:5000
```

---

## 🧠 NLP Processing & Linguistic Methodology

### 1. Tokenization (`nltk.word_tokenize`)
Standard counters split text using `split(' ')`, which incorrectly includes punctuation as words (e.g. treating `"hello,"` as 7 characters). WordWise isolates discrete alphabetic and alphanumeric tokens and filters out punctuation marks:
```python
words = [w for w in nltk.word_tokenize(text) if any(c.isalnum() for c in w)]
```

### 2. Sentence Segmentation (`nltk.sent_tokenize`)
Sentence detection uses NLTK's pre-trained unsupervised point model to distinguish end-of-sentence periods from abbreviation periods (e.g., `"Dr. Smith visited Washington D.C. yesterday."` is correctly identified as a single sentence).

### 3. Flesch Reading Ease Formula
The readability score measures how easy a text is to read on a scale from 0 to 100:
$$\text{Score} = 206.835 - 1.015 \left(\frac{\text{Total Words}}{\text{Total Sentences}}\right) - 84.6 \left(\frac{\text{Total Syllables}}{\text{Total Words}}\right)$$

| Score Range | Difficulty Level | Typical Grade |
|:---:|:---:|:---:|
| **90 – 100** | Very Easy | 5th grade |
| **80 – 89** | Easy | 6th grade |
| **70 – 79** | Fairly Easy | 7th grade |
| **60 – 69** | Standard | 8th – 9th grade |
| **50 – 59** | Fairly Difficult | 10th – 12th grade |
| **30 – 49** | Difficult | College level |
| **0 – 29** | Very Confusing | College graduate |

### 4. Lexical Diversity
Measures the richness of vocabulary using the Type-Token Ratio (TTR):
$$\text{Lexical Diversity} = \left(\frac{\text{Unique Words}}{\text{Total Words}}\right) \times 100\%$$

---

## 👨‍💻 Developer & Credits

**WordWise NLP**  
*Intelligent Text Analysis & Word Counting Engine*

- **Developer**: **Kaustubh Ashish Bangar**  
- **Powered by**: **Python • Flask • NLTK**  
- **Year**: 2027  

**Fast. Accurate. Intelligent.**  
*Transforming Text into Meaningful Insights.*

---

© 2027 WordWise NLP. All Rights Reserved.
