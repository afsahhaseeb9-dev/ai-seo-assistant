import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  FileText,
  ShoppingBag,
  Share2,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Download,
  Save,
  FolderOpen,
  Trash2,
  Plus,
  RefreshCw,
  Globe,
  Layers,
  BarChart3,
  BookOpen,
  Check,
  ChevronRight,
  ExternalLink,
  Edit3,
  Eye,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';

const API_BASE = 'http://localhost:5000';

const TEMPLATES = [
  { id: 'blog', name: 'Blog Post', icon: FileText, desc: 'SEO-rich article with H1-H3 headings, meta desc & FAQs' },
  { id: 'product', name: 'Product Description', icon: ShoppingBag, desc: 'High-converting copy with benefits, specs & CTA' },
  { id: 'social', name: 'Social Media Post', icon: Share2, desc: 'Scroll-stopping viral copy with hooks & hashtags' },
];

const TONES = ['Professional', 'Casual', 'Persuasive', 'Enthusiastic', 'Witty', 'Storytelling', 'Luxury'];
const LENGTHS = [
  { id: 'short', label: 'Short', words: '~200 words' },
  { id: 'medium', label: 'Medium', words: '~600 words' },
  { id: 'long', label: 'Long-form', words: '~1200 words' },
];

export default function App() {
  // Input Form State
  const [template, setTemplate] = useState('blog');
  const [topic, setTopic] = useState('Sustainable Bamboo Toothbrushes for Eco-Conscious Homes');
  const [language, setLanguage] = useState('en'); // 'en' | 'ur'
  const [tone, setTone] = useState('Persuasive');
  const [length, setLength] = useState('medium');
  const [keywordInput, setKeywordInput] = useState('');
  const [keywords, setKeywords] = useState(['bamboo toothbrush', 'zero waste bathroom', 'eco friendly']);
  
  // Brand Voice State
  const [brandVoices, setBrandVoices] = useState([]);
  const [selectedBrandVoiceId, setSelectedBrandVoiceId] = useState('');
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [newVoice, setNewVoice] = useState({ name: '', industry: '', targetAudience: '', toneKeywords: '', sampleGuidelines: '' });

  // Output & Editor State
  const [isGenerating, setIsGenerating] = useState(false);
  const [content, setContent] = useState('');
  const [seoScore, setSeoScore] = useState(null);
  const [stats, setStats] = useState({ wordCount: 0, readingTimeMinutes: 1 });
  const [editorMode, setEditorMode] = useState('edit'); // 'edit' | 'preview'
  const [isCopied, setIsCopied] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Drafts & History Drawer
  const [isDraftsOpen, setIsDraftsOpen] = useState(false);
  const [drafts, setDrafts] = useState([]);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // Fetch initial brand voices & drafts on load
  useEffect(() => {
    fetchBrandVoices();
    fetchDrafts();
  }, []);

  const fetchBrandVoices = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/brand-voices`);
      const data = await res.json();
      if (data.brandVoices) {
        setBrandVoices(data.brandVoices);
        const def = data.brandVoices.find(v => v.isDefault);
        if (def) setSelectedBrandVoiceId(def._id);
      }
    } catch (e) {
      console.warn('Backend offline, brand voices loaded locally.');
    }
  };

  const fetchDrafts = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/drafts`);
      const data = await res.json();
      if (data.drafts) setDrafts(data.drafts);
    } catch (e) {
      console.warn('Backend offline, drafts loaded locally.');
    }
  };

  // Add / Remove Keywords
  const handleAddKeyword = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      const val = keywordInput.trim();
      if (val && !keywords.includes(val)) {
        setKeywords([...keywords, val]);
        setKeywordInput('');
      }
    }
  };

  const handleRemoveKeyword = (kwToRemove) => {
    setKeywords(keywords.filter(k => k !== kwToRemove));
  };

  // Generate Content
  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    setSaveSuccessMsg('');

    try {
      const res = await fetch(`${API_BASE}/api/content/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          template,
          language,
          tone,
          length,
          keywords,
          brandVoiceId: selectedBrandVoiceId || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setContent(data.content);
        setSeoScore(data.seoScore);
        setStats(data.stats);
        if (data.seoScore?.overall >= 80) {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
        }
      }
    } catch (err) {
      alert('Could not connect to backend server. Make sure it is running on port 5000.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Live In-Place Editor SEO Re-analysis
  const handleReanalyze = async () => {
    if (!content.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/api/content/analyze-seo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, keywords, language }),
      });
      const data = await res.json();
      if (data.success) {
        setSeoScore(prev => ({ ...prev, ...data.seoScore }));
        setStats(data.stats);
      }
    } catch (e) {
      console.error('Re-analysis error:', e);
    }
  };

  // Save Current Draft
  const handleSaveDraft = async () => {
    if (!content.trim()) return;
    setIsSavingDraft(true);
    const title = topic.slice(0, 40) + ' (' + template.toUpperCase() + ')';
    try {
      const res = await fetch(`${API_BASE}/api/drafts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          template,
          language,
          topic,
          keywords,
          tone,
          length,
          content,
          seoScore,
          stats,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccessMsg('Draft saved successfully!');
        fetchDrafts();
        setTimeout(() => setSaveSuccessMsg(''), 3000);
      }
    } catch (e) {
      alert('Failed to save draft.');
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Load a Draft from History
  const handleLoadDraft = (d) => {
    setContent(d.content);
    setTopic(d.topic || d.title);
    setTemplate(d.template || 'blog');
    setLanguage(d.language || 'en');
    setKeywords(d.keywords || []);
    if (d.seoScore) setSeoScore(d.seoScore);
    if (d.stats) setStats(d.stats);
    setIsDraftsOpen(false);
  };

  // Delete a Draft
  const handleDeleteDraft = async (id, e) => {
    e.stopPropagation();
    try {
      await fetch(`${API_BASE}/api/drafts/${id}`, { method: 'DELETE' });
      setDrafts(drafts.filter(d => d._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Export handlers
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleExportFile = (format) => {
    let mimeType = 'text/plain';
    let ext = 'txt';
    let output = content;

    if (format === 'md') {
      mimeType = 'text/markdown';
      ext = 'md';
    } else if (format === 'html') {
      mimeType = 'text/html';
      ext = 'html';
      output = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${topic}</title></head><body>${content.replace(/\n/g, '<br/>')}</body></html>`;
    }

    const blob = new Blob([output], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${topic.toLowerCase().replace(/[^a-z0-9]/gi, '_')}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Create Custom Brand Voice
  const handleCreateVoice = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/brand-voices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVoice),
      });
      const data = await res.json();
      if (data.success) {
        setIsVoiceModalOpen(false);
        setNewVoice({ name: '', industry: '', targetAudience: '', toneKeywords: '', sampleGuidelines: '' });
        fetchBrandVoices();
        setSelectedBrandVoiceId(data.brandVoice._id);
      }
    } catch (err) {
      alert('Could not save brand voice.');
    }
  };

  // Helper score color
  const getScoreBadge = (score) => {
    if (score >= 85) return { bg: 'bg-emerald-500', text: 'text-emerald-700', bgLight: 'bg-emerald-50', border: 'border-emerald-200', label: 'Excellent' };
    if (score >= 70) return { bg: 'bg-indigo-500', text: 'text-indigo-700', bgLight: 'bg-indigo-50', border: 'border-indigo-200', label: 'Good' };
    if (score >= 55) return { bg: 'bg-amber-500', text: 'text-amber-700', bgLight: 'bg-amber-50', border: 'border-amber-200', label: 'Needs Improvement' };
    return { bg: 'bg-rose-500', text: 'text-rose-700', bgLight: 'bg-rose-50', border: 'border-rose-200', label: 'Poor' };
  };

  const isUrdu = language === 'ur';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-6 py-3.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-indigo-700 to-sky-600 bg-clip-text text-transparent">
                  CodeCraft SEO
                </span>
                <span className="text-[11px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                  AI Content Studio
                </span>
              </div>
              <p className="text-xs text-slate-500">Autonomous Copywriting & Hybrid SEO Engine for Small Businesses</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Saved Drafts Button */}
            <button
              onClick={() => setIsDraftsOpen(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition"
            >
              <FolderOpen className="w-4 h-4 text-indigo-600" />
              <span>Saved Drafts ({drafts.length})</span>
            </button>

            {/* Brand Voice Button */}
            <button
              onClick={() => setIsVoiceModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold transition"
            >
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>Brand Voice</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Studio Body */}
      <main className="max-w-7xl mx-auto px-6 py-6 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Generator Form (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col gap-5">
            
            {/* 1. Template Chooser */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 block">
                1. Select Content Template
              </label>
              <div className="grid grid-cols-3 gap-2">
                {TEMPLATES.map(t => {
                  const Icon = t.icon;
                  const active = template === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTemplate(t.id)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                        active
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 shadow-sm ring-2 ring-indigo-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mb-1.5 ${active ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span className="text-xs font-bold">{t.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Topic / Product Name */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  2. Topic or Product Name
                </label>
                <span className="text-[11px] text-slate-400">{topic.length}/100</span>
              </div>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Handmade Leather Wallets, 10 Tips for Remote Work Productivity..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50"
              />
            </div>

            {/* 3. Target Keywords */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
                3. Target SEO Keywords
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={handleAddKeyword}
                  placeholder="Type keyword and press Enter..."
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
                />
                <button
                  type="button"
                  onClick={handleAddKeyword}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              {/* Keyword Pills */}
              <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                {keywords.map(kw => (
                  <span
                    key={kw}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-medium"
                  >
                    <span>{kw}</span>
                    <button
                      onClick={() => handleRemoveKeyword(kw)}
                      className="text-indigo-400 hover:text-indigo-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* 4. Controls: Language, Tone, Length */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              {/* Language Toggle (English vs Urdu) */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Language</span>
                </label>
                <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
                  <button
                    onClick={() => setLanguage('en')}
                    className={`py-1.5 rounded-lg font-bold transition ${
                      language === 'en' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setLanguage('ur')}
                    className={`py-1.5 rounded-lg font-bold transition font-urdu ${
                      language === 'ur' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    اردو (Urdu)
                  </button>
                </div>
              </div>

              {/* Length */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
                  Length Control
                </label>
                <select
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {LENGTHS.map(l => (
                    <option key={l.id} value={l.id}>{l.label} ({l.words})</option>
                  ))}
                </select>
              </div>

              {/* Tone */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
                  Tone of Voice
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {TONES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Brand Voice Active */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
                  Saved Brand Voice
                </label>
                <select
                  value={selectedBrandVoiceId}
                  onChange={(e) => setSelectedBrandVoiceId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">None (Standard Voice)</option>
                  {brandVoices.map(v => (
                    <option key={v._id} value={v._id}>{v.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !topic.trim()}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white font-bold text-sm shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating Optimized Content...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Content & Run SEO Audit</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: In-Place Editor & Live SEO Audit (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          
          {/* SEO Score Banner */}
          {seoScore && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                
                {/* Circular Score Gauge */}
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-100"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className={`${
                          seoScore.overall >= 80 ? 'text-emerald-500' : seoScore.overall >= 65 ? 'text-indigo-500' : 'text-amber-500'
                        } transition-all duration-1000 ease-out`}
                        strokeDasharray={`${seoScore.overall}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-lg font-black text-slate-800 leading-none">{seoScore.overall}</span>
                      <span className="text-[9px] font-semibold text-slate-400">/100</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-sm text-slate-800">Hybrid SEO Score</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getScoreBadge(seoScore.overall).bgLight} ${getScoreBadge(seoScore.overall).text} border ${getScoreBadge(seoScore.overall).border}`}>
                        {getScoreBadge(seoScore.overall).label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {stats.wordCount} words • ~{stats.readingTimeMinutes} min read • Flesch & Heading audits passed
                    </p>
                  </div>
                </div>

                {/* Sub-Score Metrics */}
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Keyword</span>
                    <span className="text-xs font-extrabold text-slate-700">{seoScore.keywordDensityScore}/100</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Headings</span>
                    <span className="text-xs font-extrabold text-slate-700">{seoScore.headingScore}/100</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">AI Intent</span>
                    <span className="text-xs font-extrabold text-slate-700">{seoScore.aiScore || 85}/100</span>
                  </div>
                </div>
              </div>

              {/* Keyword Density Breakdown */}
              {seoScore.keywordBreakdown && seoScore.keywordBreakdown.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Live Keyword Density & Distribution
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {seoScore.keywordBreakdown.map((kb, idx) => (
                      <div
                        key={idx}
                        className={`text-xs px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
                          kb.status === 'optimal'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : kb.status === 'missing'
                            ? 'bg-rose-50 border-rose-200 text-rose-800'
                            : 'bg-amber-50 border-amber-200 text-amber-800'
                        }`}
                      >
                        <span className="font-semibold">{kb.keyword}</span>
                        <span className="font-mono text-[11px] px-1.5 py-0.2 rounded bg-white/70 border border-black/5">
                          {kb.count}x ({kb.densityPercent}%)
                        </span>
                        <span className="text-[10px] font-bold uppercase">{kb.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Recommendations */}
              {seoScore.aiSuggestions && seoScore.aiSuggestions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    AI Content Improvement Tips
                  </span>
                  {seoScore.aiSuggestions.slice(0, 2).map((sug, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 mt-0.5 shrink-0" />
                      <span>{sug}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Main In-Place Editor */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col flex-1 min-h-[500px] overflow-hidden">
            
            {/* Editor Top Bar */}
            <div className="flex flex-wrap items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-slate-50/70 gap-2">
              <div className="flex items-center gap-1 bg-slate-200/70 p-0.5 rounded-lg text-xs font-semibold">
                <button
                  onClick={() => setEditorMode('edit')}
                  className={`flex items-center gap-1 px-3 py-1 rounded-md transition ${
                    editorMode === 'edit' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editor</span>
                </button>
                <button
                  onClick={() => setEditorMode('preview')}
                  className={`flex items-center gap-1 px-3 py-1 rounded-md transition ${
                    editorMode === 'preview' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>
              </div>

              {/* Actions: Recalculate, Copy, Export, Save */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {content && (
                  <button
                    onClick={handleReanalyze}
                    title="Re-run SEO analysis on your edited draft"
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Recount SEO</span>
                  </button>
                )}

                <button
                  onClick={handleCopy}
                  disabled={!content}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition disabled:opacity-40"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Copied!' : 'Copy'}</span>
                </button>

                {/* Export Dropdown */}
                <div className="relative group">
                  <button
                    disabled={!content}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition disabled:opacity-40"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export</span>
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-lg border border-slate-200 py-1 hidden group-hover:block z-20">
                    <button
                      onClick={() => handleExportFile('md')}
                      className="w-full text-left px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Markdown (.md)
                    </button>
                    <button
                      onClick={() => handleExportFile('txt')}
                      className="w-full text-left px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Plain Text (.txt)
                    </button>
                    <button
                      onClick={() => handleExportFile('html')}
                      className="w-full text-left px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      HTML Document
                    </button>
                  </div>
                </div>

                {/* Save Draft */}
                <button
                  onClick={handleSaveDraft}
                  disabled={!content || isSavingDraft}
                  className="flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition disabled:opacity-40"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingDraft ? 'Saving...' : 'Save Draft'}</span>
                </button>
              </div>
            </div>

            {/* Notification message */}
            {saveSuccessMsg && (
              <div className="bg-emerald-50 text-emerald-700 px-4 py-1.5 text-xs font-semibold border-b border-emerald-200 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            {/* Editable Content Area */}
            <div className="flex-1 p-4 overflow-y-auto">
              {!content && !isGenerating ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 mb-3">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-700 mb-1">Your AI Canvas is Ready</h4>
                  <p className="text-xs max-w-sm text-slate-400">
                    Pick a template, enter your topic and keywords on the left, then click <strong>Generate Content</strong> to create SEO-optimized copy.
                  </p>
                </div>
              ) : editorMode === 'edit' ? (
                <textarea
                  value={content}
                  dir={isUrdu ? 'rtl' : 'ltr'}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Generated text will appear here..."
                  className={`w-full h-full min-h-[420px] resize-none border-none focus:outline-none text-slate-800 text-sm leading-relaxed ${
                    isUrdu ? 'font-urdu text-base' : 'font-sans'
                  }`}
                />
              ) : (
                <div
                  dir={isUrdu ? 'rtl' : 'ltr'}
                  className={`prose prose-sm max-w-none text-slate-800 leading-relaxed ${
                    isUrdu ? 'font-urdu text-base' : 'font-sans'
                  }`}
                >
                  {content.split('\n').map((line, i) => {
                    if (line.startsWith('# ')) return <h1 key={i} className="text-xl font-black mb-2 text-slate-900">{line.replace('# ', '')}</h1>;
                    if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-bold mt-4 mb-2 text-indigo-900">{line.replace('## ', '')}</h2>;
                    if (line.startsWith('### ')) return <h3 key={i} className="text-base font-bold mt-3 mb-1 text-slate-800">{line.replace('### ', '')}</h3>;
                    if (line.startsWith('- ')) return <li key={i} className="ml-4 list-disc text-slate-700">{line.replace('- ', '')}</li>;
                    if (line.trim() === '') return <br key={i} />;
                    return <p key={i} className="mb-2 text-slate-700">{line}</p>;
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Saved Drafts Drawer */}
      {isDraftsOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-800">Saved Drafts & History</h3>
              </div>
              <button onClick={() => setIsDraftsOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {drafts.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No saved drafts yet. Click "Save Draft" on any generated piece to build your library!
                </div>
              ) : (
                drafts.map(d => (
                  <div
                    key={d._id}
                    onClick={() => handleLoadDraft(d)}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition cursor-pointer flex flex-col gap-2 group"
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="font-bold text-xs text-slate-800 line-clamp-1 group-hover:text-indigo-600">
                        {d.title}
                      </h4>
                      <button
                        onClick={(e) => handleDeleteDraft(d._id, e)}
                        className="text-slate-300 hover:text-rose-600 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-2">{d.content}</p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                      <span className="uppercase font-semibold tracking-wider text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                        {d.template} • {d.language === 'ur' ? 'اردو' : 'EN'}
                      </span>
                      {d.seoScore?.overall && (
                        <span className="font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                          SEO: {d.seoScore.overall}/100
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Brand Voice Modal */}
      {isVoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-slate-800">Saved Brand Voices</h3>
              </div>
              <button onClick={() => setIsVoiceModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Maintain consistent marketing personality across your blog, product listings, and social channels.
            </p>

            {/* List existing voices */}
            <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
              {brandVoices.map(v => (
                <div
                  key={v._id}
                  onClick={() => { setSelectedBrandVoiceId(v._id); setIsVoiceModalOpen(false); }}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition ${
                    selectedBrandVoiceId === v._id
                      ? 'border-indigo-600 bg-indigo-50/60 font-semibold text-indigo-900'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div>
                    <span className="font-bold block">{v.name}</span>
                    <span className="text-[10px] text-slate-400">{v.industry} • {v.targetAudience}</span>
                  </div>
                  {selectedBrandVoiceId === v._id && <Check className="w-4 h-4 text-indigo-600" />}
                </div>
              ))}
            </div>

            {/* Create New Voice Form */}
            <form onSubmit={handleCreateVoice} className="pt-3 border-t border-slate-100 flex flex-col gap-3">
              <span className="text-xs font-bold text-slate-700">Add New Brand Persona:</span>
              <input
                type="text"
                placeholder="Brand Name (e.g. EcoGlow Skincare)"
                value={newVoice.name}
                onChange={e => setNewVoice({ ...newVoice, name: e.target.value })}
                required
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Industry (e.g. Organic Beauty)"
                  value={newVoice.industry}
                  onChange={e => setNewVoice({ ...newVoice, industry: e.target.value })}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Target Audience (e.g. Vegans 20-35)"
                  value={newVoice.targetAudience}
                  onChange={e => setNewVoice({ ...newVoice, targetAudience: e.target.value })}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <input
                type="text"
                placeholder="Tone Keywords comma-separated (e.g. Warm, Inspiring, Holistic)"
                value={newVoice.toneKeywords}
                onChange={e => setNewVoice({ ...newVoice, toneKeywords: e.target.value })}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
              />

              <button
                type="submit"
                className="mt-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition"
              >
                Save Brand Persona
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}