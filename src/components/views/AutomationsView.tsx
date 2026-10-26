import React, { useState } from 'react';
import {
  Zap,
  Plus,
  Play,
  RotateCw,
  CheckCircle2,
  DollarSign,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Sliders,
} from 'lucide-react';
import type { AutomationRule } from '../../types';

interface AutomationsViewProps {
  automations: AutomationRule[];
  onToggleAutomation: (id: string, enabled: boolean) => void;
  onTriggerNow: (ruleId: string) => void;
  onCreateAutomation: (rule: Partial<AutomationRule>) => void;
}

export const AutomationsView: React.FC<AutomationsViewProps> = ({
  automations,
  onToggleAutomation,
  onTriggerNow,
  onCreateAutomation,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'towboats' | 'gaming' | 'tarot' | 'facts'>('towboats');
  const [frequency, setFrequency] = useState<'daily' | 'weekly_3' | 'weekly_5'>('daily');
  const [duration, setDuration] = useState(55);
  const [targetPlatforms, setTargetPlatforms] = useState<Array<'youtube' | 'tiktok'>>(['youtube', 'tiktok']);
  const [approvalRequired, setApprovalRequired] = useState(true);
  const [monthlyCap, setMonthlyCap] = useState(25.0);

  const totalMonthlySpend = automations.reduce((sum, a) => sum + (a.currentMonthSpend || 0), 0);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreateAutomation({
      name,
      category,
      frequency,
      targetDuration: duration,
      targetPlatforms,
      approvalRequired,
      monthlyBudgetCap: monthlyCap,
      enabled: true,
    });

    setShowCreateModal(false);
    setName('');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-zinc-900 border border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" /> Automated Content Production
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 font-mono">
              Server Daemon Active
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Independent background scheduler generates, renders, and distributes videos on a recurring cadence.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-amber-950 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> New Automation Rule
        </button>
      </div>

      {/* Monthly Budget & Spending Cap */}
      <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-800 flex items-center justify-center text-emerald-400 font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-zinc-200">
              Monthly Automation Compute & AI Cap
            </div>
            <div className="text-[11px] text-zinc-400">
              Current Spend: <span className="font-mono text-emerald-400 font-bold">${totalMonthlySpend.toFixed(2)}</span> / $25.00 Cap
            </div>
          </div>
        </div>

        <div className="w-full sm:w-64 bg-zinc-950 h-2.5 rounded-full overflow-hidden border border-zinc-800">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all"
            style={{ width: `${Math.min(100, (totalMonthlySpend / 25.0) * 100)}%` }}
          />
        </div>
      </div>

      {/* Automation Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {automations.map((auto) => (
          <div
            key={auto.id}
            className={`p-5 rounded-xl border transition-all flex flex-col justify-between ${
              auto.enabled
                ? 'bg-zinc-900/90 border-zinc-700'
                : 'bg-zinc-950 border-zinc-800/80 opacity-75'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                    {auto.category}
                  </span>
                  <h3 className="text-sm font-bold text-zinc-100 mt-2">{auto.name}</h3>
                </div>

                <button
                  onClick={() => onToggleAutomation(auto.id, !auto.enabled)}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer transition-all ${
                    auto.enabled
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                  }`}
                >
                  {auto.enabled ? 'ACTIVE' : 'PAUSED'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-zinc-800/80 text-[11px] text-zinc-400 font-mono">
                <div>
                  Cadence: <span className="text-zinc-200 capitalize">{auto.frequency.replace('_', ' ')}</span>
                </div>
                <div>
                  Duration: <span className="text-zinc-200">{auto.targetDuration}s</span>
                </div>
                <div>
                  Platforms: <span className="text-zinc-200">{auto.targetPlatforms.join(', ')}</span>
                </div>
                <div>
                  Approval: <span className={auto.approvalRequired ? 'text-amber-400 font-semibold' : 'text-emerald-400'}>
                    {auto.approvalRequired ? 'Mandatory' : 'Auto-Publish'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-800 text-xs">
              <span className="text-[11px] text-zinc-500 font-mono">
                Month Spend: ${auto.currentMonthSpend?.toFixed(3) || '0.000'}
              </span>

              <button
                onClick={() => onTriggerNow(auto.id)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" /> Run Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5 max-w-md w-full space-y-4">
            <h3 className="text-sm font-bold text-zinc-100">Create Production Automation Rule</h3>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-300 font-semibold block mb-1">Rule Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Daily Mississippi Towboat Highlights"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-200"
                  >
                    <option value="towboats">Towboats & Heavy Eq.</option>
                    <option value="gaming">GTA & Gaming</option>
                    <option value="tarot">Tarot Readings</option>
                    <option value="facts">Viral Facts</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Cadence</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-200"
                  >
                    <option value="daily">Daily (7/week)</option>
                    <option value="weekly_3">3 Times a Week</option>
                    <option value="weekly_5">5 Times a Week</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-zinc-300 font-semibold block mb-1">
                  Target Duration: {duration} seconds
                </label>
                <input
                  type="range"
                  min={30}
                  max={90}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div className="p-3 rounded bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-zinc-200 block">Require Creator Approval</span>
                  <span className="text-[10px] text-zinc-400">Generate draft; wait for your green light</span>
                </div>
                <input
                  type="checkbox"
                  checked={approvalRequired}
                  onChange={(e) => setApprovalRequired(e.target.checked)}
                  className="rounded text-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 rounded bg-zinc-800 text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold"
                >
                  Create Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
