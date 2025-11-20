import type { ParsedDSL } from '$lib/engine/parse';
import { parseDSL } from '$lib/engine/parse';

export type WorldMetadata = {
	id: string;
	name: string;
	description: string;
	difficulty?: 'easy' | 'medium' | 'hard';
};

export type LoadedWorld = {
	metadata: WorldMetadata;
	parsed: ParsedDSL;
	source: string;
};

// Registry of available worlds
// In production, this could be loaded dynamically from a worlds/ directory
const worldRegistry = new Map<string, () => Promise<string>>();

/**
 * Register a world with its loader function
 */
export function registerWorld(id: string, loader: () => Promise<string>) {
	worldRegistry.set(id, loader);
}

/**
 * Get list of all available worlds
 */
export function getAvailableWorlds(): string[] {
	return Array.from(worldRegistry.keys());
}

/**
 * Load a world by ID
 */
export async function loadWorld(worldId: string): Promise<LoadedWorld> {
	const loader = worldRegistry.get(worldId);
	if (!loader) {
		throw new Error(`World "${worldId}" not found`);
	}

	const source = await loader();
	const parsed = parseDSL(source);

	// Extract metadata from DSL or use defaults
	const metadata: WorldMetadata = {
		id: worldId,
		name: parsed.world || worldId,
		description: `A DreamTheater world` // Could be extracted from DSL comments
	};

	return { metadata, parsed, source };
}

/**
 * Validate that a world has no critical errors
 */
export function validateWorld(world: LoadedWorld): boolean {
	const criticalErrors = world.parsed.errors.filter((e) => e.type === 'error');
	return criticalErrors.length === 0;
}
