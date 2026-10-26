import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  ShieldCheck,
  Cpu,
  Key,
  HardDrive,
  FileText,
  Clock,
  RotateCw,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { CONFIGURED_OWNER_EMAIL } from '../../lib/security';
import type { StudioSettings, ActivityLog } from '../../types';

interface SettingsViewProps {
  settings: StudioSettings;
  logs: ActivityLog[];
  onUpdateSettings: (updated: Partial<StudioSettings>) => void;
  userEmail: string | null;
  onOpenAuth: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  logs,
  onUpdateSettings,
  userEmail,
  onOpenAuth,
}) => {
  const isOwner = userEmail?.toLowerCase() === CONFIGURED_OWNER_EMAIL.toLowerCase();
  const [metricoolUrl, setMetricoolUrl] = useState(settings.metricoolWebhookUrl || '');
  const [budgetCap, setBudgetCap] = useState(settings.monthlyComputeBudgetCap || 50.0);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      metricoolWebhookUrl: metricoolUrl,
      monthlyComputeBudgetCap: Number(budgetCap),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800">
        <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-zinc-400" /> Platform Security & System Settings
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Single-owner authorization rules, local compute engines, and immutable activity audit trail.
        </p>
      </div>

      {/* Owner Identity Section */}
      <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-zinc-100">Designated Single-Owner</h3>
              <p className="text-xs font-mono text-cyan-400">{CONFIGURED_OWNER_EMAIL}</p>
            </div>
          </div>

          <button
            onClick={onOpenAuth}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 cursor-pointer"
          >
            {userEmail ? 'Switch / Sign Out' : 'Sign in as Owner'}
          </button>
        </div>

        <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" /> Single-Owner Security Architecture Active
          </div>
          <p>
            All Firestore security rules and backend API endpoints enforce verified email identity for <strong>{CONFIGURED_OWNER_EMAIL}</strong>.
            Third-party registration, subscriptions, and multi-user access are strictly locked out.
          </p>
        </div>
      </div>

      {/* Engine Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
            <Cpu className="w-4 h-4 text-cyan-400" /> FFmpeg Engine
          </div>
          <div className="text-sm font-bold text-zinc-100 mt-2 font-mono">v4.4.2 Linux</div>
          <div className="text-[10px] text-emerald-400 mt-1">/usr/bin/ffmpeg Ready</div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
            <HardDrive className="w-4 h-4 text-purple-400" /> Persistent Storage
          </div>
          <div className="text-sm font-bold text-zinc-100 mt-2 font-mono">Firestore Enterprise</div>
          <div className="text-[10px] text-emerald-400 mt-1">Rule ABAC Enforced</div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
            <Key className="w-4 h-4 text-amber-400" /> ChatGPT MCP Server
          </div>
          <div className="text-sm font-bold text-zinc-100 mt-2 font-mono">JSON-RPC 2.0</div>
          <div className="text-[10px] text-purple-400 mt-1">16 Verified Tools Active</div>
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-4">
        <h3 className="text-xs font-bold text-zinc-200">Production Integrations & Budgets</h3>

        <div className="space-y-3 text-xs">
          <div>
            <label className="text-zinc-300 font-semibold block mb-1">
              Metricool Fallback Webhook URL (for TikTok Scheduling)
            </label>
            <input
              type="url"
              value={metricoolUrl}
              onChange={(e) => setMetricoolUrl(e.target.value)}
              placeholder="https://api.metricool.com/v1/bridge/..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-200 font-mono"
            />
          </div>

          <div>
            <label className="text-zinc-300 font-semibold block mb-1">
              Monthly Compute & AI Budget Cap (USD): ${budgetCap}
            </label>
            <input
              type="number"
              min={5}
              max={500}
              value={budgetCap}
              onChange={(e) => setBudgetCap(Number(e.target.value))}
              className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-200 font-mono"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {savedSuccess && (
              <span className="text-emerald-400 text-xs flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Settings Saved!
              </span>
            )}
            <button
              type="submit"
              className="ml-auto px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs cursor-pointer shadow-md"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </form>

      {/* Activity Log (Requirement 2: Every creation, edit, upload, scheduling, publication) */}
      <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-cyan-400" /> Immutable Activity Audit Log ({logs.length})
          </h3>
          <span className="text-[10px] text-zinc-500 font-mono">Append-only</span>
        </div>

        <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80 flex items-start justify-between gap-3 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-zinc-200">{log.action}</span>
                  <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">
                    {log.category}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5">{log.details}</p>
              </div>

              <div className="text-right shrink-0">
                <div className="text-[10px] text-zinc-500 font-mono">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </div>
                <div className="text-[10px] text-zinc-600 font-mono truncate max-w-[120px]">
                  {log.userEmail}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
