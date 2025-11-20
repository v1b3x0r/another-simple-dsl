import type { DreamState } from './state';
import { incrementCounter } from './state';

type EffectResult = string | void;
type EffectHandler = (state: DreamState, action: string) => EffectResult;

const gotoPattern = /^goto\("(.+)"\)$/;
const revealPattern = /^reveal\("(.+)"\)$/;

const gotoEffect: EffectHandler = (state, action) => {
	const match = action.match(gotoPattern);
	if (!match) return;
	const [, scene] = match;
	state.scene = scene;
	return scene;
};

const revealEffect: EffectHandler = (state, action) => {
	const match = action.match(revealPattern);
	if (!match) return;
	const [, counterName] = match;
	incrementCounter(state, counterName);
};

const handlers: EffectHandler[] = [gotoEffect, revealEffect];

export function applyEffect(state: DreamState, action: string): EffectResult {
	for (const handler of handlers) {
		const result = handler(state, action);
		if (result !== undefined) {
			return result;
		}
	}
	return undefined;
}
