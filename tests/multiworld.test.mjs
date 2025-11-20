import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const { parseDSL } = await import('../src/lib/engine/parse.ts');
const { DreamEngine } = await import('../src/lib/engine/run.ts');

// Load both worlds
const dreamflowSource = await readFile(new URL('../src/worlds/dreamflow.dsl', import.meta.url), 'utf8');
const tutorialSource = await readFile(new URL('../src/worlds/tutorial.dsl', import.meta.url), 'utf8');

test('Multi-world: Dreamflow DSL loads correctly', () => {
	const parsed = parseDSL(dreamflowSource);
	assert.equal(parsed.world, 'Dreamflow2025');
	assert.ok(Object.keys(parsed.scenes).length > 0);
	assert.ok(parsed.rules.length > 0);
});

test('Multi-world: Tutorial DSL loads correctly', () => {
	const parsed = parseDSL(tutorialSource);
	assert.equal(parsed.world, 'Tutorial');
	assert.ok(Object.keys(parsed.scenes).length > 0);
	assert.ok(parsed.rules.length > 0);
});

test('Multi-world: Tutorial has expected scenes', () => {
	const parsed = parseDSL(tutorialSource);
	assert.ok(parsed.scenes.welcome, 'Should have welcome scene');
	assert.ok(parsed.scenes.learnActions, 'Should have learnActions scene');
	assert.ok(parsed.scenes.learnCounters, 'Should have learnCounters scene');
	assert.ok(parsed.scenes.success, 'Should have success scene');
});

test('Multi-world: Tutorial star collection works', () => {
	const parsed = parseDSL(tutorialSource);
	const engine = new DreamEngine(parsed.rules);

	engine.state.scene = 'learnCounters';

	// Collect 3 stars
	engine.trigger('user.collectStar');
	engine.trigger('user.collectStar');
	engine.trigger('user.collectStar');

	assert.equal(engine.state.counters.star, 3);

	// Should now be able to proceed (flow rule matches)
	engine.trigger('user.checkProgress');
	assert.equal(engine.state.scene, 'learnGuards');
});

test('Multi-world: Tutorial guard works', () => {
	const parsed = parseDSL(tutorialSource);
	const engine = new DreamEngine(parsed.rules);

	engine.state.scene = 'learnGuards';

	// Try without stars - should stay in same scene
	engine.trigger('user.tryEnter');
	assert.equal(engine.state.scene, 'learnGuards');

	// Add stars and try again
	engine.state.counters.star = 3;
	engine.trigger('user.tryEnter');
	assert.equal(engine.state.scene, 'success');
});

test('Multi-world: Both worlds can run in same process', () => {
	const dreamflow = parseDSL(dreamflowSource);
	const tutorial = parseDSL(tutorialSource);

	const engine1 = new DreamEngine(dreamflow.rules);
	const engine2 = new DreamEngine(tutorial.rules);

	// Run different actions in each engine
	engine1.trigger('user.enterLayerOne');
	engine2.trigger('user.start');

	assert.equal(engine1.state.scene, 'layer1');
	assert.equal(engine2.state.scene, 'learnActions');

	// States should be independent
	assert.notEqual(engine1.state.scene, engine2.state.scene);
});

test('Multi-world: Tutorial skip flow works', () => {
	const parsed = parseDSL(tutorialSource);
	const engine = new DreamEngine(parsed.rules);

	engine.trigger('user.skipTutorial');
	assert.equal(engine.state.scene, 'playground');
});

test('Multi-world: Dreamflow has no critical errors', () => {
	const parsed = parseDSL(dreamflowSource);
	const criticalErrors = parsed.errors.filter((e) => e.type === 'error');
	assert.equal(criticalErrors.length, 0);
});

test('Multi-world: Tutorial has no critical errors', () => {
	const parsed = parseDSL(tutorialSource);
	const criticalErrors = parsed.errors.filter((e) => e.type === 'error');
	assert.equal(criticalErrors.length, 0);
});
