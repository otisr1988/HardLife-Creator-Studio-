import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  Scissors,
  FolderOpen,
  Lightbulb,
  Calendar,
  Youtube,
  Share2,
  BarChart3,
  Bot,
  Zap,
  Settings,
} from 'lucide-react';
import type { StudioTab } from '../types';

interface SidebarProps {
  currentTab: StudioTab;
  onSelectTab: (tab: StudioTab) => void;
  projectsCount: number;
  scheduledCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  projectsCount,
  scheduledCount,
}) => {
  const navItems: Array<{
    id: StudioTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
    badgeColor?: string;
  }> = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'ai_creator', label: 'AI Video Creator', icon: Sparkles, badge: 'Auto', badgeColor: 'bg-cyan-950 text-cyan-400 border border-cyan-800' },
    { id: 'editor', label: 'Video Editor', icon: Scissors },
    { id: 'media', label: 'Media Library', icon: FolderOpen },
    { id: 'ideas', label: 'Content Ideas', icon: Lightbulb },
    { id: 'calendar', label: 'Publishing Calendar', icon: Calendar, badge: scheduledCount > 0 ? scheduledCount : undefined, badgeColor: 'bg-indigo-950 text-indigo-300 border border-indigo-800' },
    { id: 'youtube', label: 'YouTube Studio', icon: Youtube, badge: '@towboater', badgeColor: 'bg-red-950/60 text-red-400 border border-red-800/40' },
    { id: 'tiktok', label: 'TikTok Studio', icon: Share2, badge: '@otis0239', badgeColor: 'bg-cyan-950/60 text-cyan-400 border border-cyan-800/40' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'automations', label: 'Automations', icon: Zap, badge: 'Active', badgeColor: 'bg-amber-950/60 text-amber-400 border border-amber-800/40' },
    { id: 'mcp', label: 'ChatGPT MCP', icon: Bot, badge: '16 Tools', badgeColor: 'bg-purple-950/60 text-purple-300 border border-purple-800/40' },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Desktop & Tablet Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-zinc-800/80 bg-zinc-950/60 p-3 shrink-0 select-none">
        <div className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase px-3 py-2">
          Studio Navigation
        </div>
        <nav className="space-y-1 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-950/80 to-zinc-900 text-cyan-300 border border-cyan-800/50 shadow-sm shadow-cyan-950'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-zinc-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${item.badgeColor || 'bg-zinc-800 text-zinc-300'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom system footer */}
        <div className="pt-3 border-t border-zinc-800/80 text-[11px] text-zinc-400 space-y-1.5 px-3">
          <div className="flex items-center justify-between">
            <span>FFmpeg 4.4 Engine</span>
            <span className="text-emerald-400 font-mono">OK</span>
          </div>
          <div className="flex items-center justify-between">
            <span>ChatGPT MCP Protocol</span>
            <span className="text-purple-400 font-mono">v1.0 Ready</span>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (iPhone friendly) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-zinc-950/95 border-t border-zinc-800/80 backdrop-blur-lg flex items-center justify-around px-2 z-40">
        {[
          { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard },
          { id: 'ai_creator' as const, label: 'AI Create', icon: Sparkles },
          { id: 'ideas' as const, label: 'Ideas', icon: Lightbulb },
          { id: 'editor' as const, label: 'Editor', icon: Scissors },
          { id: 'youtube' as const, label: 'YouTube', icon: Youtube },
          { id: 'settings' as const, label: 'Settings', icon: Settings },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center gap-1 w-12 py-1 transition-all ${
                isActive ? 'text-cyan-400' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
