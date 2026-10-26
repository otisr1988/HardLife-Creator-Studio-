import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Eye,
  Clock,
  Users,
  Share2,
  Youtube,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import type { ConnectedAccount } from '../../types';

interface AnalyticsViewProps {
  accounts: ConnectedAccount[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ accounts }) => {
  const yt = accounts.find((a) => a.platform === 'youtube');
  const tt = accounts.find((a) => a.platform === 'tiktok');

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800">
        <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-cyan-400" /> Unified Cross-Platform Analytics
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Performance metrics aggregated across <strong>YouTube (@towboater2011)</strong> and <strong>TikTok (@otis0239)</strong>.
        </p>
      </div>

      {/* Aggregate KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
          <div className="text-[11px] text-zinc-400 uppercase font-mono">Combined Views</div>
          <div className="text-2xl font-extrabold text-zinc-100 mt-1">6,970,000</div>
          <div className="text-[10px] text-emerald-400 flex items-center gap-0.5 mt-1">
            <TrendingUp className="w-3 h-3" /> +24.8% past 30 days
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
          <div className="text-[11px] text-zinc-400 uppercase font-mono">Total Audience</div>
          <div className="text-2xl font-extrabold text-zinc-100 mt-1">43,200</div>
          <div className="text-[10px] text-cyan-400 mt-1">
            24.3k YT • 18.9k TikTok
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
          <div className="text-[11px] text-zinc-400 uppercase font-mono">Avg Watch Time</div>
          <div className="text-2xl font-extrabold text-zinc-100 mt-1">84.2%</div>
          <div className="text-[10px] text-emerald-400 mt-1">
            Top tier Shorts retention
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
          <div className="text-[11px] text-zinc-400 uppercase font-mono">TikTok Rewards Est.</div>
          <div className="text-2xl font-extrabold text-purple-400 mt-1">$1,420</div>
          <div className="text-[10px] text-purple-300 mt-1">
            Qualified 1m+ original videos
          </div>
        </div>
      </div>

      {/* Retention Curve Simulator / Inspection */}
      <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-zinc-200">
            Short-Form Audience Retention Curve (Towboats vs Gaming)
          </h3>
          <span className="text-[10px] font-mono text-zinc-400">0s to 60s Playback</span>
        </div>

        <div className="h-40 flex items-end gap-2 pt-6 border-b border-zinc-800 relative">
          {[
            { sec: '0s', pct: 100 },
            { sec: '5s', pct: 92 },
            { sec: '10s', pct: 88 },
            { sec: '15s', pct: 85 },
            { sec: '20s', pct: 82 },
            { sec: '25s', pct: 79 },
            { sec: '30s', pct: 76 },
            { sec: '40s', pct: 74 },
            { sec: '50s', pct: 71 },
            { sec: '60s', pct: 68 },
          ].map((bar, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <span className="text-[9px] font-mono text-cyan-400">{bar.pct}%</span>
              <div
                className="w-full bg-gradient-to-t from-cyan-600 to-indigo-500 rounded-t transition-all"
                style={{ height: `${bar.pct}%` }}
              />
              <span className="text-[9px] font-mono text-zinc-500">{bar.sec}</span>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-zinc-400">
          Retention holds steady at 68% past the 60-second mark, qualifying long clips for TikTok Creator Rewards and maximizing YouTube algorithm re-recommendation.
        </p>
      </div>
    </div>
  );
};
