import os
import re
import string
from collections import Counter
from flask import Flask, render_template, request, jsonify

# Initialize Flask App
app = Flask(__name__)

# Safe initialization of NLTK components
NLTK_AVAILABLE = False
STOP_WORDS = set()

try:
    import nltk
    # Try importing tokenizers
    from nltk.tokenize import word_tokenize, sent_tokenize
    from nltk.corpus import stopwords
    
    # Check / download required resources quietly
    try:
        nltk.download('punkt_tab', quiet=True)
        nltk.download('punkt', quiet=True)
        nltk.download('stopwords', quiet=True)
    except Exception:
        pass

    try:
        STOP_WORDS = set(stopwords.words('english'))
    except Exception:
        STOP_WORDS = {
            'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', "you're",
            "you've", "you'll", "you'd", 'your', 'yours', 'yourself', 'yourselves', 'he',
            'him', 'his', 'himself', 'she', "she's", 'her', 'hers', 'herself', 'it', "it's",
            'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which',
            'who', 'whom', 'this', 'that', "that'll", 'these', 'those', 'am', 'is', 'are',
            'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does',
            'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until',
            'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into',
            'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down',
            'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here',
            'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more',
            'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
            'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', "don't", 'should',
            "should've", 'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren', "aren't"
        }
    NLTK_AVAILABLE = True
except Exception as e:
    print(f"NLTK fallback active: {e}")
    STOP_WORDS = {
        'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any',
        'are', 'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between',
        'both', 'but', 'by', 'can', 'did', 'do', 'does', 'doing', 'don', 'down', 'during',
        'each', 'few', 'for', 'from', 'further', 'had', 'has', 'have', 'having', 'he', 'her',
        'here', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into',
        'is', 'it', 'its', 'itself', 'just', 'me', 'more', 'most', 'my', 'myself', 'no',
        'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our', 'ours',
        'ourselves', 'out', 'over', 'own', 's', 'same', 'she', 'should', 'so', 'some', 'such',
        't', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there',
        'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up',
        'very', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom',
        'why', 'will', 'with', 'you', 'your', 'yours', 'yourself', 'yourselves'
    }


def tokenize_sentences(text):
    """Segment text into individual sentences using NLTK or regex fallback."""
    if not text.strip():
        return []
    
    if NLTK_AVAILABLE:
        try:
            return sent_tokenize(text)
        except Exception:
            pass
            
    # Fallback regex sentence splitter
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    return [s.strip() for s in sentences if s.strip()]


def tokenize_words(text):
    """Tokenize text into words, excluding standalone punctuation tokens."""
    if not text.strip():
        return []
        
    raw_tokens = []
    if NLTK_AVAILABLE:
        try:
            raw_tokens = word_tokenize(text)
        except Exception:
            raw_tokens = re.findall(r'\b\w+(?:[\'-]\w+)*\b|[^\w\s]', text)
    else:
        raw_tokens = re.findall(r'\b\w+(?:[\'-]\w+)*\b|[^\w\s]', text)

    # Filter out standalone punctuation tokens (e.g. '.', ',', '!', '?', '"', '(', ')')
    punctuation_set = set(string.punctuation + '“”‘’—…–•«»')
    words = [token for token in raw_tokens if token not in punctuation_set and any(c.isalnum() for c in token)]
    return words


def count_syllables(word):
    """Estimate syllable count for a given word using vowel heuristic."""
    word = word.lower()
    if len(word) <= 3:
        return 1
    # Remove trailing 'e', 'es', 'ed' if preceded by consonant
    word = re.sub(r'(?:[^laeiouy]|ed|es|e)$', '', word)
    # Find vowel groups
    vowel_matches = re.findall(r'[aeiouy]{1,2}', word)
    return max(1, len(vowel_matches))


