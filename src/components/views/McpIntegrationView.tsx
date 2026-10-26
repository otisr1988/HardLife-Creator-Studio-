import React, { useState, useEffect } from 'react';
import {
  Bot,
  Key,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Code,
  Terminal,
  Play,
  RotateCw,
  ExternalLink,
  Lock,
  Layers,
  Settings,
  AlertCircle,
} from 'lucide-react';
import { MCP_TOOLS } from '../../lib/mcp-schema';
import type { StudioSettings } from '../../types';

interface McpIntegrationViewProps {
  settings: StudioSettings;
  onUpdateSettings: (updated: Partial<StudioSettings>) => void;
}

export const McpIntegrationView: React.FC<McpIntegrationViewProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedManifest, setCopiedManifest] = useState(false);

  // Tool tester state
  const [selectedTool, setSelectedTool] = useState('list_projects');
  const [testArgs, setTestArgs] = useState('{\n  "limit": 5\n}');
  const [runningTest, setRunningTest] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);

  const mcpEndpointUrl = `${window.location.origin}/api/mcp`;

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunToolTest = async () => {
    setRunningTest(true);
    setTestResult(null);

    let parsedArgs = {};
    try {
      parsedArgs = JSON.parse(testArgs);
    } catch (e: any) {
      alert('Invalid JSON in arguments: ' + e.message);
      setRunningTest(false);
      return;
    }

    try {
      const res = await fetch('/api/mcp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.mcpApiKey}`,
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/call',
          params: {
            name: selectedTool,
            arguments: parsedArgs,
          },
        }),
      });

      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({ error: err.message });
    } finally {
      setRunningTest(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-purple-950/50 via-zinc-900 to-zinc-950 border border-purple-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-purple-600 flex items-center justify-center text-white font-extrabold shadow-lg shadow-purple-600/30">
            <Bot className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-zinc-100">Model Context Protocol (MCP) Server</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" /> Remotely Accessible Endpoint
              </span>
            </div>
            <p className="text-xs text-purple-300 mt-0.5">
              Secure bridge enabling ChatGPT to create, edit, schedule, and publish videos autonomously.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-center px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800">
            <div className="text-sm font-bold text-purple-400 font-mono">16 Tools</div>
            <div className="text-[10px] text-zinc-400">Registered Schemas</div>
          </div>
          <div className="text-center px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800">
            <div className="text-sm font-bold text-emerald-400 font-mono">JSON-RPC 2.0</div>
            <div className="text-[10px] text-zinc-400">Standard Spec</div>
          </div>
        </div>
      </div>

      {/* Endpoint & Credentials Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Remote Endpoint */}
        <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
          <label className="text-xs font-semibold text-zinc-300 block">
            1. Authenticated HTTPS Endpoint URL
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={mcpEndpointUrl}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-300 font-mono focus:outline-none"
            />
            <button
              onClick={() => copyToClipboard(mcpEndpointUrl, setCopiedUrl)}
              className="p-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 cursor-pointer shrink-0"
              title="Copy URL"
            >
              {copiedUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[11px] text-zinc-500">
            Provide this HTTPS URL to ChatGPT or your custom MCP client. Supports POST JSON-RPC.
          </p>
        </div>

        {/* API Key */}
        <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
          <label className="text-xs font-semibold text-zinc-300 block">
            2. Secret MCP Access Token (Bearer Key)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="password"
              readOnly
              value={settings.mcpApiKey}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-300 font-mono focus:outline-none"
            />
            <button
              onClick={() => copyToClipboard(settings.mcpApiKey, setCopiedKey)}
              className="p-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 cursor-pointer shrink-0"
              title="Copy API Key"
            >
              {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[11px] text-zinc-500">
            Pass as <code className="text-cyan-400">Authorization: Bearer [KEY]</code> or <code className="text-cyan-400">x-mcp-api-key: [KEY]</code>.
          </p>
        </div>
      </div>

      {/* Approval Policy Mode */}
      <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-zinc-200 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" /> ChatGPT Action Approval Policy
          </h3>
          <span className="text-[10px] text-zinc-400 font-mono">Enforced Server-Side</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            onClick={() => onUpdateSettings({ approvalMode: 'review_before_publishing' })}
            className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
              settings.approvalMode === 'review_before_publishing'
                ? 'bg-cyan-950/80 border-cyan-500 text-cyan-100 shadow-sm'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-zinc-100">Review Before Publishing (Recommended)</span>
              {settings.approvalMode === 'review_before_publishing' && (
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              )}
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">
              ChatGPT can create, transcribe, analyze, edit, and render videos. Publishing to YouTube or TikTok requires your final click in the dashboard.
            </p>
          </button>

          <button
            onClick={() => onUpdateSettings({ approvalMode: 'auto_publish' })}
            className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
              settings.approvalMode === 'auto_publish'
                ? 'bg-purple-950/80 border-purple-500 text-purple-100 shadow-sm'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-zinc-100">Automatic Publishing Under Standing Auth</span>
              {settings.approvalMode === 'auto_publish' && (
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
              )}
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">
              ChatGPT can schedule and immediately publish rendered videos. Destructive deletions and security modifications still strictly require human authorization.
            </p>
          </button>
        </div>
      </div>

      {/* Interactive Tool Tester & Simulator */}
      <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-bold text-zinc-200">Interactive MCP Tool Tester</h3>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">Test tools without opening ChatGPT</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-4 space-y-3">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Select Tool to Test
              </label>
              <select
                value={selectedTool}
                onChange={(e) => {
                  setSelectedTool(e.target.value);
                  if (e.target.value === 'list_projects') {
                    setTestArgs('{\n  "status": "all",\n  "limit": 5\n}');
                  } else if (e.target.value === 'get_video_analytics') {
                    setTestArgs('{\n  "platform": "youtube",\n  "days": 30\n}');
                  } else if (e.target.value === 'create_video_project') {
                    setTestArgs('{\n  "title": "Upper Mississippi High Water Currents",\n  "category": "towboats",\n  "format": "shorts_9_16"\n}');
                  } else if (e.target.value === 'generate_short') {
                    setTestArgs('{\n  "topic": "Why Stopping 36 Loaded Barges Takes 1 Mile",\n  "category": "towboats",\n  "durationSeconds": 50\n}');
                  } else {
                    setTestArgs('{}');
                  }
                }}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none focus:border-purple-500 font-mono"
              >
                {MCP_TOOLS.map((t) => (
                  <option key={t.name} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                JSON Arguments
              </label>
              <textarea
                value={testArgs}
                onChange={(e) => setTestArgs(e.target.value)}
                rows={6}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-cyan-300 font-mono focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              onClick={handleRunToolTest}
              disabled={runningTest}
              className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-purple-950 cursor-pointer"
            >
              {runningTest ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Dispatching Tool...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Execute MCP Tool</span>
                </>
              )}
            </button>
          </div>

          <div className="lg:col-span-8 space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 block">
              Structured Tool Output (JSON-RPC 2.0 Response)
            </label>
            <div className="w-full h-[250px] bg-zinc-950 border border-zinc-800 rounded-lg p-3 font-mono text-[11px] text-zinc-300 overflow-auto">
              {testResult ? (
                <pre>{JSON.stringify(testResult, null, 2)}</pre>
              ) : (
                <div className="text-zinc-600 italic flex items-center justify-center h-full">
                  Click 'Execute MCP Tool' to inspect live response payload.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Instructions for ChatGPT Setup */}
      <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
        <h3 className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
          <Code className="w-4 h-4 text-cyan-400" /> How to Connect HardLife MCP Server to ChatGPT
        </h3>
        <div className="space-y-2 text-xs text-zinc-300">
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-zinc-800 text-cyan-400 font-mono font-bold text-[10px] flex items-center justify-center shrink-0">1</span>
            <span>Open ChatGPT → <strong>Explore GPTs</strong> → <strong>Create a GPT</strong> (or Configure Custom Action / Applet).</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-zinc-800 text-cyan-400 font-mono font-bold text-[10px] flex items-center justify-center shrink-0">2</span>
            <span>Under <strong>Actions</strong>, set Authentication to <strong>Bearer</strong> and paste your secret token above.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-zinc-800 text-cyan-400 font-mono font-bold text-[10px] flex items-center justify-center shrink-0">3</span>
            <span>Set Schema URL to <code className="text-cyan-400 font-mono">{mcpEndpointUrl}</code>. ChatGPT will automatically discover all 16 tools!</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-zinc-800 text-cyan-400 font-mono font-bold text-[10px] flex items-center justify-center shrink-0">4</span>
            <span>ChatGPT can now autonomously execute jobs without needing a browser window open!</span>
          </div>
        </div>
      </div>
    </div>
  );
};
