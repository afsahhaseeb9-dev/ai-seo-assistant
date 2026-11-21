/**
 * Rule-Based SEO Scoring and Content Analysis Engine
 */

export function calculateReadingTime(wordCount) {
  const wordsPerMinute = 200;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

export function extractWords(text = '') {
  return text
    .toLowerCase()
    .replace(/[^\w\s\u0600-\u06FF]/gi, ' ') // supports English + Urdu Arabic script
    .split(/\s+/)
    .filter(Boolean);
}

export function analyzeKeywordDensity(text = '', targetKeywords = []) {
  const words = extractWords(text);
  const totalWords = words.length || 1;
  const normalizedText = text.toLowerCase();

  const results = [];
  let aggregateKeywordScore = 100;

  for (const rawKw of targetKeywords) {
    const kw = rawKw.trim().toLowerCase();
    if (!kw) continue;

    // Count occurrences of phrase or single word
    const regex = new RegExp(`\\b${escapeRegExp(kw)}\\b`, 'gi');
    const matches = normalizedText.match(regex) || [];
    const count = matches.length;
    const densityPercent = parseFloat(((count / totalWords) * 100).toFixed(2));

    let status = 'optimal';
    let message = 'Optimal density (1.0% - 2.5%)';

    if (count === 0) {
      status = 'missing';
      message = 'Keyword not found in content';
      aggregateKeywordScore -= 25;
    } else if (densityPercent < 0.8) {
      status = 'low';
      message = 'Under-optimized (less than 0.8%)';
      aggregateKeywordScore -= 10;
    } else if (densityPercent > 3.0) {
      status = 'high';
      message = 'Keyword stuffing warning (over 3.0%)';
      aggregateKeywordScore -= 20;
    }

    results.push({
      keyword: rawKw,
      count,
      densityPercent,
      status,
      message,
    });
  }

  return {
    score: Math.max(20, aggregateKeywordScore),
    breakdown: results,
  };
}

export function analyzeHeadings(text = '', targetKeywords = []) {
  // Matches markdown headings (# H1, ## H2, ### H3) or HTML <h1>, <h2>, <h3>
  const mdHeadingRegex = /^(#{1,3})\s+(.+)$/gm;
  const htmlHeadingRegex = /<h([1-3])>(.*?)<\/h\1>/gi;

  const headings = [];
  let match;

  while ((match = mdHeadingRegex.exec(text)) !== null) {
    headings.push({
      level: match[1].length,
      text: match[2].trim(),
    });
  }

  while ((match = htmlHeadingRegex.exec(text)) !== null) {
    headings.push({
      level: parseInt(match[1], 10),
      text: match[2].trim(),
    });
  }

  let headingScore = 70;
  const insights = [];

  const h1Count = headings.filter(h => h.level === 1).length;
  const h2Count = headings.filter(h => h.level === 2).length;

  if (h1Count === 1) {
    headingScore += 15;
    insights.push('Optimal: Exactly 1 H1 main heading found.');
  } else if (h1Count === 0) {
    headingScore -= 20;
    insights.push('Missing H1 title heading.');
  } else {
    headingScore -= 10;
    insights.push(`Multiple H1 tags (${h1Count}) found. Consider using one primary H1.`);
  }

  if (h2Count >= 2) {
    headingScore += 15;
    insights.push(`Good content structure with ${h2Count} section subheadings (H2).`);
  } else if (h2Count === 0) {
    headingScore -= 15;
    insights.push('Content lacks H2 subheadings for scanability.');
  }

  return {
    score: Math.min(100, Math.max(20, headingScore)),
    headings,
    insights,
  };
}

export function analyzeReadability(text = '') {
  const words = extractWords(text);
  const wordCount = words.length;
  if (wordCount < 20) {
    return {
      score: 50,
      readingEase: 'Too short to measure',
      insights: ['Add more content to calculate readability.'],
    };
  }

  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceCount = sentences.length || 1;
  const avgWordsPerSentence = wordCount / sentenceCount;

  let score = 85;
  const insights = [];

  if (avgWordsPerSentence > 22) {
    score -= 20;
    insights.push('Sentences are quite long on average. Break them into shorter sentences.');
  } else if (avgWordsPerSentence >= 12 && avgWordsPerSentence <= 18) {
    score += 15;
    insights.push('Excellent sentence length variety for easy online reading.');
  }

  return {
    score: Math.min(100, Math.max(30, score)),
    avgWordsPerSentence: parseFloat(avgWordsPerSentence.toFixed(1)),
    sentenceCount,
    insights,
  };
}

export function computeRuleBasedSeo(text = '', targetKeywords = []) {
  const words = extractWords(text);
  const wordCount = words.length;
  const kwAnalysis = analyzeKeywordDensity(text, targetKeywords);
  const headingAnalysis = analyzeHeadings(text, targetKeywords);
  const readabilityAnalysis = analyzeReadability(text);

  // Weighted overall rule-based score (out of 100)
  const weightedOverall = Math.round(
    kwAnalysis.score * 0.4 +
    headingAnalysis.score * 0.35 +
    readabilityAnalysis.score * 0.25
  );

  return {
    overall: weightedOverall,
    wordCount,
    readingTimeMinutes: calculateReadingTime(wordCount),
    keywordDensity: kwAnalysis,
    headings: headingAnalysis,
    readability: readabilityAnalysis,
  };
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}