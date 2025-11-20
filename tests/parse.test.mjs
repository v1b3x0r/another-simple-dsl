import test from 'node:test';
import assert from 'node:assert/strict';

const { parseDSL } = await import('../src/lib/engine/parse.ts');

test('parseDSL: extracts world name correctly', () => {
	const dsl = `
world TestWorld {
  scene lobby {
    description: "Start here"
    actions: ["user.start"]
  }
}`;
	const parsed = parseDSL(dsl);
	assert.equal(parsed.world, 'TestWorld');
});

test('parseDSL: works without world wrapper', () => {
	const dsl = `
scene start {
  description: "No world wrapper"
  actions: ["user.go"]
}
when user.go leadsTo goto("end")
`;
	const parsed = parseDSL(dsl);
	assert.equal(parsed.world, undefined);
	assert.ok(parsed.scenes.start);
	assert.equal(parsed.rules.length, 1);
});

test('parseDSL: parses scene with all fields', () => {
	const dsl = `
scene testScene {
  description: "Test description"
  hint: "This is a hint"
  actions: ["action.one", "action.two", "action.three"]
}`;
	const parsed = parseDSL(dsl);
	assert.equal(parsed.scenes.testScene.id, 'testScene');
	assert.equal(parsed.scenes.testScene.description, 'Test description');
	assert.equal(parsed.scenes.testScene.hint, 'This is a hint');
	assert.deepEqual(parsed.scenes.testScene.actions, ['action.one', 'action.two', 'action.three']);
});

test('parseDSL: parses scene without hint', () => {
	const dsl = `
scene minimal {
  description: "No hint"
  actions: []
}`;
	const parsed = parseDSL(dsl);
	assert.equal(parsed.scenes.minimal.hint, undefined);
	assert.deepEqual(parsed.scenes.minimal.actions, []);
});

test('parseDSL: parses scene with empty actions', () => {
	const dsl = `
scene noActions {
  description: "No actions"
  actions: []
}`;
	const parsed = parseDSL(dsl);
	assert.deepEqual(parsed.scenes.noActions.actions, []);
});

test('parseDSL: handles actions with trailing commas', () => {
	const dsl = `
scene trailing {
  description: "Actions with trailing comma"
  actions: ["action.one", "action.two",]
}`;
	const parsed = parseDSL(dsl);
	assert.deepEqual(parsed.scenes.trailing.actions, ['action.one', 'action.two']);
});

test('parseDSL: parses @flow annotation', () => {
	const dsl = `@flow when user.click leadsTo goto("next")`;
	const parsed = parseDSL(dsl);
	assert.equal(parsed.rules[0].category, 'flow');
	assert.equal(parsed.rules[0].condition, 'user.click');
	assert.equal(parsed.rules[0].action, 'goto("next")');
});

test('parseDSL: parses @guard annotation', () => {
	const dsl = `@guard when user.enter and hasKey >= 1 leadsTo goto("secret")`;
	const parsed = parseDSL(dsl);
	assert.equal(parsed.rules[0].category, 'guard');
});

test('parseDSL: parses @effect annotation', () => {
	const dsl = `@effect when user.pickup leadsTo reveal("item")`;
	const parsed = parseDSL(dsl);
	assert.equal(parsed.rules[0].category, 'effect');
});

test('parseDSL: parses @system annotation', () => {
	const dsl = `@system when game.start leadsTo announce("Welcome!")`;
	const parsed = parseDSL(dsl);
	assert.equal(parsed.rules[0].category, 'system');
});

test('parseDSL: parses @physics annotation as guard', () => {
	const dsl = `@physics when player.jump and gravity > 0 leadsTo goto("falling")`;
	const parsed = parseDSL(dsl);
	assert.equal(parsed.rules[0].category, 'guard');
});

test('parseDSL: defaults to flow when no annotation', () => {
	const dsl = `when user.action leadsTo goto("somewhere")`;
	const parsed = parseDSL(dsl);
	assert.equal(parsed.rules[0].category, 'flow');
});

test('parseDSL: parses multiple scenes', () => {
	const dsl = `
scene first {
  description: "First"
  actions: []
}
scene second {
  description: "Second"
  actions: []
}
scene third {
  description: "Third"
  actions: []
}`;
	const parsed = parseDSL(dsl);
	assert.equal(Object.keys(parsed.scenes).length, 3);
	assert.ok(parsed.scenes.first);
	assert.ok(parsed.scenes.second);
	assert.ok(parsed.scenes.third);
});

test('parseDSL: parses multiple rules', () => {
	const dsl = `
when event.one leadsTo goto("a")
when event.two leadsTo goto("b")
@guard when event.three and x > 0 leadsTo goto("c")
@effect when event.four leadsTo reveal("item")
`;
	const parsed = parseDSL(dsl);
	assert.equal(parsed.rules.length, 4);
	assert.equal(parsed.rules[0].condition, 'event.one');
	assert.equal(parsed.rules[1].condition, 'event.two');
	assert.equal(parsed.rules[2].condition, 'event.three and x > 0');
	assert.equal(parsed.rules[3].condition, 'event.four');
});

test('parseDSL: handles CRLF line endings', () => {
	const dsl = "scene test {\r\n  description: \"CRLF\"\r\n  actions: []\r\n}";
	const parsed = parseDSL(dsl);
	assert.ok(parsed.scenes.test);
});

test('parseDSL: handles hyphenated scene IDs', () => {
	const dsl = `
scene layer-one-beta {
  description: "Hyphenated"
  actions: []
}`;
	const parsed = parseDSL(dsl);
	assert.ok(parsed.scenes['layer-one-beta']);
});

test('parseDSL: handles underscored scene IDs', () => {
	const dsl = `
scene layer_one_alpha {
  description: "Underscored"
  actions: []
}`;
	const parsed = parseDSL(dsl);
	assert.ok(parsed.scenes.layer_one_alpha);
});

test('parseDSL: preserves rule action syntax', () => {
	const dsl = `when test leadsTo goto("scene") >> announce("Done!")`;
	const parsed = parseDSL(dsl);
	assert.equal(parsed.rules[0].action, 'goto("scene") >> announce("Done!")');
});
