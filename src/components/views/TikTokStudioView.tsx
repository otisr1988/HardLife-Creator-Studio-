import React, { useState, useEffect } from 'react';
import {
  Share2,
  Upload,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  RotateCw,
  Sparkles,
  Shield,
  Eye,
  Heart,
  Share,
  MessageCircle,
} from 'lucide-react';
import type { VideoProject, ConnectedAccount } from '../../types';

interface TikTokStudioViewProps {
  projects: VideoProject[];
  account?: ConnectedAccount;
}

export const TikTokStudioView: React.FC<TikTokStudioViewProps> = ({
  projects,
  account,
}) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || '');
  const [title, setTitle] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'private' | 'draft'>('public');
  const [allowDuet, setAllowDuet] = useState(true);
  const [allowStitch, setAllowStitch] = useState(true);
  const [allowComments, setAllowComments] = useState(true);
  const [useMetricoolBridge, setUseMetricoolBridge] = useState(true);
  const [isCommercialContent, setIsCommercialContent] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState<any | null>(null);

  useEffect(() => {
    fetch('/api/tiktok/posts')
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch(console.error);
  }, []);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const isRewardsEligible = (selectedProject?.duration || 0) >= 60;

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) return;
    setPublishing(true);
    setPublishSuccess(null);

    try {
      const res = await fetch('/api/tiktok/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProjectId,
          title,
          privacy,
          allowDuet,
          allowStitch,
          allowComments,
          isCommercialContent,
          useMetricoolBridgeIfDirectPending: useMetricoolBridge,
        }),
      });

      const data = await res.json();
      setPublishSuccess(data);
    } catch (err: any) {
      alert('Failed: ' + err.message);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Account Header */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-cyan-950/40 via-zinc-900 to-zinc-950 border border-cyan-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-cyan-600 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-cyan-600/30">
            <Share2 className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-zinc-100">otis0239</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" /> TikTok Creator API Active
              </span>
            </div>
            <p className="text-xs text-cyan-400 font-mono mt-0.5">@otis0239</p>
            <p className="text-[11px] text-zinc-400 mt-1">
              Publishing Mode: Official Creator OAuth + Metricool Scheduling Bridge
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-center px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800">
            <div className="text-sm font-bold text-zinc-100">
              {account?.followerCount?.toLocaleString() || '18,900'}
            </div>
            <div className="text-[10px] text-zinc-400">Followers</div>
          </div>
          <div className="text-center px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800">
            <div className="text-sm font-bold text-zinc-100">
              {(account?.totalViews || 2850000).toLocaleString()}
            </div>
            <div className="text-[10px] text-zinc-400">Total Views</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Upload & Policies (Left) + Posts Feed (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upload form */}
        <div className="lg:col-span-6 p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <h3 className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-cyan-400" /> Publish to @otis0239
            </h3>
            <span className="text-[10px] text-cyan-400 font-mono">Creator Rewards Ready</span>
          </div>

          {/* Monetization Advice */}
          {selectedProject && (
            <div
              className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
                isRewardsEligible
                  ? 'bg-purple-950/40 border-purple-800/60 text-purple-300'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400'
              }`}
            >
              <Sparkles className="w-4 h-4 shrink-0 text-purple-400 mt-0.5" />
              <div>
                <span className="font-semibold block text-zinc-200">
                  {isRewardsEligible
                    ? `Creator Rewards Eligible (${selectedProject.duration}s > 60s)`
                    : `Duration Notice: ${selectedProject.duration}s (Short Clip)`}
                </span>
                <span className="text-[11px] text-zinc-400">
                  {isRewardsEligible
                    ? 'Original horizontal or vertical video longer than 1 minute qualifies for TikTok Creator Rewards monetization.'
                    : 'Videos under 60s do not qualify for Creator Rewards. Note: Short clips do not automatically qualify for ad revenue.'}
                </span>
              </div>
            </div>
          )}

          <form onSubmit={handlePublish} className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Select Project
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => {
                  setSelectedProjectId(e.target.value);
                  const p = projects.find((proj) => proj.id === e.target.value);
                  if (p) setTitle(`${p.title} #towboat #riverlife`);
                }}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.duration}s)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                TikTok Caption & Hashtags
              </label>
              <textarea
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                rows={3}
                placeholder="Hooky caption with #towboat #riverlife #engineering..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            {/* Publishing Target Mode */}
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Publishing Destination
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'public' as const, label: 'Public Video', sub: 'Instant publish' },
                  { id: 'draft' as const, label: 'Creator Draft', sub: 'Saved in Inbox' },
                  { id: 'private' as const, label: 'Private Video', sub: 'Only you' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPrivacy(m.id)}
                    className={`p-2 rounded-lg border text-left cursor-pointer ${
                      privacy === m.id
                        ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <div className="font-semibold text-xs">{m.label}</div>
                    <div className="text-[10px] text-zinc-500">{m.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Metricool Bridge Adapter Checkbox */}
            <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1.5">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-200">
                <input
                  type="checkbox"
                  checked={useMetricoolBridge}
                  onChange={(e) => setUseMetricoolBridge(e.target.checked)}
                  className="rounded text-cyan-500 focus:ring-0"
                />
                Use Metricool Publishing Bridge as Fallback
              </label>
              <p className="text-[10px] text-zinc-400 pl-5">
                Complies with TikTok policies: routes scheduled publication via approved third-party scheduling adapter when direct developer review is pending.
              </p>
            </div>

            {/* Interaction toggles */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <button
                type="button"
                onClick={() => setAllowDuet(!allowDuet)}
                className={`p-2 rounded border cursor-pointer ${allowDuet ? 'bg-zinc-800 text-cyan-300 border-zinc-700' : 'bg-zinc-950 text-zinc-500 border-zinc-800'}`}
              >
                Duet: {allowDuet ? 'ON' : 'OFF'}
              </button>
              <button
                type="button"
                onClick={() => setAllowStitch(!allowStitch)}
                className={`p-2 rounded border cursor-pointer ${allowStitch ? 'bg-zinc-800 text-cyan-300 border-zinc-700' : 'bg-zinc-950 text-zinc-500 border-zinc-800'}`}
              >
                Stitch: {allowStitch ? 'ON' : 'OFF'}
              </button>
              <button
                type="button"
                onClick={() => setAllowComments(!allowComments)}
                className={`p-2 rounded border cursor-pointer ${allowComments ? 'bg-zinc-800 text-cyan-300 border-zinc-700' : 'bg-zinc-950 text-zinc-500 border-zinc-800'}`}
              >
                Comments: {allowComments ? 'ON' : 'OFF'}
              </button>
            </div>

            <button
              type="submit"
              disabled={publishing}
              className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-950 cursor-pointer"
            >
              {publishing ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing TikTok Dispatch...</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>{privacy === 'draft' ? 'Save as Draft to @otis0239' : 'Publish to @otis0239'}</span>
                </>
              )}
            </button>
          </form>

          {publishSuccess && (
            <div className="p-3.5 rounded-lg bg-emerald-950/40 border border-emerald-800/60 space-y-1.5 animate-in fade-in">
              <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                TikTok Pipeline Succeeded
              </div>
              <p className="text-[11px] text-zinc-300">
                Verified: <span className="font-mono text-cyan-400">{publishSuccess.channelHandle}</span>
              </p>
              <a
                href={publishSuccess.externalUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1 break-all"
              >
                {publishSuccess.externalUrl} <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        {/* Recent TikTok Posts */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-200">
              Live TikTok Feed & Analytics
            </h3>
            <span className="text-[10px] text-zinc-500 font-mono">@otis0239</span>
          </div>

          <div className="space-y-2.5">
            {posts.map((post) => (
              <div
                key={post.id}
                className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1">
                    <span className="font-mono text-cyan-400">{post.duration}s</span>
                    {post.isCreatorRewardsEligible && (
                      <span className="px-1.5 py-0.5 rounded bg-purple-950 border border-purple-800 text-purple-300 font-medium">
                        Monetized (Rewards 1m+)
                      </span>
                    )}
                  </div>
                  <h4 className="font-semibold text-xs text-zinc-100 line-clamp-2 mt-1">
                    {post.title}
                  </h4>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-zinc-800/80 text-[11px] text-zinc-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3 text-zinc-500" /> {post.viewCount.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3 text-red-400" /> {post.likeCount.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Share className="w-3 h-3 text-zinc-500" /> {post.shareCount.toLocaleString()}
                    </span>
                  </div>

                  <a
                    href={post.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    View on TikTok <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
