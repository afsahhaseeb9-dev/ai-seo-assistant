import Draft from '../models/Draft.js';

let memoryDrafts = [];

export async function getDrafts(req, res) {
  try {
    const drafts = await Draft.find().sort({ createdAt: -1 });
    return res.json({ drafts });
  } catch (err) {
    return res.json({ drafts: memoryDrafts });
  }
}

export async function createDraft(req, res) {
  try {
    const draftData = req.body;
    if (!draftData.title || !draftData.content) {
      return res.status(400).json({ error: 'Title and content are required to save draft.' });
    }

    try {
      const newDraft = await Draft.create(draftData);
      return res.status(201).json({ success: true, draft: newDraft });
    } catch (dbErr) {
      const fallbackDraft = {
        _id: 'draft_' + Date.now(),
        ...draftData,
        createdAt: new Date().toISOString(),
      };
      memoryDrafts.unshift(fallbackDraft);
      return res.status(201).json({ success: true, draft: fallbackDraft });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Failed to save draft.' });
  }
}

export async function updateDraft(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    try {
      const updated = await Draft.findByIdAndUpdate(id, updateData, { new: true });
      if (updated) return res.json({ success: true, draft: updated });
    } catch (e) {
      const index = memoryDrafts.findIndex(d => d._id === id);
      if (index !== -1) {
        memoryDrafts[index] = { ...memoryDrafts[index], ...updateData, updatedAt: new Date().toISOString() };
        return res.json({ success: true, draft: memoryDrafts[index] });
      }
    }
    return res.status(404).json({ error: 'Draft not found.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update draft.' });
  }
}

export async function deleteDraft(req, res) {
  try {
    const { id } = req.params;
    try {
      await Draft.findByIdAndDelete(id);
    } catch (e) {
      memoryDrafts = memoryDrafts.filter(d => d._id !== id);
    }
    return res.json({ success: true, message: 'Draft deleted.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete draft.' });
  }
}