def format_duration(seconds):
    """Format seconds into readable human-friendly duration."""
    if seconds < 60:
        return f"{max(1, int(round(seconds)))} sec"
    mins = int(seconds // 60)
    secs = int(round(seconds % 60))
    if secs == 0:
        return f"{mins} min"
    return f"{mins} min {secs} sec"


def analyze_text(text):
    """
    Perform comprehensive NLP and statistical analysis on input text.
    """
    if not text or not text.strip():
        return {
            'text': '',
            'word_count': 0,
            'character_count': 0,
            'character_count_no_spaces': 0,
            'sentence_count': 0,
            'paragraph_count': 0,
            'avg_word_length': 0,
            'avg_sentence_length': 0,
            'reading_time': '0 sec',
            'speaking_time': '0 sec',
            'reading_time_seconds': 0,
            'speaking_time_seconds': 0,
            'readability_score': 0,
            'readability_label': 'N/A',
            'readability_grade': 'N/A',
            'lexical_diversity': 0,
            'unique_words_count': 0,
            'top_keywords': [],
            'top_words_all': [],
            'longest_words': [],
            'sentences_preview': [],
            'nlp_engine': 'NLTK' if NLTK_AVAILABLE else 'Rule-Based Regex'
        }

    clean_text = text.strip()
    
    # 1. Characters
    char_count = len(text)
    char_count_no_spaces = len(re.sub(r'\s', '', text))
    
    # 2. Sentences (NLTK Tokenization)
    sentences = tokenize_sentences(clean_text)
    sentence_count = max(1, len(sentences)) if clean_text else 0
    
    # 3. Words (NLTK Tokenization excluding punctuation)
    words = tokenize_words(clean_text)
    word_count = len(words)
    
    # 4. Paragraphs
    raw_paragraphs = [p.strip() for p in re.split(r'\n+', text) if p.strip()]
    paragraph_count = len(raw_paragraphs)
    
    # 5. Averages
    if word_count > 0:
        avg_word_length = round(sum(len(w) for w in words) / word_count, 1)
        avg_sentence_length = round(word_count / max(1, sentence_count), 1)
        unique_words = set(w.lower() for w in words)
        unique_words_count = len(unique_words)
        lexical_diversity = round((unique_words_count / word_count) * 100, 1)
    else:
        avg_word_length = 0
        avg_sentence_length = 0
        unique_words_count = 0
        lexical_diversity = 0

    # 6. Reading & Speaking Time (200 WPM reading, 130 WPM speaking)
    reading_seconds = (word_count / 200.0) * 60.0
    speaking_seconds = (word_count / 130.0) * 60.0
    reading_time = format_duration(reading_seconds)
    speaking_time = format_duration(speaking_seconds)

    # 7. Readability Calculation (Flesch Reading Ease)
    readability_score = 0
    readability_label = 'Standard'
    readability_grade = '8th - 9th Grade'
    
    if word_count >= 5 and sentence_count >= 1:
        total_syllables = sum(count_syllables(w) for w in words)
        flesch = 206.835 - 1.015 * (word_count / sentence_count) - 84.6 * (total_syllables / word_count)
        readability_score = max(0, min(100, round(flesch, 1)))
        
        if readability_score >= 90:
            readability_label = 'Very Easy'
            readability_grade = '5th Grade'
        elif readability_score >= 80:
            readability_label = 'Easy'
            readability_grade = '6th Grade'
        elif readability_score >= 70:
            readability_label = 'Fairly Easy'
            readability_grade = '7th Grade'
        elif readability_score >= 60:
            readability_label = 'Standard'
            readability_grade = '8th - 9th Grade'
        elif readability_score >= 50:
            readability_label = 'Fairly Difficult'
            readability_grade = '10th - 12th Grade'
        elif readability_score >= 30:
            readability_label = 'Difficult'
            readability_grade = 'College Level'
        else:
            readability_label = 'Very Difficult'
            readability_grade = 'Graduate Level'
    elif word_count > 0:
        readability_score = 70
        readability_label = 'Brief Text'
        readability_grade = 'General'

    # 8. Word Frequency Distribution & Keywords (Stopwords filtered)
    words_lower = [w.lower() for w in words]
    counter_all = Counter(words_lower)
    
    keywords_filtered = [w for w in words_lower if w not in STOP_WORDS and len(w) > 1]
    counter_keywords = Counter(keywords_filtered) if keywords_filtered else counter_all

    # Format top keywords
    top_keywords = []
    top_kw_items = counter_keywords.most_common(10)
    for word, count in top_kw_items:
        pct = round((count / max(1, word_count)) * 100, 1)
        top_keywords.append({
            'word': word,
            'count': count,
            'percentage': pct
        })

    # Format top words (all)
    top_words_all = []
    for word, count in counter_all.most_common(10):
        pct = round((count / max(1, word_count)) * 100, 1)
        top_words_all.append({
            'word': word,
            'count': count,
            'percentage': pct
        })

    # 9. Longest unique words
    unique_words_sorted = sorted(list(set(words)), key=lambda x: len(x), reverse=True)
    longest_words = []
    for w in unique_words_sorted[:6]:
        if len(w) > 2:
            longest_words.append({'word': w, 'length': len(w)})

    # 10. Sentences Breakdown Preview
    sentences_preview = []
    for idx, s in enumerate(sentences[:10], start=1):
        s_words = tokenize_words(s)
        sentences_preview.append({
            'index': idx,
            'text': s,
            'word_count': len(s_words),
            'char_count': len(s)
        })

    return {
        'text': text,
        'word_count': word_count,
        'character_count': char_count,
        'character_count_no_spaces': char_count_no_spaces,
        'sentence_count': sentence_count,
        'paragraph_count': paragraph_count,
        'avg_word_length': avg_word_length,
        'avg_sentence_length': avg_sentence_length,
        'reading_time': reading_time,
        'speaking_time': speaking_time,
        'reading_time_seconds': round(reading_seconds, 1),
        'speaking_time_seconds': round(speaking_seconds, 1),
        'readability_score': readability_score,
        'readability_label': readability_label,
        'readability_grade': readability_grade,
        'lexical_diversity': lexical_diversity,
        'unique_words_count': unique_words_count,
        'top_keywords': top_keywords,
        'top_words_all': top_words_all,
        'longest_words': longest_words,
        'sentences_preview': sentences_preview,
        'total_sentences_preview_count': len(sentences),
        'nlp_engine': 'NLTK Tokenizer' if NLTK_AVAILABLE else 'Natural Language Rules'
    }


@app.route('/', methods=['GET', 'POST'])
def index():
    """Main route handling both initial GET and traditional POST form submissions."""
    if request.method == 'POST':
        user_text = request.form.get('user_text', '')
        analysis = analyze_text(user_text)
        return render_template('index.html', stats=analysis, input_text=user_text)
    
    # Default initial state
    default_stats = analyze_text("")
    return render_template('index.html', stats=default_stats, input_text="")


@app.route('/analyze', methods=['POST'])
def analyze_endpoint():
    """AJAX API endpoint returning live JSON NLP text statistics."""
    try:
        if request.is_json:
            data = request.get_json()
            user_text = data.get('text', '') if data else ''
        else:
            user_text = request.form.get('user_text', '')

        analysis = analyze_text(user_text)
        return jsonify({
            'status': 'success',
            'data': analysis
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


if __name__ == '__main__':
    # Run locally on port 5000
    app.run(debug=True, host='127.0.0.1', port=5000)
