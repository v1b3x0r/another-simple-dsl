import type { Rule } from './parse';
import { applyEffect } from './effects';
import { createInitialState, getCounterValue, type DreamState } from './state';

export type TriggerRecord = {
	event: string;
	ruleAction: string | null;
	sceneBefore: string;
	sceneAfter: string;
	counters: Record<string, number>;
	timestamp: number;
};

export class DreamEngine {
	private rules: Rule[];
	state: DreamState;
	readonly history: TriggerRecord[] = [];

	constructor(rules: Rule[]) {
		this.rules = rules;
		this.state = createInitialState();
	}

	trigger(eventName: string) {
		const sceneBefore = this.state.scene;
		const rule = this.rules.find((candidate) => evaluateCondition(candidate.condition, eventName, this.state));
		const ruleAction = rule?.action ?? null;
		if (rule) {
			applyEffect(this.state, rule.action);
		}
		const sceneAfter = this.state.scene;

		this.history.push({
			event: eventName,
			ruleAction,
			sceneBefore,
			sceneAfter,
			counters: { ...this.state.counters },
			timestamp: Date.now()
		});

		return sceneAfter;
	}
}

const comparisonRegex = /^([a-zA-Z0-9_.-]+)\s*(==|!=|>=|<=|>|<)\s*("[^"]+"|[a-zA-Z0-9_.-]+|\d+)$/;
const numberRegex = /^-?\d+(\.\d+)?$/;

function evaluateCondition(condition: string, eventName: string, state: DreamState) {
	const parts = condition
		.split('and')
		.map((part) => part.trim())
		.filter(Boolean);

	if (parts.length === 0) return false;

	return parts.every((part) => evaluateConditionPart(part, eventName, state));
}

function evaluateConditionPart(part: string, eventName: string, state: DreamState): boolean {
	const comparison = part.match(comparisonRegex);
	if (comparison) {
		const [, leftRaw, operator, rightRaw] = comparison;
		const leftValue = resolveValue(leftRaw, state);
		const rightValue = resolveValue(rightRaw, state, true);
		return compareValues(leftValue, rightValue, operator);
	}

	return part === eventName;
}

function resolveValue(token: string, state: DreamState, allowFallbackCounter = false): string | number {
	const trimmed = token.trim();

	if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
		return trimmed.slice(1, -1);
	}

	if (numberRegex.test(trimmed)) {
		return Number(trimmed);
	}

	if (trimmed === 'scene') {
		return state.scene;
	}

	if (trimmed === 'memoryFragment') {
		return getCounterValue(state, 'memoryFragment');
	}

	if (!allowFallbackCounter && trimmed in state.counters) {
		return state.counters[trimmed];
	}

	return getCounterValue(state, trimmed);
}

function compareValues(left: string | number, right: string | number, operator: string) {
	if (typeof left === 'number' || typeof right === 'number') {
		const l = Number(left);
		const r = Number(right);
		switch (operator) {
			case '==':
				return l === r;
			case '!=':
				return l !== r;
			case '>=':
				return l >= r;
			case '<=':
				return l <= r;
			case '>':
				return l > r;
			case '<':
				return l < r;
			default:
				return false;
		}
	}

	switch (operator) {
		case '==':
			return String(left) === String(right);
		case '!=':
			return String(left) !== String(right);
		default:
			return false;
	}
}
