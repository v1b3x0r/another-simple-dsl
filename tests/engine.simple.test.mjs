import test from 'node:test';
import assert from 'node:assert/strict';

const { parseDSL } = await import('../src/lib/engine/parse.ts');
const { DreamEngine } = await import('../src/lib/engine/run.ts');

test('Engine: initializes with default state', () => {
	const engine = new DreamEngine([]);
	assert.equal(engine.state.scene, 'lobby');
	assert.deepEqual(engine.state.counters, {});
});

test('Engine: simple flow triggers scene change', () => {
	const dsl = `when user.go leadsTo goto("next")`;
	const { rules } = parseDSL(dsl);
	const engine = new DreamEngine(rules);

	engine.trigger('user.go');
	assert.equal(engine.state.scene, 'next');
});

test('Engine: evaluates AND condition', () => {
	const dsl = `when user.enter and keyCount >= 1 leadsTo goto("secret")`;
	const { rules } = parseDSL(dsl);
	const engine = new DreamEngine(rules);

	engine.trigger('user.enter');
	assert.equal(engine.state.scene, 'lobby');

	engine.state.counters.keyCount = 1;
	engine.trigger('user.enter');
	assert.equal(engine.state.scene, 'secret');
});

test('Engine: comparison operators work', () => {
	const tests = [
		{ op: '==', val: 100, pass: 100, fail: 99 },
		{ op: '!=', val: 0, pass: 1, fail: 0 },
		{ op: '>', val: 50, pass: 51, fail: 50 },
		{ op: '<', val: 20, pass: 19, fail: 20 },
		{ op: '>=', val: 5, pass: 5, fail: 4 },
		{ op: '<=', val: 3, pass: 3, fail: 4 }
	];

	for (const t of tests) {
		const dsl = `when user.check and score ${t.op} ${t.val} leadsTo goto("pass")`;
		const { rules } = parseDSL(dsl);
		const engine = new DreamEngine(rules);

		engine.state.counters.score = t.fail;
		engine.trigger('user.check');
		assert.equal(engine.state.scene, 'lobby', `Failed for ${t.op} with fail value`);

		engine.state.scene = 'lobby'; // reset
		engine.state.counters.score = t.pass;
		engine.trigger('user.check');
		assert.equal(engine.state.scene, 'pass', `Failed for ${t.op} with pass value`);
	}
});

test('Engine: scene comparison works', () => {
	const dsl = `when user.check and scene == "lobby" leadsTo goto("verified")`;
	const { rules } = parseDSL(dsl);
	const engine = new DreamEngine(rules);

	engine.state.scene = 'lobby';
	engine.trigger('user.check');
	assert.equal(engine.state.scene, 'verified');
});

test('Engine: history tracks triggers', () => {
	const dsl = `when user.go leadsTo goto("next")`;
	const { rules } = parseDSL(dsl);
	const engine = new DreamEngine(rules);

	engine.trigger('user.go');
	assert.equal(engine.history.length, 1);
	assert.equal(engine.history[0].event, 'user.go');
	assert.equal(engine.history[0].sceneBefore, 'lobby');
	assert.equal(engine.history[0].sceneAfter, 'next');
});
