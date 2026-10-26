import React from 'react';
import {
  Video,
  Eye,
  Users,
  Calendar,
  Sparkles,
  ExternalLink,
  Play,
  Clock,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Scissors,
  Zap,
} from 'lucide-react';
import type { VideoProject, Publication, ConnectedAccount, StudioTab } from '../../types';

interface OverviewViewProps {
  projects: VideoProject[];
  publications: Publication[];
  connectedAccounts: ConnectedAccount[];
  onSelectTab: (tab: StudioTab) => void;
  onOpenProject: (projectId: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  projects,
  publications,
  connectedAccounts,
  onSelectTab,
  onOpenProject,
}) => {
  const ytAccount = connectedAccounts.find((a) => a.platform === 'youtube');
  const ttAccount = connectedAccounts.find((a) => a.platform === 'tiktok');

  const scheduledPubs = publications.filter((p) => p.status === 'scheduled');
  const publishedPubs = publications.filter((p) => p.status === 'published');

  return (
    <div className="space-y-6">
      {/* Top Banner / Channel Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* YouTube @towboater2011 Card */}
        <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-red-900/30 relative overflow-hidden shadow-lg shadow-black/40">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-950/80 border border-red-800/60 flex items-center justify-center text-red-400 font-bold">
                YT
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-zinc-100">YouTube Studio</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Connected
                  </span>
                </div>
                <p className="text-xs text-red-400 font-mono">@towboater2011</p>
              </div>
            </div>
            <button
              onClick={() => onSelectTab('youtube')}
              className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 cursor-pointer"
            >
              Open Studio <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-zinc-800/60 text-center">
            <div>
              <div className="text-lg font-bold text-zinc-100">
                {ytAccount?.subscriberCount?.toLocaleString() || '24,300'}
              </div>
              <div className="text-[11px] text-zinc-400">Subscribers</div>
            </div>
            <div>
              <div className="text-lg font-bold text-zinc-100">
                {(ytAccount?.totalViews || 4120000).toLocaleString()}
              </div>
              <div className="text-[11px] text-zinc-400">Total Views</div>
            </div>
            <div>
              <div className="text-lg font-bold text-emerald-400 flex items-center justify-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" /> +18.4%
              </div>
              <div className="text-[11px] text-zinc-400">30d Growth</div>
            </div>
          </div>
        </div>

        {/* TikTok @otis0239 Card */}
        <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-cyan-900/30 relative overflow-hidden shadow-lg shadow-black/40">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-600/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400 font-bold">
                TT
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-zinc-100">TikTok Studio</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Metricool Bridge Active
                  </span>
                </div>
                <p className="text-xs text-cyan-400 font-mono">@otis0239</p>
              </div>
            </div>
            <button
              onClick={() => onSelectTab('tiktok')}
              className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 cursor-pointer"
            >
              Open Studio <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-zinc-800/60 text-center">
            <div>
              <div className="text-lg font-bold text-zinc-100">
                {ttAccount?.followerCount?.toLocaleString() || '18,900'}
              </div>
              <div className="text-[11px] text-zinc-400">Followers</div>
            </div>
            <div>
              <div className="text-lg font-bold text-zinc-100">
                {(ttAccount?.totalViews || 2850000).toLocaleString()}
              </div>
              <div className="text-[11px] text-zinc-400">Total Views</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-400">
                1m+ Ready
              </div>
              <div className="text-[11px] text-zinc-400">Rewards Tier</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => onSelectTab('ai_creator')}
          className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-cyan-500/50 hover:bg-zinc-900 transition-all text-left flex flex-col justify-between cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800/50 flex items-center justify-center text-cyan-400 mb-3 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-xs text-zinc-200">AI Video Creator</div>
            <div className="text-[10px] text-zinc-400">Generate prompt to MP4</div>
          </div>
        </button>

        <button
          onClick={() => onSelectTab('editor')}
          className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-indigo-500/50 hover:bg-zinc-900 transition-all text-left flex flex-col justify-between cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-950/80 border border-indigo-800/50 flex items-center justify-center text-indigo-400 mb-3 group-hover:scale-105 transition-transform">
            <Scissors className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-xs text-zinc-200">Timeline Editor</div>
            <div className="text-[10px] text-zinc-400">Cut, captions & audio</div>
          </div>
        </button>

        <button
          onClick={() => onSelectTab('calendar')}
          className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-purple-500/50 hover:bg-zinc-900 transition-all text-left flex flex-col justify-between cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-800/50 flex items-center justify-center text-purple-400 mb-3 group-hover:scale-105 transition-transform">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-xs text-zinc-200">Content Calendar</div>
            <div className="text-[10px] text-zinc-400">{scheduledPubs.length} scheduled</div>
          </div>
        </button>

        <button
          onClick={() => onSelectTab('mcp')}
          className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-900 transition-all text-left flex flex-col justify-between cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-800/50 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-105 transition-transform">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-xs text-zinc-200">ChatGPT MCP</div>
            <div className="text-[10px] text-zinc-400">16 tools active</div>
          </div>
        </button>
      </div>

      {/* Current Projects & Queue */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
            <Video className="w-4 h-4 text-cyan-400" /> Video Projects ({projects.length})
          </h2>
          <button
            onClick={() => onSelectTab('editor')}
            className="text-xs text-cyan-400 hover:underline cursor-pointer"
          >
            View all projects
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                    {proj.category}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      proj.status === 'rendered'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : proj.status === 'rendering'
                        ? 'bg-purple-950 text-purple-400 border border-purple-800 animate-pulse'
                        : 'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    {proj.status}
                  </span>
                </div>

                <h3 className="font-semibold text-sm text-zinc-100 mt-2 line-clamp-1">
                  {proj.title}
                </h3>
                <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                  {proj.description || proj.script}
                </p>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-800 text-xs">
                <div className="text-zinc-400 flex items-center gap-2">
                  <span className="font-mono">{proj.duration}s</span>
                  <span>•</span>
                  <span>{proj.format.replace('_', ' ')}</span>
                </div>

                <div className="flex items-center gap-2">
                  {proj.renderedUrl && (
                    <a
                      href={proj.renderedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Play className="w-3 h-3 text-cyan-400" /> Watch MP4
                    </a>
                  )}
                  <button
                    onClick={() => onOpenProject(proj.id)}
                    className="px-2.5 py-1 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 text-xs font-medium cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Publications / Content Distribution */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" /> Publishing Queue & Verified Releases
          </h2>
          <button
            onClick={() => onSelectTab('calendar')}
            className="text-xs text-purple-400 hover:underline cursor-pointer"
          >
            Open Calendar
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/50">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900 text-zinc-400 uppercase text-[10px] border-b border-zinc-800">
              <tr>
                <th className="py-2.5 px-4">Video Title</th>
                <th className="py-2.5 px-4">Platform</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Scheduled / Published</th>
                <th className="py-2.5 px-4">Verified Live URL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80 text-zinc-300">
              {publications.map((pub) => (
                <tr key={pub.id} className="hover:bg-zinc-800/30">
                  <td className="py-3 px-4 font-medium text-zinc-100 max-w-xs truncate">
                    {pub.title}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-xs">
                      {pub.platform === 'youtube' ? (
                        <span className="text-red-400 font-semibold">YouTube</span>
                      ) : (
                        <span className="text-cyan-400 font-semibold">TikTok</span>
                      )}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        pub.status === 'published'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : pub.status === 'scheduled'
                          ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {pub.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-zinc-400 font-mono text-[11px]">
                    {pub.scheduledTime
                      ? new Date(pub.scheduledTime).toLocaleString()
                      : pub.publishedTime
                      ? new Date(pub.publishedTime).toLocaleString()
                      : 'Draft'}
                  </td>
                  <td className="py-3 px-4">
                    {pub.externalUrl ? (
                      <a
                        href={pub.externalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:underline flex items-center gap-1 font-mono text-xs"
                      >
                        Verify Live Link <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-zinc-500 italic">Pending render/upload</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
