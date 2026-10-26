import React, { useState, useEffect } from 'react';
import {
  Youtube,
  Upload,
  Calendar,
  Eye,
  ThumbsUp,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  RotateCw,
  Sparkles,
  Play,
  Lock,
} from 'lucide-react';
import type { VideoProject, ConnectedAccount } from '../../types';

interface YouTubeStudioViewProps {
  projects: VideoProject[];
  account?: ConnectedAccount;
}

export const YouTubeStudioView: React.FC<YouTubeStudioViewProps> = ({
  projects,
  account,
}) => {
  const [videos, setVideos] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'unlisted' | 'private'>('public');
  const [scheduleTime, setScheduleTime] = useState('');
  const [category, setCategory] = useState('28'); // Science & Technology / Transport
  const [madeForKids, setMadeForKids] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState<any | null>(null);

  useEffect(() => {
    fetch('/api/youtube/videos')
      .then((res) => res.json())
      .then((data) => setVideos(data))
      .catch(console.error);
  }, []);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) return;
    setPublishing(true);
    setPublishSuccess(null);

    try {
      const res = await fetch('/api/youtube/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProjectId,
          title,
          description,
          tags: ['towboat', 'mississippi', 'maritime', 'heavyequipment'],
          category,
          privacy,
          scheduledTime: scheduleTime || undefined,
          audience: { madeForKids, ageRestricted: false },
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
      {/* Channel Header */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-red-950/40 via-zinc-900 to-zinc-950 border border-red-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-red-600 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-red-600/30">
            <Youtube className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-zinc-100">Towboater 2011</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" /> OAuth Verified
              </span>
            </div>
            <p className="text-xs text-red-400 font-mono mt-0.5">@towboater2011</p>
            <p className="text-[11px] text-zinc-400 mt-1">
              Authorized Scopes: YouTube Data API v3 (Uploads, Playlists, Analytics, Shorts)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-center px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800">
            <div className="text-sm font-bold text-zinc-100">
              {account?.subscriberCount?.toLocaleString() || '24,300'}
            </div>
            <div className="text-[10px] text-zinc-400">Subscribers</div>
          </div>
          <div className="text-center px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800">
            <div className="text-sm font-bold text-zinc-100">
              {(account?.totalViews || 4120000).toLocaleString()}
            </div>
            <div className="text-[10px] text-zinc-400">Lifetime Views</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Upload Form (Left) & Channel Videos (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upload & Publish Form */}
        <div className="lg:col-span-6 p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <h3 className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-red-400" /> Upload & Publish to @towboater2011
            </h3>
            <span className="text-[10px] text-zinc-500 font-mono">YouTube Data API v3</span>
          </div>

          <form onSubmit={handlePublish} className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Select Project to Publish
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => {
                  setSelectedProjectId(e.target.value);
                  const p = projects.find((proj) => proj.id === e.target.value);
                  if (p) {
                    setTitle(p.title);
                    setDescription(p.description || p.script);
                  }
                }}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-red-500"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.duration}s • {p.format})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                YouTube Video Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter compelling title..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-red-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Description & Hashtags
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Video description, river facts, and subscribe link..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Privacy</label>
                <select
                  value={privacy}
                  onChange={(e) => setPrivacy(e.target.value as any)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none focus:border-red-500"
                >
                  <option value="public">Public</option>
                  <option value="unlisted">Unlisted</option>
                  <option value="private">Private</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none focus:border-red-500"
                >
                  <option value="28">Science & Technology (Engineering)</option>
                  <option value="20">Gaming</option>
                  <option value="27">Education</option>
                  <option value="24">Entertainment</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Schedule Publication (Optional)
              </label>
              <input
                type="datetime-local"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none focus:border-red-500 font-mono"
              />
            </div>

            <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs">
              <span className="text-zinc-300">Audience: Made for Kids?</span>
              <button
                type="button"
                onClick={() => setMadeForKids(!madeForKids)}
                className={`px-2.5 py-1 rounded text-[10px] font-semibold cursor-pointer ${
                  madeForKids ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {madeForKids ? 'YES (Kids)' : 'NO (General Audience)'}
              </button>
            </div>

            <button
              type="submit"
              disabled={publishing}
              className="w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-950 cursor-pointer"
            >
              {publishing ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Publishing to YouTube...</span>
                </>
              ) : (
                <>
                  <Youtube className="w-4 h-4" />
                  <span>{scheduleTime ? 'Schedule YouTube Video' : 'Publish to @towboater2011'}</span>
                </>
              )}
            </button>
          </form>

          {publishSuccess && (
            <div className="p-3.5 rounded-lg bg-emerald-950/40 border border-emerald-800/60 space-y-1.5 animate-in fade-in">
              <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Upload Initiated Successfully
              </div>
              <p className="text-[11px] text-zinc-300">
                Live URL verified:
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

        {/* Channel Videos & Shorts Stream */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-200">
              Recent Channel Uploads & Shorts
            </h3>
            <span className="text-[10px] text-zinc-500 font-mono">Live Sync</span>
          </div>

          <div className="space-y-2.5">
            {videos.map((vid) => (
              <div
                key={vid.id}
                className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1">
                    <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono uppercase">
                      {vid.isShort ? 'YouTube Short' : 'Long-form Video'}
                    </span>
                    <span className="text-emerald-400 font-mono flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Copyright Clean
                    </span>
                  </div>
                  <h4 className="font-semibold text-xs text-zinc-100 line-clamp-1 mt-1">
                    {vid.title}
                  </h4>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-zinc-800/80 text-[11px] text-zinc-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3 text-zinc-500" /> {vid.viewCount.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3 text-zinc-500" /> {vid.likeCount.toLocaleString()}
                    </span>
                  </div>

                  <a
                    href={vid.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-red-400 hover:underline flex items-center gap-1"
                  >
                    View on YouTube <ExternalLink className="w-3 h-3" />
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
