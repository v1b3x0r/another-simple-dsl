export type Rule = {
	type: 'rule';
	condition: string;
	action: string;
};

export type SceneDefinition = {
	id: string;
	description: string;
	actions: string[];
};

export type ParsedDSL = {
	rules: Rule[];
	scenes: Record<string, SceneDefinition>;
};

const stripQuotes = (value: string) => value.replace(/^"(.*)"$/, '$1');

const parseActions = (raw: string | undefined): string[] => {
	if (!raw) return [];
	return raw
		.split(',')
		.map((token) => token.trim())
		.filter(Boolean)
		.map((token) => stripQuotes(token.replace(/,$/, '')));
};

export function parseDSL(text: string): ParsedDSL {
	const rules: Rule[] = [];
	const scenes: Record<string, SceneDefinition> = {};

	for (const match of text.matchAll(/scene\s+([a-zA-Z0-9_-]+)\s*\{([\s\S]*?)\}/g)) {
		const [, sceneId, body] = match;
		const descriptionMatch = body.match(/description:\s*"([^"]*)"/);
		const actionsMatch = body.match(/actions:\s*\[([\s\S]*?)\]/);

		scenes[sceneId] = {
			id: sceneId,
			description: descriptionMatch ? descriptionMatch[1] : '',
			actions: parseActions(actionsMatch ? actionsMatch[1] : undefined)
		};
	}

	for (const match of text.matchAll(/when\s+(.+?)\s+leadsTo\s+(.+)/g)) {
		const [, condition, action] = match;

		rules.push({
			type: 'rule',
			condition: condition.trim(),
			action: action.trim()
		});
	}

	return { rules, scenes };
}
