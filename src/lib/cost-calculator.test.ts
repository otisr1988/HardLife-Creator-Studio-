import test from 'node:test';
import assert from 'node:assert/strict';
import { estimateAiVideoCost } from './cost-calculator';

test('estimateAiVideoCost calculates free local operations as $0.00', () => {
  const result = estimateAiVideoCost({
    topicLengthWords: 20,
    targetDurationSeconds: 60,
    useGeminiResearch: false,
    useGeminiScript: false,
    useLocalTts: true,
    useLocalFfmpeg: true,
  });

  assert.equal(result.totalUsd, 0);
  assert.equal(result.freeLocalOpsCount, 2);
  assert.equal(result.paidOpsCount, 0);
  assert.equal(result.exceedsBudgetCap, false);
});

test('estimateAiVideoCost calculates transparent paid model breakdown and checks budget cap', () => {
  const result = estimateAiVideoCost({
    topicLengthWords: 50,
    targetDurationSeconds: 60,
    useGeminiResearch: true,
    useGeminiScript: true,
    useLocalTts: true,
    useLocalFfmpeg: true,
    monthlyBudgetCap: 20.0,
    currentMonthSpend: 19.99,
  });

  assert.equal(result.paidOpsCount, 2);
  assert.equal(result.freeLocalOpsCount, 2);
  assert.ok(result.totalUsd > 0 && result.totalUsd < 0.05); // Fraction of a cent
  assert.equal(result.monthlyBudgetCapRemaining, 0.01);
});
