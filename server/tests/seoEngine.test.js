import { describe, it, expect } from 'vitest';
import {
  calculateReadingTime,
  extractWords,
  analyzeKeywordDensity,
  analyzeHeadings,
  analyzeReadability,
  computeRuleBasedSeo,
} from '../src/services/seoService.js';

describe('SEO Scoring & Static Analysis Engine', () => {
  it('should accurately calculate reading time based on word count', () => {
    expect(calculateReadingTime(100)).toBe(1);
    expect(calculateReadingTime(450)).toBe(3);
  });

  it('should support both English and Urdu word extraction', () => {
    const englishWords = extractWords('Mastering SEO for small businesses');
    expect(englishWords.length).toBe(5);

    const urduWords = extractWords('چھوٹے کاروبار کے لیے مفید معلومات');
    expect(urduWords.length).toBe(6);
  });

  it('should calculate keyword density and flag optimal frequency (1-2.5%)', () => {
    const filler = 'word '.repeat(98);
    const text = `SEO ${filler} SEO`;
    const result = analyzeKeywordDensity(text, ['SEO']);

    expect(result.breakdown[0].count).toBe(2);
    expect(result.breakdown[0].status).toBe('optimal');
  });

  it('should detect missing keywords and penalize score', () => {
    const text = 'This article talks about generic business advice.';
    const result = analyzeKeywordDensity(text, ['Organic Coffee']);

    expect(result.breakdown[0].status).toBe('missing');
    expect(result.score).toBeLessThan(100);
  });

  it('should audit H1 and H2 heading structure correctly', () => {
    const markdownContent = `
# Ultimate Marketing Guide
Some intro paragraph text here.
## Strategy Overview
Details here.
## Implementation Steps
More details here.
`;
    const result = analyzeHeadings(markdownContent);
    expect(result.headings.length).toBe(3);
    expect(result.headings.filter(h => h.level === 1).length).toBe(1);
    expect(result.headings.filter(h => h.level === 2).length).toBe(2);
    expect(result.score).toBeGreaterThanOrEqual(85);
  });

  it('should calculate overall rule-based SEO score within valid bounds (0-100)', () => {
    const content = `
# How to Grow Your Bakery Business
Bakery marketing is crucial for local sales.
## Best Bakery Strategies
Implement loyalty programs to keep customers coming back to your bakery.
## Conclusion
Start your bakery marketing today.
`;
    const seo = computeRuleBasedSeo(content, ['bakery']);
    expect(seo.overall).toBeGreaterThan(50);
    expect(seo.overall).toBeLessThanOrEqual(100);
    expect(seo.wordCount).toBeGreaterThan(10);
  });
});