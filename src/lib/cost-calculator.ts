/**
 * Cost and Resource Estimation for Video Operations
 * Transparently separates free/local operations from optional paid model calls
 */

export interface CostBreakdownItem {
  operation: string;
  engine: 'local_ffmpeg' | 'local_whisper' | 'local_tts' | 'gemini_flash' | 'gpu_worker';
  isLocalFree: boolean;
  estimatedCostUsd: number;
  details: string;
}

export interface EstimatedOperationCost {
  totalUsd: number;
  freeLocalOpsCount: number;
  paidOpsCount: number;
  breakdown: CostBreakdownItem[];
  monthlyBudgetCapRemaining?: number;
  exceedsBudgetCap?: boolean;
}

// Pricing constants
export const PRICING = {
  GEMINI_FLASH_INPUT_PER_1M_TOKENS: 0.10, // Gemini 2.5 Flash / 3.8 Flash
  GEMINI_FLASH_OUTPUT_PER_1M_TOKENS: 0.40,
  OPTIONAL_GPU_CLOUD_PER_MINUTE: 0.04, // e.g. T4/L4 GPU instance
};

/**
 * Calculates estimated cost for an AI-assisted video creation workflow
 */
export function estimateAiVideoCost(options: {
  topicLengthWords: number;
  targetDurationSeconds: number;
  useGeminiResearch: boolean;
  useGeminiScript: boolean;
  useLocalTts: boolean;
  useLocalFfmpeg: boolean;
  useCloudGpu?: boolean;
  monthlyBudgetCap?: number;
  currentMonthSpend?: number;
}): EstimatedOperationCost {
  const breakdown: CostBreakdownItem[] = [];

  // 1. Topic research & fact checking
  if (options.useGeminiResearch) {
    // Approx 2,000 input tokens, 1,500 output tokens
    const cost = (2000 / 1_000_000) * PRICING.GEMINI_FLASH_INPUT_PER_1M_TOKENS +
      (1500 / 1_000_000) * PRICING.GEMINI_FLASH_OUTPUT_PER_1M_TOKENS;
    breakdown.push({
      operation: 'Subject Research & Fact Verification',
      engine: 'gemini_flash',
      isLocalFree: false,
      estimatedCostUsd: Number(cost.toFixed(5)),
      details: 'Gemini 2.5/3.8 Flash automated fact check (~3.5k tokens)',
    });
  }

  // 2. Script & Storyboard generation
  if (options.useGeminiScript) {
    const cost = (1500 / 1_000_000) * PRICING.GEMINI_FLASH_INPUT_PER_1M_TOKENS +
      (2000 / 1_000_000) * PRICING.GEMINI_FLASH_OUTPUT_PER_1M_TOKENS;
    breakdown.push({
      operation: 'Script & Scene Storyboard Generation',
      engine: 'gemini_flash',
      isLocalFree: false,
      estimatedCostUsd: Number(cost.toFixed(5)),
      details: 'Timed narration, scene cues, hook & CTA generation (~3.5k tokens)',
    });
  }

  // 3. Narration / Voiceover
  if (options.useLocalTts) {
    breakdown.push({
      operation: 'Narration & Speech Synthesis',
      engine: 'local_tts',
      isLocalFree: true,
      estimatedCostUsd: 0,
      details: 'Self-hosted / Browser Neural Speech Synthesis ($0.00 compute)',
    });
  } else {
    breakdown.push({
      operation: 'Cloud AI Voice Synthesis',
      engine: 'gemini_flash',
      isLocalFree: false,
      estimatedCostUsd: 0.008,
      details: 'Studio voice synthesis for video narration',
    });
  }

  // 4. Video Assembly & FFmpeg Rendering
  if (options.useLocalFfmpeg) {
    breakdown.push({
      operation: 'Timeline Assembly & FFmpeg MP4 Render',
      engine: 'local_ffmpeg',
      isLocalFree: true,
      estimatedCostUsd: 0,
      details: 'Self-hosted FFmpeg video compositing, subtitles & audio ducking ($0.00)',
    });
  }

  // 5. Optional cloud GPU acceleration
  if (options.useCloudGpu) {
    const minutes = Math.max(1, Math.ceil(options.targetDurationSeconds / 30));
    const gpuCost = minutes * PRICING.OPTIONAL_GPU_CLOUD_PER_MINUTE;
    breakdown.push({
      operation: 'Cloud GPU Video Inference Worker',
      engine: 'gpu_worker',
      isLocalFree: false,
      estimatedCostUsd: Number(gpuCost.toFixed(4)),
      details: `Dedicated GPU rendering worker (${minutes} min allocated)`,
    });
  }

  const totalUsd = Number(breakdown.reduce((sum, item) => sum + item.estimatedCostUsd, 0).toFixed(4));
  const freeLocalOpsCount = breakdown.filter((item) => item.isLocalFree).length;
  const paidOpsCount = breakdown.filter((item) => !item.isLocalFree).length;

  let remainingBudget = undefined;
  let exceedsBudget = false;

  if (options.monthlyBudgetCap !== undefined && options.currentMonthSpend !== undefined) {
    remainingBudget = Number(Math.max(0, options.monthlyBudgetCap - options.currentMonthSpend).toFixed(2));
    exceedsBudget = options.currentMonthSpend + totalUsd > options.monthlyBudgetCap;
  }

  return {
    totalUsd,
    freeLocalOpsCount,
    paidOpsCount,
    breakdown,
    monthlyBudgetCapRemaining: remainingBudget,
    exceedsBudgetCap: exceedsBudget,
  };
}
