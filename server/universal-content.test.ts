import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyTopic, generateAiVideoPackage, generateVideoIdeas } from './ai-service.ts';
import { StudioStore } from './store.ts';

// Test isolation: ensure fast, deterministic local generation engine
delete process.env.GEMINI_API_KEY;

test('Universal Content Classification: Identifies 5 unrelated topics accurately', () => {
  // 1. Space discoveries
  const spaceClass = classifyTopic('James Webb Telescope Reveals Giant Black Holes at the Edge of Time');
  assert.equal(spaceClass.workflowType, 'science');
  assert.equal(spaceClass.requiresFactVerification, true);
  assert.equal(spaceClass.recommendedPacing, 'technical_deepdive');

  // 2. Cooking tutorial
  const cookClass = classifyTopic('How to Perfectly Cook a Cast Iron Ribeye Steak with Butter and Rosemary');
  assert.equal(cookClass.workflowType, 'cooking');
  assert.equal(cookClass.recommendedPacing, 'instructional_steps');

  // 3. Ancient history mystery
  const histClass = classifyTopic('Unsolved Archaeological Mysteries of Ancient Roman Concrete and Maritime Harbors');
  assert.equal(histClass.workflowType, 'history');
  assert.equal(histClass.requiresFactVerification, true);
  assert.equal(histClass.recommendedPacing, 'narrative_story');

  // 4. Car repair / automotive DIY
  const autoClass = classifyTopic('DIY Brake Pad and Rotor Replacement on a F-150 Truck with Torque Specs');
  assert.equal(autoClass.workflowType, 'automotive');
  assert.equal(autoClass.recommendedPacing, 'instructional_steps');
  assert.equal(autoClass.recommendedVoice, 'studio_mechanic');

  // 5. Comedy sketch
  const comedyClass = classifyTopic('Awkward Coffee Shop First Date Parody and Funny Conversation Red Flags');
  assert.equal(comedyClass.workflowType, 'comedy');
  assert.equal(comedyClass.recommendedPacing, 'comedic_timing');
});

test('Universal Video Generation: Generates accurate script, storyboard, and duration scaling', async () => {
  // Test 15-second fast hook video
  const shortPkg = await generateAiVideoPackage({
    topic: 'Why Space Telescopes Use Gold-Plated Mirrors',
    targetDurationSeconds: 15,
    format: 'shorts_9_16',
    includeEngagementCta: false,
  });

  assert.ok(shortPkg.title);
  assert.ok(shortPkg.script);
  assert.ok(shortPkg.storyboard.length >= 2);
  const totalShortDur = shortPkg.storyboard.reduce((acc, s) => acc + s.duration, 0);
  assert.equal(totalShortDur, 15);
  // With includeEngagementCta=false, no subscribe/follow burned into script
  assert.ok(!shortPkg.script.toLowerCase().includes('subscribe for'));
  assert.ok(!shortPkg.script.toLowerCase().includes('follow for'));

  // Test 180-second deep documentary
  const longPkg = await generateAiVideoPackage({
    topic: 'Ancient Roman Aqueducts & Hydraulic Concrete Engineering',
    targetDurationSeconds: 180,
    format: 'youtube_16_9',
    includeEngagementCta: true,
    customCtaText: 'Subscribe to @towboater2011 for engineering documentaries!',
    targetChannels: ['@towboater2011'],
  });

  assert.ok(longPkg.storyboard.length >= 8);
  const totalLongDur = longPkg.storyboard.reduce((acc, s) => acc + s.duration, 0);
  assert.equal(totalLongDur, 180);
  assert.ok(longPkg.script.includes('Subscribe to @towboater2011 for engineering documentaries!'));
  assert.deepEqual(longPkg.targetChannels, ['@towboater2011']);
});

test('Universal Video Generation: Enforces mandatory simulation disclosure for GTA gameplay', async () => {
  const gtaPkg = await generateAiVideoPackage({
    topic: 'GTA 6 Water Physics and Boat Wake Simulation Analysis',
    targetDurationSeconds: 45,
    category: 'gaming',
    targetChannels: ['@otis0239'],
  });

  const simScene = gtaPkg.storyboard.find((s) => s.visualAssetType === 'simulated_gameplay');
  assert.ok(simScene, 'Must include simulated gameplay scene');
  assert.ok(simScene.disclosureNote && simScene.disclosureNote.toLowerCase().includes('simulated'));
  assert.ok(gtaPkg.technicalReview.disclosuresChecked);
});

test('AI Video Ideas Generator: Produces 10-20 structured ideas with hooks and requirements', async () => {
  const ideas = await generateVideoIdeas('Heavy Construction Excavator Mechanics', 12);
  assert.ok(Array.isArray(ideas));
  assert.equal(ideas.length, 12);

  for (const idea of ideas) {
    assert.ok(idea.id);
    assert.ok(idea.title);
    assert.ok(idea.hook, 'Every idea must have a 0-3s hook');
    assert.ok(idea.summary);
    assert.ok(idea.duration > 0);
    assert.ok(idea.audienceInterest);
    assert.ok(idea.productionRequirements.length > 0);
  }
});

test('Custom Categories CRUD and Store Persistence', () => {
  const stateBefore = StudioStore.getState();
  const initialCount = (stateBefore.customCategories || []).length;

  // 1. Create custom category
  const newCat = {
    id: `cat_test_${Date.now()}`,
    name: 'Survival & Wilderness Bushcraft',
    description: 'Wilderness navigation, shelter construction, and water purification.',
    defaultVideoStyle: 'Documentary',
    preferredVoice: 'studio_narrator',
    preferredDuration: 60,
    visualStyle: 'authentic_footage',
    captionStyle: 'bold_punchy' as const,
    backgroundMusicStyle: 'Ambient wilderness',
    defaultHashtags: ['bushcraft', 'survival', 'outdoors'],
    publishingAccounts: ['@otis0239'],
    preferredCta: 'Save this guide and follow @otis0239!',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  StudioStore.updateState((prev) => ({
    ...prev,
    customCategories: [newCat, ...(prev.customCategories || [])],
  }));

  const stateAfterCreate = StudioStore.getState();
  assert.equal(stateAfterCreate.customCategories.length, initialCount + 1);
  const found = stateAfterCreate.customCategories.find((c) => c.id === newCat.id);
  assert.ok(found);
  assert.equal(found.name, 'Survival & Wilderness Bushcraft');

  // 2. Update category
  StudioStore.updateState((prev) => ({
    ...prev,
    customCategories: prev.customCategories.map((c) =>
      c.id === newCat.id ? { ...c, preferredDuration: 90 } : c
    ),
  }));

  const stateAfterUpdate = StudioStore.getState();
  const updatedFound = stateAfterUpdate.customCategories.find((c) => c.id === newCat.id);
  assert.equal(updatedFound?.preferredDuration, 90);

  // 3. Delete category
  StudioStore.updateState((prev) => ({
    ...prev,
    customCategories: prev.customCategories.filter((c) => c.id !== newCat.id),
  }));

  const stateAfterDelete = StudioStore.getState();
  assert.equal(stateAfterDelete.customCategories.length, initialCount);
});
