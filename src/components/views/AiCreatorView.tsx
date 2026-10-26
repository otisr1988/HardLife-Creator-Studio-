import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Cpu,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCw,
  Sliders,
  DollarSign,
  HelpCircle,
  Film,
  Volume2,
  Send,
  Scissors,
  Plus,
  Folder,
  Tag,
  Clock,
  Radio,
  FileText,
  Share2,
  Wand2,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronUp,
  X,
  ExternalLink,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { estimateAiVideoCost } from '../../lib/cost-calculator';
import type { VideoProject, CustomCategory, ConnectedAccount } from '../../types';

interface AiCreatorViewProps {
  initialData?: {
    topic?: string;
    category?: string;
    duration?: number;
    format?: 'shorts_9_16' | 'tiktok_9_16' | 'youtube_16_9';
    instructions?: string;
    targetChannels?: string[];
  } | null;
  customCategories?: CustomCategory[];
  connectedAccounts?: ConnectedAccount[];
  onProjectCreated: (project: VideoProject) => void;
  onCategoriesUpdated?: () => void;
  onOpenEditor: (projectId: string) => void;
}

export const AiCreatorView: React.FC<AiCreatorViewProps> = ({
  initialData,
  customCategories = [],
  connectedAccounts = [],
  onProjectCreated,
  onCategoriesUpdated,
  onOpenEditor,
}) => {
  // 1. Content & Topic State
  const [selectedCategory, setSelectedCategory] = useState<string>('custom');
  const [topic, setTopic] = useState('How 10,000 HP Towboats Maneuver 50,000 Tons Through Lock Chambers');
  const [instructions, setInstructions] = useState('');
  
  // 2. Creative Controls State
  const [format, setFormat] = useState<'shorts_9_16' | 'tiktok_9_16' | 'youtube_16_9'>('shorts_9_16');
  const [duration, setDuration] = useState<number>(52);
  const [customDurationInput, setCustomDurationInput] = useState<string>('52');
  const [isCustomDuration, setIsCustomDuration] = useState(false);
  const [visualStyle, setVisualStyle] = useState('authentic_footage');
  const [voiceId, setVoiceId] = useState('studio_pilot');
  const [musicStyle, setMusicStyle] = useState('industrial_hum');
  const [editingIntensity, setEditingIntensity] = useState<'fast' | 'balanced' | 'documentary'>('balanced');
  const [captionStyle, setCaptionStyle] = useState<'bold_punchy' | 'clean_minimal' | 'karaoke_highlight' | 'subtle_bottom'>('bold_punchy');

  // 3. Publishing Channel & CTA Separation
  const [targetChannelMode, setTargetChannelMode] = useState<'both' | 'youtube' | 'tiktok' | 'export_only'>('both');
  const [includeEngagementCta, setIncludeEngagementCta] = useState(false);
  const [customCtaText, setCustomCtaText] = useState('Like, comment, and subscribe for more on @towboater2011!');

  // 4. Topic Classification Intelligence
  const [classification, setClassification] = useState<any | null>(null);
  const [analyzingTopic, setAnalyzingTopic] = useState(false);

  // 5. Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CustomCategory | null>(null);
  const [catFormName, setCatFormName] = useState('');
  const [catFormDesc, setCatFormDesc] = useState('');
  const [catFormVoice, setCatFormVoice] = useState('studio_creator');
  const [catFormDuration, setCatFormDuration] = useState(60);
  const [catFormHashtags, setCatFormHashtags] = useState('engineering, technology');
  const [catFormCta, setCatFormCta] = useState('');
  const [savedCategoriesOpen, setSavedCategoriesOpen] = useState(false);

  // 6. Pipeline Execution State
  const [generating, setGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [generatedResult, setGeneratedResult] = useState<any | null>(null);
  const [renderingMp4, setRenderingMp4] = useState(false);
  const [renderedUrl, setRenderedUrl] = useState<string | null>(null);

  // Preset categories
  const PRESET_CATEGORIES = [
    { id: 'custom', label: 'Anything / Custom Topic', sub: 'Universal creator for any subject', icon: '🌟' },
    { id: 'towboats', label: 'Towboats & River', sub: 'Verified Mississippi nautical ops', icon: '🚢' },
    { id: 'gaming', label: 'GTA & Gaming', sub: 'Physics breakdown & simulation label', icon: '🎮' },
    { id: 'tarot', label: 'Tarot Readings', sub: 'Astrology & intuitive guidance', icon: '🔮' },
    { id: 'facts', label: 'Viral Facts', sub: 'Fascinating curiosities & mysteries', icon: '⚡' },
  ];

  // Reusable Instruction Presets
  const INSTRUCTION_TEMPLATES = [
    {
      title: '5 Shorts from 1 Topic',
      text: 'Structure this into a 5-part high-hook micro-series. Emphasize punchy 3-second opening curiosity gaps and high retention.',
      dur: 30,
    },
    {
      title: '10-Min Deep Documentary',
      text: 'Create a deep, comprehensive investigative documentary. Include historical context, engineering schematics, and chronological narrative.',
      dur: 600,
    },
    {
      title: 'Quick 30s Viral Hook',
      text: 'Focus intensely on immediate pattern interruption in the first 3 seconds followed by rapid-fire facts.',
      dur: 30,
    },
    {
      title: 'Step-by-Step Practical Tutorial',
      text: 'Produce a clear instructional walkthrough. Specify exact tools, safety warnings, and numbered steps with macro visuals.',
      dur: 55,
    },
    {
      title: 'Comedy Sketch & Punchline',
      text: 'Frame this as an exaggerated, relatable sketch. Use quick pacing, awkward pauses, and a memorable concluding punchline.',
      dur: 30,
    },
  ];

  // Apply initial data if passed from ContentIdeasView
  useEffect(() => {
    if (initialData) {
      if (initialData.topic) setTopic(initialData.topic);
      if (initialData.category) setSelectedCategory(initialData.category);
      if (initialData.duration) {
        setDuration(initialData.duration);
        setCustomDurationInput(String(initialData.duration));
      }
      if (initialData.format) setFormat(initialData.format);
      if (initialData.instructions) setInstructions(initialData.instructions);
      if (initialData.targetChannels && initialData.targetChannels.length > 0) {
        if (initialData.targetChannels.includes('@towboater2011') && initialData.targetChannels.includes('@otis0239')) {
          setTargetChannelMode('both');
        } else if (initialData.targetChannels.includes('@towboater2011')) {
          setTargetChannelMode('youtube');
        } else if (initialData.targetChannels.includes('@otis0239')) {
          setTargetChannelMode('tiktok');
        }
      }
      // Automatically classify the incoming topic
      analyzeTopic(initialData.topic || '');
    }
  }, [initialData]);

  // Topic classification trigger
  const analyzeTopic = async (textToAnalyze: string) => {
    if (!textToAnalyze.trim()) return;
    setAnalyzingTopic(true);
    try {
      const res = await fetch('/api/ai/classify-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToAnalyze }),
      });
      const data = await res.json();
      setClassification(data);
      if (data.recommendedVoice) setVoiceId(data.recommendedVoice);
      if (data.suggestedCta) setCustomCtaText(data.suggestedCta);
    } catch (e) {
      console.warn('Topic analysis failed:', e);
    } finally {
      setAnalyzingTopic(false);
    }
  };

  const handleSelectPreset = (catId: string) => {
    setSelectedCategory(catId);
    if (catId === 'towboats') {
      setTopic('How 10,000 HP Towboats Maneuver 50,000 Tons Through Lock Chambers');
      setFormat('shorts_9_16');
      setDuration(52);
      setCustomDurationInput('52');
      setVoiceId('studio_pilot');
      setTargetChannelMode('youtube');
      analyzeTopic('How 10,000 HP Towboats Maneuver 50,000 Tons Through Lock Chambers');
    } else if (catId === 'gaming') {
      setTopic('GTA 6 Water Physics & Vehicle Suspension Analysis (Simulated Gameplay)');
      setFormat('tiktok_9_16');
      setDuration(45);
      setCustomDurationInput('45');
      setVoiceId('studio_hype');
      setTargetChannelMode('tiktok');
      analyzeTopic('GTA 6 Water Physics & Vehicle Suspension Analysis (Simulated Gameplay)');
    } else if (catId === 'tarot') {
      setTopic('Daily Collective Reading: Navigating Major Changes with The Wheel & Two of Wands');
      setFormat('tiktok_9_16');
      setDuration(45);
      setCustomDurationInput('45');
      setVoiceId('studio_calm');
      setTargetChannelMode('tiktok');
      analyzeTopic('Daily Collective Reading: Navigating Major Changes with The Wheel & Two of Wands');
    } else if (catId === 'facts') {
      setTopic('Why Space Telescopes Must Freeze to Minus 388 Degrees to See the Edge of Time');
      setFormat('youtube_16_9');
      setDuration(60);
      setCustomDurationInput('60');
      setVoiceId('studio_documentary');
      setTargetChannelMode('both');
      analyzeTopic('Why Space Telescopes Must Freeze to Minus 388 Degrees to See the Edge of Time');
    }
  };

  const handleSelectCustomCategory = (cat: CustomCategory) => {
    setSelectedCategory(cat.id);
    if (cat.preferredDuration) {
      setDuration(cat.preferredDuration);
      setCustomDurationInput(String(cat.preferredDuration));
    }
    if (cat.preferredVoice) setVoiceId(cat.preferredVoice);
    if (cat.captionStyle) setCaptionStyle(cat.captionStyle);
    if (cat.preferredCta) setCustomCtaText(cat.preferredCta);
    if (cat.publishingAccounts && cat.publishingAccounts.length > 0) {
      if (cat.publishingAccounts.includes('@towboater2011') && cat.publishingAccounts.includes('@otis0239')) {
        setTargetChannelMode('both');
      } else if (cat.publishingAccounts.includes('@towboater2011')) {
        setTargetChannelMode('youtube');
      } else if (cat.publishingAccounts.includes('@otis0239')) {
        setTargetChannelMode('tiktok');
      }
    }
  };

  // Duration buttons
  const handleDurationPreset = (secs: number) => {
    setIsCustomDuration(false);
    setDuration(secs);
    setCustomDurationInput(String(secs));
  };

  const handleCustomDurationChange = (val: string) => {
    setCustomDurationInput(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setDuration(Math.min(900, Math.max(10, parsed)));
      setIsCustomDuration(true);
    }
  };

  // Pipeline execution
  const pipelineSteps = [
    'Interpreting instructions and performing domain research',
    'Verifying factual claims & checking compliance disclaimers',
    'Synthesizing original multi-scene narrative script & hook',
    'Directing scene visual prompts & audio ducking parameters',
    'Formatting safe-zone captions with selected typography',
    'Reviewing channel targeting & engagement directives',
    'Performing automated quality review & rewards eligibility check',
    'Assembling master timeline ready for editor and FFmpeg render',
  ];

  const effectiveChannels =
    targetChannelMode === 'both'
      ? ['@towboater2011', '@otis0239']
      : targetChannelMode === 'youtube'
      ? ['@towboater2011']
      : targetChannelMode === 'tiktok'
      ? ['@otis0239']
      : ['export_only'];

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setGenerating(true);
    setCurrentStep(0);
    setGeneratedResult(null);
    setRenderedUrl(null);

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < pipelineSteps.length - 1) return prev + 1;
        return prev;
      });
    }, 600);

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          instructions,
          category: selectedCategory,
          format,
          targetDurationSeconds: duration,
          voiceId,
          visualStyle,
          editingIntensity,
          captionStyle,
          includeEngagementCta,
          customCtaText: includeEngagementCta ? customCtaText : undefined,
          targetChannels: effectiveChannels,
        }),
      });

      const pkg = await res.json();
      clearInterval(interval);
      setCurrentStep(pipelineSteps.length);
      setGeneratedResult(pkg);
    } catch (err) {
      console.error(err);
      clearInterval(interval);
    } finally {
      setGenerating(false);
    }
  };

  const handleCreateAndRender = async () => {
    if (!generatedResult) return;
    setRenderingMp4(true);

    try {
      const projRes = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: generatedResult.title,
          description: generatedResult.description,
          category: selectedCategory,
          format,
          duration,
          script: generatedResult.script,
        }),
      });
      const newProj: VideoProject = await projRes.json();
      onProjectCreated(newProj);

      const renderRes = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: newProj.id,
          preset: format,
          customDuration: duration,
        }),
      });
      const renderData = await renderRes.json();

      const pollInterval = setInterval(async () => {
        const check = await fetch(`/api/render/${renderData.renderId}`);
        const checkData = await check.json();
        if (checkData.status === 'completed') {
          clearInterval(pollInterval);
          setRenderingMp4(false);
          setRenderedUrl(checkData.outputUrl);
        } else if (checkData.status === 'failed') {
          clearInterval(pollInterval);
          setRenderingMp4(false);
          alert('Render failed: ' + checkData.error);
        }
      }, 1000);
    } catch (err: any) {
      setRenderingMp4(false);
      alert('Error triggering render: ' + err.message);
    }
  };

  // Custom Category Save / Delete
  const handleSaveCustomCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catFormName.trim()) return;

    try {
      const payload = {
        name: catFormName.trim(),
        description: catFormDesc.trim(),
        preferredVoice: catFormVoice,
        preferredDuration: catFormDuration,
        defaultHashtags: catFormHashtags.split(',').map((s) => s.trim()).filter(Boolean),
        preferredCta: catFormCta,
      };

      if (editingCategory) {
        await fetch(`/api/categories/${editingCategory.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      setIsCategoryModalOpen(false);
      setEditingCategory(null);
      setCatFormName('');
      setCatFormDesc('');
      if (onCategoriesUpdated) onCategoriesUpdated();
    } catch (err) {
      console.error('Error saving custom category:', err);
    }
  };

  const handleDeleteCustomCategory = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this custom category?')) return;
    try {
      await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (selectedCategory === id) setSelectedCategory('custom');
      if (onCategoriesUpdated) onCategoriesUpdated();
    } catch (err) {
      console.error('Error deleting category:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full min-w-0 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400 shrink-0" />
            <span>Universal AI Video Creator</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Universal AI video creator capable of producing videos about virtually any subject, with full creative control and decoupled channel publishing.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => {
              setEditingCategory(null);
              setCatFormName('');
              setCatFormDesc('');
              setCatFormVoice('studio_creator');
              setCatFormDuration(60);
              setCatFormHashtags('technology, documentary');
              setCatFormCta('');
              setIsCategoryModalOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-cyan-500 text-zinc-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>Create New Category</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form & Creative Controls */}
        <div className="lg:col-span-2 space-y-5 min-w-0">
          {/* 1. Universal Content Selector */}
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-200 flex items-center gap-2 uppercase tracking-wide">
                <Tag className="w-3.5 h-3.5 text-cyan-400" />
                <span>1. Content Category Selector</span>
              </label>
              <span className="text-[10px] text-zinc-500 font-mono">
                {selectedCategory === 'custom' ? 'Default: Anything / Custom Topic' : `Selected: ${selectedCategory}`}
              </span>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRESET_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelectPreset(cat.id)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between min-h-[72px] ${
                    selectedCategory === cat.id
                      ? 'bg-cyan-950/90 border-cyan-500 text-cyan-100 ring-1 ring-cyan-500/50 shadow-md shadow-cyan-950'
                      : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-semibold text-xs text-zinc-100">
                    <span className="text-sm">{cat.icon}</span>
                    <span className="truncate">{cat.label}</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1 line-clamp-1">
                    {cat.sub}
                  </div>
                </button>
              ))}

              {/* My Saved Categories Toggle */}
              <button
                type="button"
                onClick={() => setSavedCategoriesOpen(!savedCategoriesOpen)}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between min-h-[72px] ${
                  savedCategoriesOpen || (customCategories.some(c => c.id === selectedCategory))
                    ? 'bg-indigo-950/70 border-indigo-500/70 text-indigo-200'
                    : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between font-semibold text-xs text-zinc-100">
                  <span className="flex items-center gap-1.5">
                    <span>📁</span>
                    <span>My Saved ({customCategories.length})</span>
                  </span>
                  {savedCategoriesOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </div>
                <div className="text-[10px] text-zinc-500 mt-1 truncate">
                  Custom user presets
                </div>
              </button>
            </div>

            {/* Saved Categories Drawer */}
            {savedCategoriesOpen && (
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 mt-2">
                <div className="text-[11px] font-semibold text-zinc-400 flex items-center justify-between">
                  <span>Custom Categories</span>
                  <button
                    onClick={() => {
                      setEditingCategory(null);
                      setCatFormName('');
                      setCatFormDesc('');
                      setIsCategoryModalOpen(true);
                    }}
                    className="text-cyan-400 hover:underline flex items-center gap-1 text-[11px] cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Add Category
                  </button>
                </div>
                {customCategories.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic py-2">
                    No custom categories saved yet. Click "Add Category" to save custom presets with specific styles and voices.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {customCategories.map((cat) => (
                      <div
                        key={cat.id}
                        onClick={() => handleSelectCustomCategory(cat)}
                        className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all flex items-center justify-between ${
                          selectedCategory === cat.id
                            ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="font-semibold text-xs truncate">{cat.name}</div>
                          <div className="text-[10px] text-zinc-500 truncate">{cat.description || `${cat.preferredDuration || 60}s • ${cat.preferredVoice || 'creator'}`}</div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingCategory(cat);
                              setCatFormName(cat.name);
                              setCatFormDesc(cat.description || '');
                              setCatFormVoice(cat.preferredVoice || 'studio_creator');
                              setCatFormDuration(cat.preferredDuration || 60);
                              setCatFormHashtags((cat.defaultHashtags || []).join(', '));
                              setCatFormCta(cat.preferredCta || '');
                              setIsCategoryModalOpen(true);
                            }}
                            className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                            title="Edit Category"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteCustomCategory(cat.id, e)}
                            className="p-1 rounded hover:bg-red-950/60 text-zinc-500 hover:text-red-400"
                            title="Delete Category"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Quick Inspiration Chips when in custom / anything mode */}
            {selectedCategory === 'custom' && (
              <div className="pt-1">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1.5">
                  Universal Inspiration Examples:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Space Telescopes & Cryogenics',
                    'Cast Iron Steak Reverse Sear',
                    'Ancient Roman Concrete Mystery',
                    'DIY Brake Pad & Rotor Repair',
                    'Coffee Shop First Date Comedy',
                    'Excavator Hydraulic Failures',
                    'Quantum Computing Explained',
                  ].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => {
                        setTopic(chip);
                        analyzeTopic(chip);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-cyan-500/50 text-[11px] text-zinc-300 hover:text-cyan-200 cursor-pointer transition-colors"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 2. Topic Input & Auto Classification */}
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3.5 shadow-xl">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-200 uppercase tracking-wide flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span>2. Video Idea, Subject, or Instructions</span>
              </label>
              <button
                type="button"
                onClick={() => analyzeTopic(topic)}
                disabled={analyzingTopic || !topic.trim()}
                className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <Wand2 className="w-3 h-3" />
                <span>{analyzingTopic ? 'Analyzing...' : 'Auto-Classify Topic'}</span>
              </button>
            </div>

            <textarea
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
              }}
              onBlur={() => {
                if (topic.trim() && !classification) analyzeTopic(topic);
              }}
              rows={2}
              placeholder="Type any video idea or detailed topic (e.g. Space discoveries, Car repair tutorials, Comedy sketches, Towboat mechanics, Cooking secrets)..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40 transition-all resize-none"
            />

            {/* Custom Instructions (Optional) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-semibold text-zinc-400">
                  Custom Directives & Specific Instructions (Optional)
                </label>
                <span className="text-[10px] text-zinc-500 font-mono">Pacing, jokes, specific tools</span>
              </div>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={2}
                placeholder="Add specific instructions (e.g., 'Emphasize torque specifications', 'Add comedic timing with awkward zoom', 'Focus on 1974 historical timeline')..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-cyan-500 transition-all resize-none"
              />

              {/* Reusable Instruction Templates */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[10px] font-mono text-zinc-500 uppercase">Presets:</span>
                {INSTRUCTION_TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setInstructions(tmpl.text);
                      setDuration(tmpl.dur);
                      setCustomDurationInput(String(tmpl.dur));
                    }}
                    className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-[10px] text-zinc-400 hover:text-zinc-200 cursor-pointer transition-colors"
                  >
                    {tmpl.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Intelligent Classification Feedback Banner */}
            {classification && (
              <div className="p-3 rounded-xl bg-zinc-950 border border-cyan-900/60 text-xs space-y-2 mt-2">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    <span className="font-semibold text-cyan-300">
                      Auto-Detected Niche: {classification.detectedNiche}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono text-[10px]">
                    Confidence: {Math.round(classification.confidence * 100)}%
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-zinc-400 pt-1 border-t border-zinc-900">
                  <div>
                    <span className="text-zinc-500 block">Recommended Pacing:</span>
                    <span className="text-zinc-200 capitalize font-medium">{classification.recommendedPacing?.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Visual Directive:</span>
                    <span className="text-zinc-200 line-clamp-1">{classification.suggestedVisualDirective}</span>
                  </div>
                </div>

                {classification.requiresSimulationDisclaimer && (
                  <div className="p-2 rounded bg-amber-950/40 border border-amber-800/50 text-amber-300 text-[11px] flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span><strong>Integrity Rule:</strong> Simulated gameplay disclaimers automatically applied to all on-screen visuals.</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. Duration & Format Controls */}
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4 shadow-xl">
            <label className="text-xs font-bold text-zinc-200 uppercase tracking-wide flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>3. Target Duration & Video Orientation</span>
            </label>

            {/* Duration Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Select Target Duration:</span>
                <span className="font-mono text-cyan-400 font-bold">{duration} seconds</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[
                  { label: '15s Hook', val: 15 },
                  { label: '30s Reel', val: 30 },
                  { label: '60s Short', val: 60 },
                  { label: '3m (180s)', val: 180 },
                  { label: '10m Doc', val: 600 },
                ].map((d) => (
                  <button
                    key={d.val}
                    type="button"
                    onClick={() => handleDurationPreset(d.val)}
                    className={`py-2 px-2.5 rounded-xl border text-center text-xs font-semibold cursor-pointer transition-all ${
                      duration === d.val && !isCustomDuration
                        ? 'bg-cyan-950 border-cyan-500 text-cyan-200 shadow-sm'
                        : 'bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}

                {/* Custom duration input */}
                <div className="relative">
                  <input
                    type="number"
                    min="10"
                    max="900"
                    value={customDurationInput}
                    onChange={(e) => handleCustomDurationChange(e.target.value)}
                    placeholder="Custom"
                    className={`w-full py-2 px-2.5 rounded-xl border text-center text-xs font-semibold focus:outline-none transition-all ${
                      isCustomDuration
                        ? 'bg-cyan-950 border-cyan-500 text-cyan-200'
                        : 'bg-zinc-950/80 border-zinc-800 text-zinc-400 focus:border-cyan-500'
                    }`}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500 pointer-events-none">s</span>
                </div>
              </div>
            </div>

            {/* Orientation & Format */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-zinc-800/80">
              {[
                { id: 'shorts_9_16' as const, label: '9:16 Vertical', sub: 'YouTube Shorts' },
                { id: 'tiktok_9_16' as const, label: '9:16 TikTok', sub: 'TikTok Creator Rewards' },
                { id: 'youtube_16_9' as const, label: '16:9 Landscape', sub: 'YouTube Full Feature' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFormat(f.id)}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                    format === f.id
                      ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200'
                      : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="font-semibold text-xs">{f.label}</div>
                  <div className="text-[10px] text-zinc-500">{f.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Independent Channel Publishing & Engagement CTA (Anti-Burn-In) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4 shadow-xl">
            <label className="text-xs font-bold text-zinc-200 uppercase tracking-wide flex items-center gap-2">
              <Share2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>4. Target Publishing Channels & Engagement CTA</span>
            </label>

            {/* Channel Options */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'both' as const, label: 'Both Channels', sub: '@towboater2011 & @otis0239' },
                { id: 'youtube' as const, label: 'YouTube Only', sub: '@towboater2011 (Verified)' },
                { id: 'tiktok' as const, label: 'TikTok Only', sub: '@otis0239 (Verified)' },
                { id: 'export_only' as const, label: 'Export Only', sub: 'Local MP4, No Publish' },
              ].map((ch) => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => setTargetChannelMode(ch.id)}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                    targetChannelMode === ch.id
                      ? 'bg-indigo-950/80 border-indigo-500 text-indigo-200 ring-1 ring-indigo-500/50'
                      : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="font-semibold text-xs">{ch.label}</div>
                  <div className="text-[10px] text-zinc-500 truncate">{ch.sub}</div>
                </button>
              ))}
            </div>

            {/* Engagement CTA Toggle (Zero Burn-in unless enabled) */}
            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-zinc-200">
                  <input
                    type="checkbox"
                    checked={includeEngagementCta}
                    onChange={(e) => setIncludeEngagementCta(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-700 text-cyan-600 focus:ring-cyan-500 bg-zinc-900"
                  />
                  <span>Include Platform Call-to-Action (CTA)</span>
                </label>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {includeEngagementCta ? 'Enabled (Appends to final scene)' : 'Disabled (No CTA burned into video)'}
                </span>
              </div>

              {includeEngagementCta && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase">
                    Custom Spoken CTA Text:
                  </span>
                  <input
                    type="text"
                    value={customCtaText}
                    onChange={(e) => setCustomCtaText(e.target.value)}
                    placeholder="Enter call to action..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
                  />
                  <div className="flex gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setCustomCtaText('Like, comment, and subscribe for more on @towboater2011!')}
                      className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
                    >
                      YouTube Default
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomCtaText('Like, comment, and follow @otis0239 for more!')}
                      className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
                    >
                      TikTok Default
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 5. Production Style & Audio Voiceover Settings */}
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4 shadow-xl">
            <label className="text-xs font-bold text-zinc-200 uppercase tracking-wide flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>5. Production Aesthetics & Voice Selection</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Voice Selection */}
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1.5">
                  Narration Voice
                </label>
                <select
                  value={voiceId}
                  onChange={(e) => setVoiceId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="studio_pilot">Studio Pilot (Deep, Calm River Pilot)</option>
                  <option value="studio_hype">Studio Hype (Fast Gaming & Tech)</option>
                  <option value="studio_creator">Studio Creator (Warm & Engaging)</option>
                  <option value="studio_documentary">Studio Documentary (Authoritative BBC)</option>
                  <option value="studio_mechanic">Studio Mechanic (Direct & Practical)</option>
                  <option value="studio_calm">Studio Calm (Mindful & Measured)</option>
                </select>
              </div>

              {/* Visual Style */}
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1.5">
                  Visual Style
                </label>
                <select
                  value={visualStyle}
                  onChange={(e) => setVisualStyle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="authentic_footage">Authentic Real-World Footage</option>
                  <option value="cinematic_3d">Cinematic 3D Simulation</option>
                  <option value="infographics">High-Contrast Infographics & Diagrams</option>
                  <option value="retro_documentary">Archival & Historical Documentary</option>
                  <option value="b_roll">Dynamic High-Energy B-Roll</option>
                </select>
              </div>

              {/* Editing Intensity */}
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1.5">
                  Editing Intensity / Cut Pacing
                </label>
                <select
                  value={editingIntensity}
                  onChange={(e: any) => setEditingIntensity(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="fast">Fast & High Energy (Cuts every 2-3s)</option>
                  <option value="balanced">Balanced Narrative (Cuts every 4-6s)</option>
                  <option value="documentary">Slow & Atmospheric (Cuts every 8-12s)</option>
                </select>
              </div>

              {/* Caption Appearance */}
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1.5">
                  Caption Appearance
                </label>
                <select
                  value={captionStyle}
                  onChange={(e: any) => setCaptionStyle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="bold_punchy">Bold Punchy (Yellow/Black box highlight)</option>
                  <option value="clean_minimal">Clean Minimalist (White Sans-Serif)</option>
                  <option value="karaoke_highlight">Karaoke Word-by-Word Highlight</option>
                  <option value="subtle_bottom">Subtle Bottom Safe-Zone Bar</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Cost Summary, Pipeline Status & Actions */}
        <div className="space-y-5 min-w-0">
          {/* Action Trigger Box */}
          <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xl space-y-4">
            <button
              onClick={handleGenerate}
              disabled={generating || !topic.trim()}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-950/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {generating ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Generating Video Package...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate AI Video Package</span>
                </>
              )}
            </button>

            {/* Free Local Cost Transparency */}
            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs">
              <div className="flex items-center justify-between font-semibold text-zinc-300">
                <span className="flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Estimated Video Cost:</span>
                </span>
                <span className="text-emerald-400 font-mono text-sm font-bold">
                  $0.00 (Free Local FFmpeg)
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Local FFmpeg rendering, Whisper subtitles, and local speech generation incur zero per-minute cloud API fees.
              </p>
            </div>
          </div>

          {/* Pipeline Progress Stages */}
          {generating && (
            <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xl space-y-3">
              <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wide flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>Production Progress</span>
              </h4>
              <div className="space-y-2">
                {pipelineSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-2.5 text-xs transition-opacity ${
                      idx < currentStep
                        ? 'text-emerald-400'
                        : idx === currentStep
                        ? 'text-cyan-300 font-semibold'
                        : 'text-zinc-600'
                    }`}
                  >
                    {idx < currentStep ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : idx === currentStep ? (
                      <RotateCw className="w-3.5 h-3.5 text-cyan-400 animate-spin shrink-0 mt-0.5" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-zinc-700 shrink-0 mt-0.5" />
                    )}
                    <span className="leading-snug">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Review & Render Output */}
          {generatedResult && (
            <div className="p-5 rounded-2xl bg-zinc-900/95 border border-cyan-800/80 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-cyan-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Production Package Ready</span>
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                  {generatedResult.estimatedDuration || duration}s
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Title</span>
                <p className="font-bold text-xs text-zinc-100">{generatedResult.title}</p>
              </div>

              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Narration Script</span>
                <p className="text-xs text-zinc-300 italic max-h-32 overflow-y-auto bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 leading-relaxed">
                  "{generatedResult.script}"
                </p>
              </div>

              {/* Storyboard Count */}
              <div className="flex items-center justify-between text-xs text-zinc-400 pt-1 border-t border-zinc-800">
                <span>Scenes Generated:</span>
                <span className="font-mono text-zinc-200">{generatedResult.storyboard?.length || 0} scenes</span>
              </div>

              {/* Render Trigger */}
              <div className="pt-2">
                {renderedUrl ? (
                  <div className="space-y-2">
                    <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center justify-between">
                      <span className="font-semibold">FFmpeg MP4 Render Complete!</span>
                      <a
                        href={renderedUrl}
                        download
                        className="px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-[11px]"
                      >
                        Download
                      </a>
                    </div>
                    <button
                      onClick={() => onOpenEditor('proj_latest')}
                      className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Film className="w-3.5 h-3.5" />
                      <span>Open in Multi-Track Editor</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleCreateAndRender}
                    disabled={renderingMp4}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950 disabled:opacity-50"
                  >
                    {renderingMp4 ? (
                      <>
                        <RotateCw className="w-4 h-4 animate-spin" />
                        <span>Rendering with Local FFmpeg...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span>Save & Render Video (FFmpeg)</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Category Creation / Edit Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-base text-zinc-100 flex items-center gap-2">
                <Folder className="w-4 h-4 text-cyan-400" />
                <span>{editingCategory ? 'Edit Custom Category' : 'Create New Category'}</span>
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomCategory} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={catFormName}
                  onChange={(e) => setCatFormName(e.target.value)}
                  placeholder="e.g. Space Discoveries, Cooking Tutorials, Heavy Mechanics"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={catFormDesc}
                  onChange={(e) => setCatFormDesc(e.target.value)}
                  placeholder="Short summary of this niche..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Preferred Voice
                  </label>
                  <select
                    value={catFormVoice}
                    onChange={(e) => setCatFormVoice(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="studio_creator">Studio Creator</option>
                    <option value="studio_pilot">Studio Pilot</option>
                    <option value="studio_hype">Studio Hype</option>
                    <option value="studio_documentary">Studio Documentary</option>
                    <option value="studio_mechanic">Studio Mechanic</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Default Duration (seconds)
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="600"
                    value={catFormDuration}
                    onChange={(e) => setCatFormDuration(parseInt(e.target.value, 10) || 60)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Default Hashtags (comma separated)
                </label>
                <input
                  type="text"
                  value={catFormHashtags}
                  onChange={(e) => setCatFormHashtags(e.target.value)}
                  placeholder="space, astronomy, science, cosmos"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Preferred Call to Action (Optional)
                </label>
                <input
                  type="text"
                  value={catFormCta}
                  onChange={(e) => setCatFormCta(e.target.value)}
                  placeholder="e.g. Follow for daily science discoveries!"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold cursor-pointer"
                >
                  {editingCategory ? 'Update Category' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
