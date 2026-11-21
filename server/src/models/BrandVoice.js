import mongoose from 'mongoose';

const brandVoiceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    industry: { type: String, default: 'General' },
    targetAudience: { type: String, default: 'General Public' },
    toneKeywords: [{ type: String }],
    sampleGuidelines: { type: String, default: '' },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.BrandVoice || mongoose.model('BrandVoice', brandVoiceSchema);