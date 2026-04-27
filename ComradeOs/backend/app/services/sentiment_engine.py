from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

# Initialize globally to avoid overhead on every request
analyzer = SentimentIntensityAnalyzer()

# List of crisis keywords that override normal sentiment scores
CRISIS_KEYWORDS = [
    "suicide", "kill myself", "give up", "can't take this anymore",
    "worthless", "hopeless", "end it all", "no reason to live"
]

def analyze_journal_entry(text: str) -> dict:
    """
    Analyzes text locally using VADER.
    Does not store or persist the raw text.
    Returns computed emotional scores and intervention flags.
    """
    if not text or not text.strip():
        return {
            "score": 0.0,
            "classification": "neutral",
            "intervention_triggered": False,
            "intervention_message": None
        }

    # 1. Compute Base Sentiment Score
    sentiment_dict = analyzer.polarity_scores(text)
    compound_score = sentiment_dict['compound']

    # 2. Crisis Keyword Override
    text_lower = text.lower()
    crisis_detected = any(keyword in text_lower for keyword in CRISIS_KEYWORDS)

    # 3. Classification & Intervention Logic
    intervention_triggered = False
    intervention_message = None

    if crisis_detected or compound_score <= -0.7:
        classification = "crisis"
        intervention_triggered = True
        intervention_message = (
            "Comrade, we see you're carrying a heavy burden right now. "
            "Please reach out to the campus counselor at 0700-123-456 or talk to a trusted friend. "
            "You don't have to face this alone."
        )
    elif compound_score <= -0.2:
        classification = "negative"
    elif compound_score >= 0.2:
        classification = "positive"
    else:
        classification = "neutral"

    # Explicitly return only the metrics, dropping the raw text
    return {
        "score": compound_score,
        "classification": classification,
        "intervention_triggered": intervention_triggered,
        "intervention_message": intervention_message
    }
