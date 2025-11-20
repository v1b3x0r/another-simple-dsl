import type { DreamState } from '$lib/engine/state';
import type { TriggerRecord } from '$lib/engine/run';

export type SavedGame = {
	worldId: string;
	state: DreamState;
	history: TriggerRecord[];
	timestamp: number;
	version: string;
};

const STORAGE_KEY_PREFIX = 'dreamtheater:save:';
const CURRENT_VERSION = '1.0';

/**
 * Save game state to localStorage
 */
export function saveGame(worldId: string, state: DreamState, history: TriggerRecord[]): void {
	if (typeof window === 'undefined') return;

	const saved: SavedGame = {
		worldId,
		state: JSON.parse(JSON.stringify(state)), // Deep clone
		history: JSON.parse(JSON.stringify(history)),
		timestamp: Date.now(),
		version: CURRENT_VERSION
	};

	try {
		localStorage.setItem(STORAGE_KEY_PREFIX + worldId, JSON.stringify(saved));
	} catch (e) {
		console.warn('Failed to save game:', e);
	}
}

/**
 * Load game state from localStorage
 */
export function loadGame(worldId: string): SavedGame | null {
	if (typeof window === 'undefined') return null;

	try {
		const raw = localStorage.getItem(STORAGE_KEY_PREFIX + worldId);
		if (!raw) return null;

		const saved = JSON.parse(raw) as SavedGame;

		// Version check (for future migrations)
		if (saved.version !== CURRENT_VERSION) {
			console.warn(`Save version mismatch: ${saved.version} vs ${CURRENT_VERSION}`);
		}

		return saved;
	} catch (e) {
		console.warn('Failed to load game:', e);
		return null;
	}
}

/**
 * Check if a save exists for a world
 */
export function hasSavedGame(worldId: string): boolean {
	if (typeof window === 'undefined') return false;
	return localStorage.getItem(STORAGE_KEY_PREFIX + worldId) !== null;
}

/**
 * Delete saved game
 */
export function deleteSave(worldId: string): void {
	if (typeof window === 'undefined') return;
	localStorage.removeItem(STORAGE_KEY_PREFIX + worldId);
}

/**
 * Get all saved games
 */
export function getAllSaves(): SavedGame[] {
	if (typeof window === 'undefined') return [];

	const saves: SavedGame[] = [];
	for (let i = 0; i < localStorage.length; i++) {
		const key = localStorage.key(i);
		if (key?.startsWith(STORAGE_KEY_PREFIX)) {
			try {
				const raw = localStorage.getItem(key);
				if (raw) saves.push(JSON.parse(raw));
			} catch (e) {
				console.warn('Failed to parse save:', key, e);
			}
		}
	}
	return saves;
}
