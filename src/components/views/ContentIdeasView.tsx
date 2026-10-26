import React, { useState } from 'react';
import {
  Lightbulb,
  Sparkles,
  TrendingUp,
  Search,
  ArrowRight,
  Flame,
  CheckCircle2,
  Copy,
  Check,
  Clock,
  Layers,
  Wand2,
  RefreshCw,
} from 'lucide-react';

interface ContentIdeasViewProps {
  onSendToCreator: (
    topic: string,
    category: string,
    duration?: number,
    format?: 'shorts_9_16' | 'tiktok_9_16' | 'youtube_16_9',
    targetChannels?: string[]
  ) => void;
}

export const ContentIdeasView: React.FC<ContentIdeasViewProps> = ({
  onSendToCreator,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [broadSubject, setBroadSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [customIdeas, setCustomIdeas] = useState<any[]>([]);

  const curatedIdeas = [
    {
      id: 'idea_c1',
      targetChannels: ['@towboater2011'],
      category: 'Towboats & River',
      title: 'How 10,500 Horsepower Towboats Flank Hairpin S-Bends Under Bridge Piers',
      hook: "Most people don't realize this towboat cannot stop for the next 1.2 miles.",
      summary: 'Wheelhouse maneuvering analysis explaining flanking rudders and drift angles.',
      retentionScore: 96,
      duration: 52,
      format: 'shorts_9_16' as const,
      audienceInterest: 'High audience search volume around maritime mechanics and river engineering.',
      productionRequirements: ['Wheelhouse footage', 'Rudder telemetry overlay', 'Dual diesel engine sound'],
    },
    {
      id: 'idea_c2',
      targetChannels: ['@towboater2011'],
      category: 'Towboats & River',
      title: 'Twin EMD V16 Diesel Engine Room Cold Start & 36-Barge River Transit',
      hook: 'Watch what happens to these massive turbochargers when we hit forward full.',
      summary: 'Authentic mechanical cold start walkthrough in deep river transit.',
      retentionScore: 94,
      duration: 55,
      format: 'shorts_9_16' as const,
      audienceInterest: 'Engine sounds and mechanical cold starts trend exceptionally on Shorts.',
      productionRequirements: ['Engine room walkaround', 'Turbo spool audio', 'Engine tachometer view'],
    },
    {
      id: 'idea_c3',
      targetChannels: ['@otis0239'],
      category: 'GTA & Gaming',
      title: 'GTA 6 Water Simulation vs Real River Physics (Simulated Analysis)',
      hook: 'Look closely at the bow wave displacement: Rockstar modeled fluid dynamics.',
      summary: 'Comparative analysis contrasting game engine hydrodynamics with authentic river wash.',
      retentionScore: 98,
      duration: 45,
      format: 'tiktok_9_16' as const,
      audienceInterest: 'GTA VI physics speculation is the #1 trending gaming topic across TikTok.',
      productionRequirements: ['Simulated gameplay recreation', 'Disclaimer on-screen', 'Fluid physics slow-mo'],
    },
    {
      id: 'idea_c4',
      targetChannels: ['@otis0239'],
      category: 'Tarot Readings',
      title: 'Collective Tarot Reading: The Tower into The Star (Sudden Breakthroughs)',
      hook: "If you've felt things crumbling over the last 72 hours, here is why.",
      summary: 'Timely collective energy reading focusing on post-upheaval restoration.',
      retentionScore: 91,
      duration: 45,
      format: 'tiktok_9_16' as const,
      audienceInterest: 'Consistent high retention when cards remain clearly framed on screen.',
      productionRequirements: ['Overhead velvet spread', 'Clear card focus', 'Ambient background audio'],
    },
    {
      id: 'idea_c5',
      targetChannels: ['@towboater2011', '@otis0239'],
      category: 'Viral Facts',
      title: 'Why Deep Space Telescopes Must Freeze to Minus 388 Degrees to See the Past',
      hook: 'If this telescope warmed up by even five degrees, it would go completely blind.',
      summary: 'Exploring infrared astronomy cryocoolers and gold hexagonal mirror alignment.',
      retentionScore: 95,
      duration: 60,
      format: 'youtube_16_9' as const,
      audienceInterest: 'Space mystery curiosity gap with broad algorithmic appeal.',
      productionRequirements: ['Space telescope 3D renders', 'Cryocooler diagram', 'Deep field composites'],
    },
  ];

  const handleGenerateIdeas = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!broadSubject.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/ai/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: broadSubject.trim(),
          count: 12,
        }),
      });

      const data = await res.json();
      if (data && Array.isArray(data.ideas)) {
        setCustomIdeas(data.ideas);
      }
    } catch (err) {
      console.error('Failed to generate ideas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyHook = (id: string, hook: string) => {
    navigator.clipboard.writeText(hook);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const displayedIdeas = customIdeas.length > 0 ? customIdeas : curatedIdeas;

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full min-w-0 overflow-x-hidden">
      {/* Header & Broad Subject Generator */}
      <div className="p-4 sm:p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-zinc-100 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-400 shrink-0" />
              <span>AI Video Ideas & Hook Generator</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Enter any broad topic to instantly generate 10–20 high-retention video concepts tailored for <strong>@towboater2011</strong> & <strong>@otis0239</strong>.
            </p>
          </div>
          {customIdeas.length > 0 && (
            <button
              onClick={() => {
                setCustomIdeas([]);
                setBroadSubject('');
              }}
              className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset to Curated</span>
            </button>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleGenerateIdeas} className="flex flex-col sm:flex-row items-stretch gap-2.5 pt-2">
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={broadSubject}
              onChange={(e) => setBroadSubject(e.target.value)}
              placeholder="Enter broad subject (e.g. Space Discoveries, Cast Iron Cooking, Car Repair DIY, Ancient Mysteries)..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !broadSubject.trim()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-950/40 shrink-0 transition-all"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generating 12 Ideas...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Generate 12 Video Ideas</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Inspiration Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-zinc-400">
          <span className="text-zinc-500 font-semibold">Try:</span>
          {[
            'Space & Black Holes',
            'Cast Iron Steak Cooking',
            'Ancient Roman Engineering',
            'DIY Brake Pad Repair',
            'Awkward Dating Comedy',
            'Towboat Lock Navigation',
            'GTA 6 Water Physics',
          ].map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => {
                setBroadSubject(chip);
              }}
              className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white cursor-pointer transition-colors text-[11px]"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Ideas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedIdeas.map((idea, idx) => (
          <div
            key={idea.id || idx}
            className="p-4 sm:p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between space-y-4 shadow-lg min-w-0"
          >
            <div>
              {/* Top Meta Badges */}
              <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-2 font-mono flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-bold uppercase truncate max-w-[160px]">
                  {idea.category || idea.suggestedCategory || 'Universal'}
                </span>
                <span className="text-amber-400 flex items-center gap-1 font-bold">
                  <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{idea.duration}s</span>
                  <span className="text-zinc-600">•</span>
                  <span className="uppercase">{idea.format?.replace('_', ' ')}</span>
                </span>
              </div>

              {/* Title */}
              <h3 className="font-bold text-sm text-zinc-100 leading-snug break-words">
                {idea.title}
              </h3>

              {/* Hook Box with Copy */}
              <div className="mt-3 p-3 rounded-xl bg-zinc-950/90 border border-zinc-800 text-xs relative group">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase font-semibold">
                    Opening Hook (0 - 3s)
                  </span>
                  <button
                    onClick={() => handleCopyHook(idea.id, idea.hook)}
                    className="text-[10px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1 cursor-pointer"
                    title="Copy hook to clipboard"
                  >
                    {copiedId === idea.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="italic text-zinc-300 break-words leading-relaxed">
                  "{idea.hook}"
                </p>
              </div>

              {/* Summary */}
              {idea.summary && (
                <p className="text-[11px] text-zinc-400 mt-2.5 line-clamp-2 leading-relaxed">
                  {idea.summary}
                </p>
              )}

              {/* Production Requirements checklist */}
              {idea.productionRequirements && idea.productionRequirements.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-zinc-800/80 space-y-1">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">
                    Production Directives
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {idea.productionRequirements.slice(0, 3).map((reqItem: string, rIdx: number) => (
                      <span
                        key={rIdx}
                        className="px-2 py-0.5 rounded bg-zinc-950 text-zinc-400 border border-zinc-800/60 text-[10px] truncate max-w-full"
                      >
                        ✓ {reqItem}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Footer & Action */}
            <div className="flex items-center justify-between pt-3 border-t border-zinc-800/80 text-xs gap-2">
              <span className="font-mono text-cyan-400 text-[11px] truncate">
                {(idea.targetChannels || ['@towboater2011', '@otis0239']).join(' ')}
              </span>

              <button
                onClick={() =>
                  onSendToCreator(
                    idea.title,
                    idea.category || idea.suggestedCategory || 'custom',
                    idea.duration,
                    idea.format,
                    idea.targetChannels
                  )
                }
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-cyan-950 shrink-0 transition-all"
              >
                <span>Produce with AI</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
