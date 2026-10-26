import { StudioStore, type AutomationRule } from './store.ts';
import { generateAiVideoPackage } from './ai-service.ts';
import { renderVideoWithFfmpeg } from './ffmpeg-service.ts';
import { YouTubeService } from './youtube-service.ts';
import { TikTokService } from './tiktok-service.ts';

class AutomationSchedulerService {
  private timer: NodeJS.Timeout | null = null;
  private isProcessing = false;

  public start() {
    if (this.timer) return;
    console.log('[AutomationScheduler] Background worker started. Tick interval: 30s');
    // Run initial tick after 5 seconds, then every 30 seconds
    setTimeout(() => this.tick(), 5000);
    this.timer = setInterval(() => this.tick(), 30000);
  }

  public stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  public async tick() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const state = StudioStore.getState();
      const now = new Date();

      // 1. Check for scheduled publications that have reached their publish time
      for (const pub of state.publications) {
        if (pub.status === 'scheduled' && pub.scheduledTime) {
          const schedDate = new Date(pub.scheduledTime);
          if (schedDate <= now) {
            console.log(`[AutomationScheduler] Triggering scheduled publication: ${pub.id} (${pub.title})`);
            StudioStore.updateState((prev) => ({
              ...prev,
              publications: prev.publications.map((p) =>
                p.id === pub.id ? { ...p, status: 'published', publishedTime: now.toISOString() } : p
              ),
            }));

            StudioStore.logActivity(
              'Scheduled Video Published',
              'publish',
              `Scheduled video '${pub.title}' automatically published to ${pub.channelHandle}.`,
              'success'
            );
          }
        }
      }

      // 2. Check for active automation rules
      for (const auto of state.automations) {
        if (!auto.enabled) continue;

        // Check monthly budget cap
        if (auto.currentMonthSpend >= auto.monthlyBudgetCap) {
          continue;
        }

        // Determine if ready to run
        const shouldRun = !auto.lastRun || (now.getTime() - new Date(auto.lastRun).getTime()) > 86400000; // 24 hours
        if (shouldRun) {
          await this.executeAutomationRule(auto);
        }
      }
    } catch (err) {
      console.error('[AutomationScheduler] Tick error:', err);
    } finally {
      this.isProcessing = false;
    }
  }

  public async executeAutomationRule(auto: AutomationRule) {
    console.log(`[AutomationScheduler] Executing rule: ${auto.name} [Category: ${auto.category}]`);

    // Topic ideas pool preventing duplicate concepts
    const topicPools: Record<string, string[]> = {
      towboats: [
        'How 10,000 HP Towboats Maneuver 50,000 Tons Through Lock Chambers',
        'Upper Mississippi High Water Currents: Flanking River Bends Explained',
        'Inside the Wheelhouse: Electronic Chart Systems vs River Reading',
        'Towboat Engine Room Inspection: Twin EMD Turbocharged V16s',
      ],
      gaming: [
        'GTA 6 Water Physics & Hull Dynamics (Simulated Analysis)',
        'Vehicle Center of Gravity & Suspension Travel in High-Speed Pursuits',
        'Comparing Open-World Weather Systems & Volumetric Storms',
      ],
      tarot: [
        'Daily Collective Reading: The Wheel of Fortune & Two of Wands',
        'Navigating Sudden Pivots: The Tower into The Star Insights',
      ],
      comedy: [
        'Things You Only Understand When Working River Shifts',
        'When the GPS Says Turn Left but You Have 36 Barges',
      ],
      facts: [
        'Why River Freight Moves More Cargo with Less Fuel Than Rail or Truck',
        'The Most Dangerous Bends on the Mississippi River',
      ],
    };

    const pool = topicPools[auto.category] || topicPools.towboats;
    const existingTitles = StudioStore.getState().projects.map((p) => p.title.toLowerCase());
    const unusedTopic = pool.find((t) => !existingTitles.some((et) => et.includes(t.toLowerCase().slice(0, 20)))) || pool[0];

    // Generate package
    const pkg = await generateAiVideoPackage({
      topic: unusedTopic,
      category: auto.category,
      targetDurationSeconds: auto.targetDuration || 55,
      format: 'shorts_9_16',
      includeVoiceover: true,
    });

    const projectId = `proj_auto_${Date.now()}`;
    const project = {
      id: projectId,
      title: pkg.title,
      description: pkg.description,
      category: auto.category,
      status: auto.approvalRequired ? ('draft' as const) : ('rendering' as const),
      format: 'shorts_9_16' as const,
      duration: auto.targetDuration || 55,
      timeline: { clips: [], subtitles: pkg.subtitles, duckingEnabled: true },
      script: pkg.script,
      storyboard: pkg.storyboard,
      tags: pkg.tags,
      ownerId: auto.ownerId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    StudioStore.updateState((prev) => ({
      ...prev,
      projects: [project, ...prev.projects],
      automations: prev.automations.map((a) =>
        a.id === auto.id
          ? {
              ...a,
              lastRun: new Date().toISOString(),
              currentMonthSpend: Number((a.currentMonthSpend + 0.005).toFixed(3)),
            }
          : a
      ),
    }));

    StudioStore.logActivity(
      'Automated Video Production Triggered',
      'automation',
      `Rule '${auto.name}' created project '${project.title}'. Approval required: ${auto.approvalRequired ? 'Yes (Queued for creator review)' : 'No (Auto-publishing pipeline)'}`,
      'info'
    );

    // If manual approval is not required, automatically render and publish
    if (!auto.approvalRequired) {
      const renderResult = await renderVideoWithFfmpeg({
        renderId: `rnd_auto_${Date.now()}`,
        projectId,
        title: project.title,
        format: 'shorts_9_16',
        durationSeconds: project.duration,
      });

      if (renderResult.success) {
        if (auto.targetPlatforms.includes('youtube')) {
          await YouTubeService.uploadVideo(
            {
              projectId,
              title: project.title,
              description: project.description,
              tags: project.tags,
              category: '28',
              privacy: 'public',
              audience: { madeForKids: false, ageRestricted: false },
            },
            renderResult.outputPath
          );
        }
        if (auto.targetPlatforms.includes('tiktok')) {
          await TikTokService.uploadVideo(
            {
              projectId,
              title: project.title,
              privacy: 'public',
              allowDuet: true,
              allowStitch: true,
              allowComments: true,
              isCommercialContent: false,
            },
            renderResult.outputPath
          );
        }
      }
    }
  }
}

export const AutomationScheduler = new AutomationSchedulerService();
