import test from 'node:test';
import assert from 'node:assert/strict';

const { parseDSL } = await import('../src/lib/engine/parse.ts');
const { DreamEngine } = await import('../src/lib/engine/run.ts');

test('Effect: goto changes scene', () => {
	const dsl = `when user.go leadsTo goto("newScene")`;
	const { rules } = parseDSL(dsl);
	const engine = new DreamEngine(rules);

	engine.trigger('user.go');
	assert.equal(engine.state.scene, 'newScene');
});

test('Effect: reveal increments counter', () => {
	const dsl = `when user.pickup leadsTo reveal("coin")`;
	const { rules } = parseDSL(dsl);
	const engine = new DreamEngine(rules);

	engine.trigger('user.pickup');
	assert.equal(engine.state.counters.coin, 1);

	engine.trigger('user.pickup');
	assert.equal(engine.state.counters.coin, 2);
});

test('Effect: announce adds message', () => {
	const dsl = `when user.act leadsTo announce("Hello")`;
	const { rules } = parseDSL(dsl);
	const engine = new DreamEngine(rules);

	engine.trigger('user.act');
	assert.deepEqual(engine.state.messages, ['Hello']);
});

test('Effect: clearAnnouncements removes messages', () => {
	const dsl = `
@effect when user.spam leadsTo announce("msg")
when user.clear leadsTo clearAnnouncements()
`;
	const { rules } = parseDSL(dsl);
	const engine = new DreamEngine(rules);

	engine.trigger('user.spam');
	engine.trigger('user.spam');
	assert.equal(engine.state.messages.length, 2);

	engine.trigger('user.clear');
	assert.deepEqual(engine.state.messages, []);
});

test('Effect: finish sets finished state', () => {
	const dsl = `when user.win leadsTo finish("victory")`;
	const { rules } = parseDSL(dsl);
	const engine = new DreamEngine(rules);

	engine.trigger('user.win');
	assert.equal(engine.state.finished, 'victory');
});

test('Effect: block sets blocked state', () => {
	const dsl = `when user.lock leadsTo block()`;
	const { rules } = parseDSL(dsl);
	const engine = new DreamEngine(rules);

	engine.trigger('user.lock');
	assert.equal(engine.state.blocked, true);
});

test('Integration: complex flow with multiple effects', () => {
	const dsl = `
@effect when user.collect leadsTo reveal("coin")
@effect when user.notify leadsTo announce("Got coin!")
when user.advance leadsTo goto("next")
`;
	const { rules } = parseDSL(dsl);
	const engine = new DreamEngine(rules);

	engine.trigger('user.collect');
	assert.equal(engine.state.counters.coin, 1);

	engine.trigger('user.notify');
	assert.deepEqual(engine.state.messages, ['Got coin!']);

	engine.trigger('user.advance');
	assert.equal(engine.state.scene, 'next');
});
