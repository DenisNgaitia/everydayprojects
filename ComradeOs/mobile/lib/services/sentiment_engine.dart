class SentimentEngine {
  // A heuristic dictionary customized for Kenyan student realities (Sheng/Swahili/English)
  static const List<String> stressKeywords = [
    'nimechoka', 'kufa', 'kujinyonga', 'stress', 'depressed', 
    'giving up', 'hate my life', 'can\'t take it', 'msoto', 
    'broke', 'dust', 'suicide', 'lonely', 'sitoboi', 'ni kubaya'
  ];

  static const List<String> angerKeywords = [
    'fuck', 'hate', 'stupid', 'bullshit', 'mjinga', 
    'fala', 'nkt', 'nonsense', 'hasira', 'kuua', 'kill'
  ];

  /// Analyzes the text and returns a Map containing anger and sadness scores (0.0 to 1.0)
  static Map<String, double> analyzeVent(String text) {
    if (text.isEmpty) {
      return {'anger': 0.0, 'sadness': 0.0};
    }

    final words = text.toLowerCase().split(RegExp(r'\W+'));
    final totalWords = words.length;

    int stressCount = 0;
    int angerCount = 0;

    for (var word in words) {
      if (stressKeywords.contains(word)) stressCount++;
      if (angerKeywords.contains(word)) angerCount++;
    }

    // Very basic heuristic: if >10% of words are stress/anger keywords, scale up to 1.0
    double sadnessScore = (stressCount / totalWords) * 10; 
    double angerScore = (angerCount / totalWords) * 10;

    return {
      'sadness': sadnessScore > 1.0 ? 1.0 : sadnessScore,
      'anger': angerScore > 1.0 ? 1.0 : angerScore,
    };
  }

  /// Determines if "Draft Mode" (delay sending) should be enforced.
  static bool shouldTriggerDraftMode(String text) {
    final scores = analyzeVent(text);
    // If either score is above the 0.85 threshold, trigger Draft Mode
    return (scores['sadness']! > 0.85 || scores['anger']! > 0.85);
  }
}
