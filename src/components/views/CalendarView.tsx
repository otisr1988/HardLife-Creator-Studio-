import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Youtube,
  Share2,
  ExternalLink,
  Plus,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import type { Publication, VideoProject } from '../../types';

interface CalendarViewProps {
  publications: Publication[];
  projects: VideoProject[];
  onScheduleNew: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  publications,
  projects,
  onScheduleNew,
}) => {
  const [filterPlatform, setFilterPlatform] = useState<'all' | 'youtube' | 'tiktok'>('all');

  const filtered = publications.filter(
    (p) => filterPlatform === 'all' || p.platform === filterPlatform || (filterPlatform === 'tiktok' && p.platform === 'metricool_bridge')
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-zinc-900 border border-zinc-800">
        <div>
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-purple-400" /> Multi-Platform Publishing Calendar
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Automated schedule manager for YouTube (@towboater2011) and TikTok (@otis0239).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-xs">
            {(['all', 'youtube', 'tiktok'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setFilterPlatform(p)}
                className={`px-3 py-1 rounded-md capitalize cursor-pointer font-medium ${
                  filterPlatform === p
                    ? 'bg-zinc-800 text-zinc-100'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={onScheduleNew}
            className="px-3 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-purple-950 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Schedule Video
          </button>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="space-y-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  item.platform === 'youtube'
                    ? 'bg-red-950/80 border border-red-800 text-red-400'
                    : 'bg-cyan-950/80 border border-cyan-800 text-cyan-400'
                }`}
              >
                {item.platform === 'youtube' ? <Youtube className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-100">{item.title}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      item.status === 'published'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : item.status === 'scheduled'
                        ? 'bg-purple-950 text-purple-300 border border-purple-800'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {item.status.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-zinc-400 mt-1 font-mono">
                  <span>Channel: {item.channelHandle}</span>
                  <span>•</span>
                  <span>Privacy: {item.privacy}</span>
                  {item.platform === 'metricool_bridge' && (
                    <>
                      <span>•</span>
                      <span className="text-cyan-400">Via Metricool Bridge</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs shrink-0">
              <div className="text-right">
                <div className="text-[11px] text-zinc-400 font-mono flex items-center gap-1 justify-end">
                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                  {item.scheduledTime
                    ? new Date(item.scheduledTime).toLocaleString()
                    : item.publishedTime
                    ? new Date(item.publishedTime).toLocaleString()
                    : 'Draft'}
                </div>
              </div>

              {item.externalUrl && (
                <a
                  href={item.externalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-cyan-400 font-medium text-xs flex items-center gap-1 cursor-pointer"
                >
                  Verify URL <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
