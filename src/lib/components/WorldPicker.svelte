<script lang="ts">
	import { hasSavedGame } from '$lib/worlds/persistence';

	type World = {
		id: string;
		name: string;
		file: string;
	};

	type Props = {
		worlds: World[];
		selectedId: string;
		hasErrors: boolean;
		errors: any[];
		onSelect: (id: string) => void;
		onNewGame: () => void;
		onContinue: () => void;
		onDeleteSave: () => void;
	};

	let { worlds, selectedId, hasErrors, errors, onSelect, onNewGame, onContinue, onDeleteSave }: Props = $props();

	let hasSave = $derived(hasSavedGame(selectedId));
</script>

<section class="world-picker">
	<div class="picker-card">
		<h2>เลือก World</h2>

		<div class="world-list">
			{#each worlds as world}
				<button
					class={`world-option ${selectedId === world.id ? 'selected' : ''}`}
					onclick={() => onSelect(world.id)}
				>
					<div class="world-name">{world.name}</div>
					{#if hasSavedGame(world.id)}
						<small class="save-indicator">💾 มีเซฟไว้</small>
					{/if}
				</button>
			{/each}
		</div>

		{#if hasErrors && errors.length > 0}
			<div class="error-box">
				<h3>⚠️ พบปัญหาใน DSL</h3>
				{#each errors as error}
					<div class={`error-item ${error.type}`}>
						<strong>{error.type}:</strong>
						{error.message}
					</div>
				{/each}
			</div>
		{/if}

		<div class="game-controls">
			<button class="btn-primary" onclick={onNewGame} disabled={hasErrors}>
				🎮 เกมใหม่
			</button>

			{#if hasSave}
				<button class="btn-secondary" onclick={onContinue}>📂 เล่นต่อ</button>
				<button class="btn-danger" onclick={onDeleteSave}>🗑️ ลบเซฟ</button>
			{/if}
		</div>
	</div>
</section>

<style>
	.world-picker {
		width: 100%;
		max-width: 600px;
	}

	.picker-card {
		padding: 2rem;
		border-radius: 1rem;
		border: 1px solid rgba(255, 255, 255, 0.2);
		background: rgba(255, 255, 255, 0.05);
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.picker-card h2 {
		margin: 0;
		font-size: 1.5rem;
		text-align: center;
	}

	.world-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.world-option {
		padding: 1rem;
		border-radius: 0.5rem;
		border: 2px solid rgba(255, 255, 255, 0.2);
		background: rgba(255, 255, 255, 0.03);
		cursor: pointer;
		transition: all 0.2s;
		text-align: left;
	}

	.world-option:hover {
		background: rgba(255, 255, 255, 0.08);
		border-color: rgba(255, 255, 255, 0.4);
	}

	.world-option.selected {
		background: rgba(164, 92, 255, 0.2);
		border-color: rgba(164, 92, 255, 0.6);
	}

	.world-name {
		font-size: 1.1rem;
		font-weight: 600;
	}

	.save-indicator {
		color: rgba(255, 255, 255, 0.6);
		font-size: 0.85rem;
	}

	.game-controls {
		display: flex;
		gap: 0.75rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	.btn-primary,
	.btn-secondary,
	.btn-danger {
		padding: 0.75rem 1.5rem;
		border-radius: 0.5rem;
		border: none;
		font-size: 1rem;
		cursor: pointer;
		transition: all 0.2s;
		font-weight: 600;
	}

	.btn-primary {
		background: rgba(164, 92, 255, 0.8);
		color: white;
	}

	.btn-primary:hover:not(:disabled) {
		background: rgba(164, 92, 255, 1);
	}

	.btn-primary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-secondary {
		background: rgba(90, 255, 188, 0.2);
		color: #5affbc;
		border: 1px solid rgba(90, 255, 188, 0.5);
	}

	.btn-secondary:hover {
		background: rgba(90, 255, 188, 0.3);
	}

	.btn-danger {
		background: rgba(255, 90, 90, 0.2);
		color: #ff7676;
		border: 1px solid rgba(255, 90, 90, 0.5);
	}

	.btn-danger:hover {
		background: rgba(255, 90, 90, 0.3);
	}

	.error-box {
		padding: 1rem;
		border-radius: 0.5rem;
		background: rgba(255, 90, 90, 0.1);
		border: 1px solid rgba(255, 90, 90, 0.3);
	}

	.error-box h3 {
		margin: 0 0 0.5rem 0;
		font-size: 1rem;
	}

	.error-item {
		padding: 0.5rem;
		margin: 0.25rem 0;
		border-radius: 0.25rem;
		font-size: 0.9rem;
	}

	.error-item.error {
		background: rgba(255, 90, 90, 0.2);
	}

	.error-item.warning {
		background: rgba(255, 200, 90, 0.2);
	}
</style>
