export type RuleCategory = 'flow' | 'guard' | 'effect' | 'system';

export type Rule = {
	type: 'rule';
	condition: string;
	action: string;
	category: RuleCategory;
	label?: string;
};

export type SceneDefinition = {
	id: string;
	description: string;
	actions: string[];
	hint?: string;
};

export type ParseError = {
	type: 'error' | 'warning';
	message: string;
	line?: number;
	context?: string;
};

export type ParsedDSL = {
	world?: string;
	rules: Rule[];
	scenes: Record<string, SceneDefinition>;
	errors: ParseError[];
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

const annotationToCategory = (annotation?: string): RuleCategory => {
	if (!annotation) return 'flow';
	const token = annotation.replace(/^@/, '').toLowerCase();
	if (token === 'guard' || token === 'physics') return 'guard';
	if (token === 'effect') return 'effect';
	if (token === 'system') return 'system';
	return 'flow';
};

export function parseDSL(text: string): ParsedDSL {
	const normalized = text.replace(/\r\n/g, '\n');
	const worldMatch = normalized.match(/world\s+([a-zA-Z0-9_-]+)\s*\{([\s\S]*)\}\s*$/);
	const sourceBody = worldMatch ? worldMatch[2] : normalized;
	const worldName = worldMatch?.[1];

	const rules: Rule[] = [];
	const scenes: Record<string, SceneDefinition> = {};
	const errors: ParseError[] = [];

	// Parse scenes
	for (const match of sourceBody.matchAll(/scene\s+([a-zA-Z0-9_-]+)\s*\{([\s\S]*?)\}/g)) {
		const [, sceneId, body] = match;
		const descriptionMatch = body.match(/description:\s*"([^"]*)"/);
		const actionsMatch = body.match(/actions:\s*\[([\s\S]*?)\]/);
		const hintMatch = body.match(/hint:\s*"([^"]*)"/);

		// Validate scene has description
		if (!descriptionMatch) {
			errors.push({
				type: 'error',
				message: `Scene "${sceneId}" is missing a description`,
				context: sceneId
			});
		}

		scenes[sceneId] = {
			id: sceneId,
			description: descriptionMatch ? descriptionMatch[1] : '',
			actions: parseActions(actionsMatch ? actionsMatch[1] : undefined),
			hint: hintMatch ? hintMatch[1] : undefined
		};
	}

	// Parse rules
	const ruleRegex = /(@[a-zA-Z0-9_-]+)?\s*when\s+(.+?)\s+leadsTo\s+(.+)/g;
	for (const match of sourceBody.matchAll(ruleRegex)) {
		const [, annotation, condition, action] = match;

		rules.push({
			type: 'rule',
			condition: condition.trim(),
			action: action.trim(),
			category: annotationToCategory(annotation)
		});
	}

	// Validation: Check for goto targets that don't exist
	const sceneIds = new Set(Object.keys(scenes));
	for (const rule of rules) {
		const gotoMatch = rule.action.match(/goto\("([^"]+)"\)/);
		if (gotoMatch) {
			const targetScene = gotoMatch[1];
			if (!sceneIds.has(targetScene)) {
				errors.push({
					type: 'warning',
					message: `Rule references undefined scene "${targetScene}"`,
					context: rule.action
				});
			}
		}
	}

	// Validation: Check for scenes with no incoming flows (except initial scene)
	const reachableScenes = new Set<string>(['lobby']); // lobby is default initial scene
	for (const rule of rules) {
		const gotoMatch = rule.action.match(/goto\("([^"]+)"\)/);
		if (gotoMatch) {
			reachableScenes.add(gotoMatch[1]);
		}
	}

	for (const sceneId of sceneIds) {
		if (!reachableScenes.has(sceneId)) {
			errors.push({
				type: 'warning',
				message: `Scene "${sceneId}" is not reachable from any rule`,
				context: sceneId
			});
		}
	}

	return { world: worldName, rules, scenes, errors };
}
