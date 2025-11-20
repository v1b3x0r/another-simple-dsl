import test from 'node:test';
import assert from 'node:assert/strict';

const { parseDSL } = await import('../src/lib/engine/parse.ts');

test('Validation: valid DSL has no errors', () => {
	const dsl = `
scene lobby {
  description: "Start"
  actions: []
}
when user.go leadsTo goto("lobby")
`;
	const parsed = parseDSL(dsl);
	assert.equal(parsed.errors.length, 0);
});

test('Validation: scene missing description produces error', () => {
	const dsl = `
scene broken {
  actions: []
}
`;
	const parsed = parseDSL(dsl);
	const errors = parsed.errors.filter((e) => e.type === 'error');
	assert.ok(errors.length > 0);
	assert.ok(errors[0].message.includes('missing a description'));
});

test('Validation: goto to undefined scene produces warning', () => {
	const dsl = `
scene lobby {
  description: "Start"
  actions: []
}
when user.go leadsTo goto("nonexistent")
`;
	const parsed = parseDSL(dsl);
	const warnings = parsed.errors.filter((e) => e.type === 'warning');
	assert.ok(warnings.length > 0);
	assert.ok(warnings[0].message.includes('undefined scene'));
	assert.ok(warnings[0].message.includes('nonexistent'));
});

test('Validation: unreachable scene produces warning', () => {
	const dsl = `
scene lobby {
  description: "Reachable by default"
  actions: []
}
scene orphan {
  description: "No rules lead here"
  actions: []
}
`;
	const parsed = parseDSL(dsl);
	const warnings = parsed.errors.filter((e) => e.type === 'warning');
	assert.ok(warnings.length > 0);
	assert.ok(warnings.some((w) => w.message.includes('not reachable')));
	assert.ok(warnings.some((w) => w.context === 'orphan'));
});

test('Validation: lobby is always reachable', () => {
	const dsl = `
scene lobby {
  description: "Default initial scene"
  actions: []
}
`;
	const parsed = parseDSL(dsl);
	const warnings = parsed.errors.filter((e) => e.type === 'warning' && e.context === 'lobby');
	assert.equal(warnings.length, 0);
});

test('Validation: scene referenced by goto is reachable', () => {
	const dsl = `
scene lobby {
  description: "Start"
  actions: []
}
scene next {
  description: "Reachable via rule"
  actions: []
}
when user.go leadsTo goto("next")
`;
	const parsed = parseDSL(dsl);
	const warnings = parsed.errors.filter((e) => e.context === 'next');
	assert.equal(warnings.length, 0);
});

test('Validation: multiple goto errors accumulate', () => {
	const dsl = `
scene lobby {
  description: "Start"
  actions: []
}
when user.a leadsTo goto("missing1")
when user.b leadsTo goto("missing2")
when user.c leadsTo goto("missing3")
`;
	const parsed = parseDSL(dsl);
	const warnings = parsed.errors.filter((e) => e.type === 'warning' && e.message.includes('undefined scene'));
	assert.equal(warnings.length, 3);
});

test('Validation: errors array always exists', () => {
	const dsl = `scene lobby { description: "Test" actions: [] }`;
	const parsed = parseDSL(dsl);
	assert.ok(Array.isArray(parsed.errors));
});

test('Validation: warnings have correct structure', () => {
	const dsl = `
scene lobby {
  description: "Start"
  actions: []
}
when user.go leadsTo goto("nowhere")
`;
	const parsed = parseDSL(dsl);
	const warning = parsed.errors[0];
	assert.ok(warning);
	assert.equal(warning.type, 'warning');
	assert.ok(typeof warning.message === 'string');
	assert.ok(warning.message.length > 0);
});
