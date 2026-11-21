import mongoose from 'mongoose';

const draftSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    template: {
      type: String,
      enum: ['blog', 'product', 'social'],
      required: true,
    },
    language: {
      type: String,
      enum: ['en', 'ur'],
      default: 'en',
    },
    topic: { type: String, required: true },
    keywords: [{ type: String }],
    tone: { type: String, default: 'Professional' },
    length: { type: String, default: 'medium' },
    brandVoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BrandVoice',
      default: null,
    },
    content: { type: String, required: true },
    seoScore: {
      overall: { type: Number, default: 0 },
      keywordDensityScore: { type: Number, default: 0 },
      headingScore: { type: Number, default: 0 },
      readabilityScore: { type: Number, default: 0 },
      insights: [{ type: String }],
    },
    stats: {
      wordCount: { type: Number, default: 0 },
      readingTimeMinutes: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Draft || mongoose.model('Draft', draftSchema);