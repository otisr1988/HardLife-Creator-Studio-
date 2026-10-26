import React from 'react';
import {
  ShieldCheck,
  Video,
  Sparkles,
  Layers,
  Radio,
  ExternalLink,
  Lock,
  Cpu,
} from 'lucide-react';
import { CONFIGURED_OWNER_EMAIL } from '../lib/security';
import type { StudioTab } from '../types';

interface HeaderProps {
  currentTab: StudioTab;
  onSelectTab: (tab: StudioTab) => void;
  activeRendersCount: number;
  userEmail: string | null;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  activeRendersCount,
  userEmail,
  onOpenAuth,
}) => {
  const isOwner = userEmail?.toLowerCase() === CONFIGURED_OWNER_EMAIL.toLowerCase();

  return (
    <header className="h-16 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onSelectTab('overview')}>
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 via-indigo-600 to-purple-600 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-zinc-950 rounded-[7px] flex items-center justify-center">
              <Video className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-zinc-100 flex items-center gap-1.5">
                HardLife <span className="text-cyan-400 font-semibold text-xs px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40">STUDIO</span>
              </h1>
            </div>
            <p className="text-[10px] text-zinc-400 hidden sm:block">
              Private AI Video Production & Publishing
            </p>
          </div>
        </div>

        {/* Target accounts indicator */}
        <div className="hidden lg:flex items-center gap-2 ml-4 pl-4 border-l border-zinc-800 text-xs">
          <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
            YouTube: <span className="text-red-400 font-medium">@towboater2011</span>
          </span>
          <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            TikTok: <span className="text-cyan-400 font-medium">@otis0239</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Render worker badge */}
        {activeRendersCount > 0 ? (
          <div
            onClick={() => onSelectTab('editor')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 text-xs font-medium cursor-pointer animate-pulse hover:border-purple-400"
          >
            <Cpu className="w-3.5 h-3.5 text-purple-400 animate-spin" />
            <span>FFmpeg Rendering ({activeRendersCount})</span>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            FFmpeg 4.4 Engine Ready
          </div>
        )}

        {/* AI Creator button */}
        <button
          onClick={() => onSelectTab('ai_creator')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/20 transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New AI Video</span>
          <span className="sm:hidden">AI Video</span>
        </button>

        {/* Owner Security Badge */}
        <div
          onClick={onOpenAuth}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer transition-all ${
            isOwner
              ? 'bg-zinc-900 border-cyan-500/40 text-zinc-200 hover:border-cyan-400'
              : 'bg-amber-950/40 border-amber-800/60 text-amber-300 hover:bg-amber-900/40'
          }`}
          title={isOwner ? `Verified Single Owner: ${CONFIGURED_OWNER_EMAIL}` : 'Sign in as Owner'}
        >
          {isOwner ? (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-medium hidden md:inline">Owner Verified</span>
              <span className="text-[10px] text-cyan-300/80 hidden xl:inline">({CONFIGURED_OWNER_EMAIL})</span>
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-medium">Owner Lock</span>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
