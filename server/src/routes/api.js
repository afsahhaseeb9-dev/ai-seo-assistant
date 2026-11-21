import express from 'express';
import { generateContent, reanalyzeSeo } from '../controllers/contentController.js';
import {
  getDrafts,
  createDraft,
  updateDraft,
  deleteDraft,
} from '../controllers/draftController.js';
import {
  getBrandVoices,
  createBrandVoice,
  deleteBrandVoice,
} from '../controllers/brandVoiceController.js';

const router = express.Router();

// Content Generation & Live SEO Analysis
router.post('/content/generate', generateContent);
router.post('/content/analyze-seo', reanalyzeSeo);

// Drafts Management (Save, Edit, History)
router.get('/drafts', getDrafts);
router.post('/drafts', createDraft);
router.put('/drafts/:id', updateDraft);
router.delete('/drafts/:id', deleteDraft);

// Saved Brand Voices
router.get('/brand-voices', getBrandVoices);
router.post('/brand-voices', createBrandVoice);
router.delete('/brand-voices/:id', deleteBrandVoice);

export default router;