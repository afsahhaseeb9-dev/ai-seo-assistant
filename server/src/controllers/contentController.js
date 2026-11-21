import { generateContentWithGemini, getModelBasedSeoReview } from '../services/geminiService.js';
import { computeRuleBasedSeo } from '../services/seoService.js';
import BrandVoice from '../models/BrandVoice.js';
import { getMemoryBrandVoices } from './brandVoiceController.js';

export async function generateContent(req, res) {
  try {
    const {
      topic,
      template = 'blog',
      language = 'en',
      tone = 'Professional',
      length = 'medium',
      keywords = [],
      brandVoiceId = null,
    } = req.body;

    if (!topic || !topic.trim()) {
      return res.status(400).json({ error: 'Topic is required.' });
    }

    // Resolve Brand Voice if provided
    let brandVoice = null;
    if (brandVoiceId) {
      try {
        brandVoice = await BrandVoice.findById(brandVoiceId);
      } catch (e) {
        brandVoice = getMemoryBrandVoices().find(b => b._id.toString() === brandVoiceId);
      }
    }

    // 1. Generate text using Gemini
    const content = await generateContentWithGemini({
      topic: topic.trim(),
      template,
      language,
      tone,
      length,
      keywords,
      brandVoice,
    });

    // 2. Deterministic Rule-Based SEO Audit
    const ruleBased = computeRuleBasedSeo(content, keywords);

    // 3. Model-Based AI SEO Evaluation
    const modelBased = await getModelBasedSeoReview({
      content,
      keywords,
      language,
    });

    // 4. Combine: 65% Rule-Based (exact metric density/headings) + 35% AI Quality
    const finalOverallScore = Math.round(ruleBased.overall * 0.65 + modelBased.aiScore * 0.35);

    const seoScore = {
      overall: finalOverallScore,
      ruleScore: ruleBased.overall,
      aiScore: modelBased.aiScore,
      keywordDensityScore: ruleBased.keywordDensity.score,
      headingScore: ruleBased.headings.score,
      readabilityScore: ruleBased.readability.score,
      keywordBreakdown: ruleBased.keywordDensity.breakdown,
      headingInsights: ruleBased.headings.insights,
      readabilityInsights: ruleBased.readability.insights,
      aiSuggestions: modelBased.suggestions,
    };

    return res.json({
      success: true,
      content,
      topic,
      template,
      language,
      tone,
      keywords,
      seoScore,
      stats: {
        wordCount: ruleBased.wordCount,
        readingTimeMinutes: ruleBased.readingTimeMinutes,
      },
    });
  } catch (error) {
    console.error('Error in generateContent:', error);
    return res.status(500).json({ error: 'Failed to generate content.' });
  }
}

/**
 * Live SEO re-analysis for in-place editing in the frontend
 */
export async function reanalyzeSeo(req, res) {
  try {
    const { content = '', keywords = [], language = 'en' } = req.body;
    const ruleBased = computeRuleBasedSeo(content, keywords);

    return res.json({
      success: true,
      seoScore: {
        overall: ruleBased.overall,
        keywordDensityScore: ruleBased.keywordDensity.score,
        headingScore: ruleBased.headings.score,
        readabilityScore: ruleBased.readability.score,
        keywordBreakdown: ruleBased.keywordDensity.breakdown,
        headingInsights: ruleBased.headings.insights,
        readabilityInsights: ruleBased.readability.insights,
      },
      stats: {
        wordCount: ruleBased.wordCount,
        readingTimeMinutes: ruleBased.readingTimeMinutes,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to reanalyze SEO.' });
  }
}