import BrandVoice from '../models/BrandVoice.js';

let memoryBrandVoices = [
  {
    _id: 'bv_1',
    name: 'Modern Eco Startup',
    industry: 'Sustainability / Tech',
    targetAudience: 'Gen-Z and Eco-Conscious Millennials',
    toneKeywords: ['Friendly', 'Transparent', 'Inspiring', 'Crisp'],
    sampleGuidelines: 'Avoid corporate jargon. Emphasize planetary impact and community collaboration.',
    isDefault: true,
  },
  {
    _id: 'bv_2',
    name: 'Authoritative B2B SaaS',
    industry: 'Enterprise Software',
    targetAudience: 'CTOs, Engineering Managers, Founders',
    toneKeywords: ['Professional', 'Data-driven', 'Concise', 'Authoritative'],
    sampleGuidelines: 'Lead with metrics, ROI, and security. Keep sentences direct and actionable.',
    isDefault: false,
  },
  {
    _id: 'bv_3',
    name: 'Urdu Lifestyle & Boutique',
    industry: 'Fashion & Handcrafted Goods',
    targetAudience: 'South Asian Families & Online Shoppers',
    toneKeywords: ['Warm', 'Elegant', 'Hospitable', 'Persuasive'],
    sampleGuidelines: 'Use respectful, engaging Urdu expressions emphasizing high craftsmanship.',
    isDefault: false,
  },
];

export function getMemoryBrandVoices() {
  return memoryBrandVoices;
}

export async function getBrandVoices(req, res) {
  try {
    const voices = await BrandVoice.find().sort({ createdAt: -1 });
    if (voices && voices.length > 0) {
      return res.json({ brandVoices: voices });
    }
    return res.json({ brandVoices: memoryBrandVoices });
  } catch (err) {
    return res.json({ brandVoices: memoryBrandVoices });
  }
}

export async function createBrandVoice(req, res) {
  try {
    const { name, industry, targetAudience, toneKeywords, sampleGuidelines } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Brand voice name is required.' });
    }

    const payload = {
      name: name.trim(),
      industry: industry || 'General',
      targetAudience: targetAudience || 'General Public',
      toneKeywords: Array.isArray(toneKeywords) ? toneKeywords : (toneKeywords || '').split(',').map(s => s.trim()),
      sampleGuidelines: sampleGuidelines || '',
    };

    try {
      const created = await BrandVoice.create(payload);
      return res.status(201).json({ success: true, brandVoice: created });
    } catch (e) {
      const fallbackVoice = {
        _id: 'bv_' + Date.now(),
        ...payload,
        createdAt: new Date().toISOString(),
      };
      memoryBrandVoices.unshift(fallbackVoice);
      return res.status(201).json({ success: true, brandVoice: fallbackVoice });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create brand voice.' });
  }
}

export async function deleteBrandVoice(req, res) {
  try {
    const { id } = req.params;
    try {
      await BrandVoice.findByIdAndDelete(id);
    } catch (e) {
      memoryBrandVoices = memoryBrandVoices.filter(v => v._id !== id);
    }
    return res.json({ success: true, message: 'Brand voice removed.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete brand voice.' });
  }
}