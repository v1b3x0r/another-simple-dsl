import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const { parseDSL } = await import('../src/lib/engine/parse.ts');
const { DreamEngine } = await import('../src/lib/engine/run.ts');

const dslSource = await readFile(new URL('../src/rules/dreamflow.dsl', import.meta.url), 'utf8');
const parsed = parseDSL(dslSource);

const buildEngine = () => new DreamEngine(parsed.rules);

test('parser reads world/scenes/annotations correctly', () => {
	assert.equal(parsed.world, 'Dreamflow2025');
	assert.deepEqual(parsed.scenes.layer1.actions, [
		'user.grabGreenBox',
		'user.slideToLayerTwo',
		'user.resetToLobby'
	]);
	assert.ok(parsed.scenes.layer3.hint?.includes('key'));

	const guardRules = parsed.rules.filter((rule) => rule.category === 'guard');
	assert.equal(guardRules.length, 2);
});

test('engine enforces key requirement before entering layer3', () => {
	const engine = buildEngine();

	engine.trigger('user.enterLayerOne');
	engine.trigger('user.slideToLayerTwo');

	const blockedScene = engine.trigger('user.openLayerThreeDoor');
	assert.equal(blockedScene, 'layer2');

	engine.trigger('user.knockWeirdPanel');
	engine.trigger('user.snatchKeyThree');
	engine.trigger('user.ghostExit');

	const unlockedScene = engine.trigger('user.openLayerThreeDoor');
	assert.equal(unlockedScene, 'layer3');
	assert.equal(engine.state.counters.keyLayer3, 1);
});

test('full run collects loot and reaches final gate', () => {
	const engine = buildEngine();

	const sequence = [
		'user.enterLayerOne',
		'user.grabGreenBox',
		'user.slideToLayerTwo',
		'user.knockWeirdPanel',
		'user.snatchKeyThree',
		'user.ghostExit',
		'user.openLayerThreeDoor',
		'user.collectRedBox',
		'user.warpToFinalGate'
	];

	for (const event of sequence) {
		engine.trigger(event);
	}

	assert.equal(engine.state.scene, 'finalGate');
	assert.deepEqual(engine.state.counters, {
		greenBox: 1,
		keyLayer3: 1,
		redBox: 1
	});

	engine.trigger('user.resetRun');
	assert.equal(engine.state.scene, 'lobby');
	assert.equal(engine.history.length, sequence.length + 1);
});
