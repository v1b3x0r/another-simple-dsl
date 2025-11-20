import type { DreamState } from './state.ts';
import { clearMessages, incrementCounter, pushMessage } from './state.ts';

type EffectResult = string | void;
type EffectHandler = (state: DreamState, args: string[]) => EffectResult;

const effectRegistry: Record<string, EffectHandler> = {};

const stripQuotes = (value: string) => value.replace(/^"(.*)"$/, '$1');

const parseInvocation = (action: string) => {
	const match = action.match(/^([a-zA-Z0-9_.-]+)\((.*)\)$/);
	if (!match) return null;
	const [, name, rawArgs] = match;
	const args = rawArgs
		.split(',')
		.map((token) => token.trim())
		.filter(Boolean)
		.map((arg) => stripQuotes(arg));
	return { name, args };
};

export const registerEffect = (name: string, handler: EffectHandler) => {
	effectRegistry[name] = handler;
};

const registerBuiltInEffects = () => {
	registerEffect('goto', (state, args) => {
		const [scene] = args;
		if (!scene) return;
		state.scene = scene;
		state.blocked = false;
		return scene;
	});

	registerEffect('reveal', (state, args) => {
		const [counterName] = args;
		if (!counterName) return;
		incrementCounter(state, counterName);
	});

	registerEffect('announce', (state, args) => {
		const [message] = args;
		if (!message) return;
		pushMessage(state, message);
	});

	registerEffect('clearAnnouncements', (state) => {
		clearMessages(state);
	});

	registerEffect('finish', (state, args) => {
		const [label] = args;
		state.finished = label ?? 'complete';
	});

	registerEffect('block', (state) => {
		state.blocked = true;
	});
};

registerBuiltInEffects();

export function applyEffect(state: DreamState, action: string): EffectResult {
	const invocation = parseInvocation(action);
	if (!invocation) return undefined;

	const handler = effectRegistry[invocation.name];
	if (!handler) {
		console.warn(`Unknown effect: ${invocation.name}`);
		return undefined;
	}

	return handler(state, invocation.args);
}
