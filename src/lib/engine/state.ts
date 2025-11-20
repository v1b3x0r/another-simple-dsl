export type Counters = Record<string, number>;

export type DreamState = {
	scene: string;
	counters: Counters;
	messages: string[];
	finished: string | null;
	blocked: boolean;
};

export const INITIAL_SCENE = 'lobby';

export const createInitialState = (overrides: Partial<DreamState> = {}): DreamState => ({
	scene: INITIAL_SCENE,
	counters: {},
	messages: [],
	finished: null,
	blocked: false,
	...overrides
});

export const incrementCounter = (state: DreamState, counter: string) => {
	const current = state.counters[counter] ?? 0;
	const next = current + 1;
	state.counters[counter] = next;
	return next;
};

export const getCounterValue = (state: DreamState, counter: string) => state.counters[counter] ?? 0;

export const pushMessage = (state: DreamState, message: string) => {
	state.messages = [...state.messages, message];
};

export const clearMessages = (state: DreamState) => {
	state.messages = [];
};
