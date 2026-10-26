import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { OverviewView } from './components/views/OverviewView';
import { AiCreatorView } from './components/views/AiCreatorView';
import { VideoEditorView } from './components/views/VideoEditorView';
import { MediaLibraryView } from './components/views/MediaLibraryView';
import { ContentIdeasView } from './components/views/ContentIdeasView';
import { CalendarView } from './components/views/CalendarView';
import { YouTubeStudioView } from './components/views/YouTubeStudioView';
import { TikTokStudioView } from './components/views/TikTokStudioView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { AutomationsView } from './components/views/AutomationsView';
import { McpIntegrationView } from './components/views/McpIntegrationView';
import { SettingsView } from './components/views/SettingsView';
import { AuthModal } from './components/AuthModal';
import { auth, testFirestoreConnection } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { CONFIGURED_OWNER_EMAIL } from './lib/security';
import type {
  StudioTab,
  VideoProject,
  MediaAsset,
  Publication,
  ActivityLog,
  AutomationRule,
  ConnectedAccount,
  CustomCategory,
  StudioSettings,
} from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<StudioTab>('overview');
  const [userEmail, setUserEmail] = useState<string | null>(CONFIGURED_OWNER_EMAIL); // Default verified owner
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // App state
  const [projects, setProjects] = useState<VideoProject[]>([]);
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [automations, setAutomations] = useState<AutomationRule[]>([]);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  const [creatorInitialData, setCreatorInitialData] = useState<{
    topic?: string;
    category?: string;
    duration?: number;
    format?: 'shorts_9_16' | 'tiktok_9_16' | 'youtube_16_9';
    instructions?: string;
    targetChannels?: string[];
  } | null>(null);
  const [settings, setSettings] = useState<StudioSettings>({
    ownerEmail: CONFIGURED_OWNER_EMAIL,
    mcpApiKey: 'hlc_mcp_hardlife_creator_studio_key_2026',
    approvalMode: 'review_before_publishing',
    enableLocalWhisper: true,
    enableLocalTts: true,
    monthlyComputeBudgetCap: 50.0,
    metricoolWebhookUrl: 'https://api.metricool.com/v1/bridge/hardlife-studio',
  });

  const [activeProject, setActiveProject] = useState<VideoProject | null>(null);
  const [activeRendersCount, setActiveRendersCount] = useState(0);

  // Load state from backend API on boot
  const refreshAllData = async () => {
    try {
      const [projRes, medRes, pubRes, logRes, autoRes, accRes, setRes, catRes] = await Promise.all([
        fetch('/api/projects').then((r) => r.json()).catch(() => []),
        fetch('/api/media').then((r) => r.json()).catch(() => []),
        fetch('/api/publications').then((r) => r.json()).catch(() => []),
        fetch('/api/logs').then((r) => r.json()).catch(() => []),
        fetch('/api/automations').then((r) => r.json()).catch(() => []),
        fetch('/api/youtube/account').then((r) => r.json()).catch(() => null),
        fetch('/api/settings').then((r) => r.json()).catch(() => null),
        fetch('/api/categories').then((r) => r.json()).catch(() => ({ customCategories: [] })),
      ]);

      if (Array.isArray(projRes)) {
        setProjects(projRes);
        if (!activeProject && projRes.length > 0) {
          setActiveProject(projRes[0]);
        }
      }
      if (Array.isArray(medRes)) setMedia(medRes);
      if (Array.isArray(pubRes)) setPublications(pubRes);
      if (Array.isArray(logRes)) setLogs(logRes);
      if (Array.isArray(autoRes)) setAutomations(autoRes);
      if (setRes) setSettings(setRes);
      if (catRes && Array.isArray(catRes.customCategories)) {
        setCustomCategories(catRes.customCategories);
      }

      // Accounts
      const ttAccRes = await fetch('/api/tiktok/account').then((r) => r.json()).catch(() => null);
      const accList: ConnectedAccount[] = [];
      if (accRes) accList.push(accRes);
      if (ttAccRes) accList.push(ttAccRes);
      setConnectedAccounts(accList);
    } catch (err) {
      console.error('Failed to load initial studio data:', err);
    }
  };

  useEffect(() => {
    refreshAllData();
    testFirestoreConnection();

    // Firebase Auth listener
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user && user.email) {
        setUserEmail(user.email);
      }
    });

    // Background interval to refresh projects & renders
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/projects');
        const list = await res.json();
        if (Array.isArray(list)) {
          setProjects(list);
          const rendering = list.filter((p) => p.status === 'rendering');
          setActiveRendersCount(rendering.length);
        }
      } catch (e) {
        // ignore polling errors
      }
    }, 5000);

    return () => {
      unsub();
      clearInterval(interval);
    };
  }, []);

  const handleOpenProjectInEditor = (projectId: string) => {
    const found = projects.find((p) => p.id === projectId);
    if (found) {
      setActiveProject(found);
    }
    setCurrentTab('editor');
  };

  const handleSaveProject = async (updated: VideoProject) => {
    try {
      const res = await fetch(`/api/projects/${updated.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      setProjects((prev) => prev.map((p) => (p.id === data.id ? data : p)));
      setActiveProject(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleAutomation = async (id: string, enabled: boolean) => {
    try {
      const res = await fetch(`/api/automations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });
      const updated = await res.json();
      setAutomations((prev) => prev.map((a) => (a.id === id ? updated : a)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleTriggerAutomationNow = async (id: string) => {
    const auto = automations.find((a) => a.id === id);
    if (!auto) return;
    alert(`Automation '${auto.name}' triggered manually. Generating new video concept for ${auto.category}...`);
    refreshAllData();
  };

  const handleUpdateSettings = async (partial: Partial<StudioSettings>) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partial),
      });
      const updated = await res.json();
      setSettings(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const scheduledCount = publications.filter((p) => p.status === 'scheduled').length;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans pb-16 md:pb-0">
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        activeRendersCount={activeRendersCount}
        userEmail={userEmail}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Responsive Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          projectsCount={projects.length}
          scheduledCount={scheduledCount}
        />

        {/* Main Content View Container */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-6 lg:p-8 w-full max-w-full min-w-0">
          {currentTab === 'overview' && (
            <OverviewView
              projects={projects}
              publications={publications}
              connectedAccounts={connectedAccounts}
              onSelectTab={setCurrentTab}
              onOpenProject={handleOpenProjectInEditor}
            />
          )}

          {currentTab === 'ai_creator' && (
            <AiCreatorView
              initialData={creatorInitialData}
              customCategories={customCategories}
              connectedAccounts={connectedAccounts}
              onProjectCreated={(newProj) => {
                setProjects([newProj, ...projects]);
                setActiveProject(newProj);
                setCreatorInitialData(null);
              }}
              onCategoriesUpdated={refreshAllData}
              onOpenEditor={(projId) => handleOpenProjectInEditor(projId)}
            />
          )}

          {currentTab === 'editor' && (
            <VideoEditorView
              project={activeProject}
              onSaveProject={handleSaveProject}
            />
          )}

          {currentTab === 'media' && (
            <MediaLibraryView
              media={media}
              onUploadMedia={(asset) => setMedia([asset, ...media])}
              onSendToEditor={(mediaId) => {
                if (activeProject) {
                  const updated: VideoProject = {
                    ...activeProject,
                    timeline: {
                      ...activeProject.timeline,
                      clips: [
                        ...activeProject.timeline.clips,
                        {
                          id: `clip_${Date.now()}`,
                          mediaId,
                          trackId: 'v1',
                          title: 'Imported Clip',
                          startTime: activeProject.duration,
                          duration: 15,
                          sourceStartTime: 0,
                          sourceEndTime: 15,
                          speed: 1,
                          volume: 1,
                        },
                      ],
                    },
                    duration: activeProject.duration + 15,
                  };
                  handleSaveProject(updated);
                  setCurrentTab('editor');
                } else {
                  setCurrentTab('editor');
                }
              }}
            />
          )}

          {currentTab === 'ideas' && (
            <ContentIdeasView
              onSendToCreator={(topic, category, duration, format, targetChannels) => {
                setCreatorInitialData({
                  topic,
                  category,
                  duration,
                  format,
                  targetChannels,
                });
                setCurrentTab('ai_creator');
              }}
            />
          )}

          {currentTab === 'calendar' && (
            <CalendarView
              publications={publications}
              projects={projects}
              onScheduleNew={() => setCurrentTab('youtube')}
            />
          )}

          {currentTab === 'youtube' && (
            <YouTubeStudioView
              projects={projects}
              account={connectedAccounts.find((a) => a.platform === 'youtube')}
            />
          )}

          {currentTab === 'tiktok' && (
            <TikTokStudioView
              projects={projects}
              account={connectedAccounts.find((a) => a.platform === 'tiktok')}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsView accounts={connectedAccounts} />
          )}

          {currentTab === 'automations' && (
            <AutomationsView
              automations={automations}
              onToggleAutomation={handleToggleAutomation}
              onTriggerNow={handleTriggerAutomationNow}
              onCreateAutomation={async (rule) => {
                const res = await fetch('/api/automations', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(rule),
                });
                const data = await res.json();
                setAutomations([data, ...automations]);
              }}
            />
          )}

          {currentTab === 'mcp' && (
            <McpIntegrationView
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              settings={settings}
              logs={logs}
              onUpdateSettings={handleUpdateSettings}
              userEmail={userEmail}
              onOpenAuth={() => setAuthModalOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        userEmail={userEmail}
        onSimulateOwnerLogin={(email) => setUserEmail(email)}
      />
    </div>
  );
}
