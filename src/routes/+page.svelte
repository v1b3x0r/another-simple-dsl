<script lang="ts">
	import { onMount } from 'svelte';
	import { parseDSL, type SceneDefinition, type ParsedDSL } from '$lib/engine/parse';
	import { DreamEngine } from '$lib/engine/run';
	import { createInitialState } from '$lib/engine/state';
	import SceneFrame from '$lib/scenes/scene-frame.svelte';
	import { humanizeId } from '$lib/utils/text';
	import { saveGame, loadGame, hasSavedGame, deleteSave } from '$lib/worlds/persistence';
	import WorldPicker from '$lib/components/WorldPicker.svelte';

	type World = { id: string; name: string; file: string };

	const WORLDS: World[] = [
		{ id: 'dreamflow', name: 'Dreamflow 2025', file: 'dreamflow.dsl' },
		{ id: 'tutorial', name: 'Tutorial', file: 'tutorial.dsl' }
	];

	let selectedWorldId = $state(WORLDS[0].id);
	let parsedDSL = $state<ParsedDSL | null>(null);
	let engine = $state<DreamEngine | null>(null);
	let showWorldPicker = $state(true);

	let currentScene = $state('lobby');
	let counters = $state<Record<string, number>>({});
	let messages = $state<string[]>([]);
	let finishedLabel = $state<string | null>(null);

	const sceneOrder = $derived(parsedDSL ? Object.keys(parsedDSL.scenes) : []);
	const worldName = $derived(parsedDSL?.world ?? 'DreamTheater');
	const hasErrors = $derived(parsedDSL ? parsedDSL.errors.filter((e) => e.type === 'error').length > 0 : false);

	async function loadWorldFile(worldId: string) {
		const world = WORLDS.find((w) => w.id === worldId);
		if (!world) return;

		try {
			const response = await fetch(`/worlds/${world.file}`);
			const source = await response.text();
			parsedDSL = parseDSL(source);

			if (parsedDSL.errors.length > 0) {
				console.warn('[DreamTheater] Parse errors:', parsedDSL.errors);
			}
		} catch (e) {
			console.error('[DreamTheater] Failed to load world:', e);
		}
	}

	function syncState() {
		if (!engine) return;
		currentScene = engine.state.scene;
		counters = { ...engine.state.counters };
		messages = [...engine.state.messages];
		finishedLabel = engine.state.finished;
	}

	function saveCurrentGame() {
		if (!engine) return;
		saveGame(selectedWorldId, engine.state, engine.history);
	}

	function startNewGame() {
		if (!parsedDSL) return;
		engine = new DreamEngine(parsedDSL.rules);
		engine.state = createInitialState();
		syncState();
		showWorldPicker = false;
		saveCurrentGame();
	}

	function continueGame() {
		const saved = loadGame(selectedWorldId);
		if (!saved || !parsedDSL) return;

		engine = new DreamEngine(parsedDSL.rules);
		engine.state = saved.state;
		for (const record of saved.history) {
			engine.history.push(record);
		}
		syncState();
		showWorldPicker = false;
	}

	function returnToWorldPicker() {
		showWorldPicker = true;
		engine = null;
	}

	function deleteCurrentSave() {
		deleteSave(selectedWorldId);
	}

	function handleWorldSelect(id: string) {
		selectedWorldId = id;
		loadWorldFile(id);
	}

	function act(eventName: string) {
		if (!engine) return;
		engine.trigger(eventName);
		syncState();
		saveCurrentGame();

		const lastRecord = engine.history[engine.history.length - 1];
		if (lastRecord) {
			console.log('[dreamflow]', lastRecord);
		}
	}

	onMount(() => {
		loadWorldFile(selectedWorldId);
	});
</script>

<main class="dreamflow">
	<h1>DreamTheater</h1>

	{#if showWorldPicker}
		<WorldPicker
			worlds={WORLDS}
			selectedId={selectedWorldId}
			{hasErrors}
			errors={parsedDSL?.errors ?? []}
			onSelect={handleWorldSelect}
			onNewGame={startNewGame}
			onContinue={continueGame}
			onDeleteSave={deleteCurrentSave}
		/>
	{:else if engine && parsedDSL}
		<div class="world-header">
			<span class="world-badge">{worldName}</span>
			<button class="btn-small" onclick={returnToWorldPicker}>🏠 กลับหน้าหลัก</button>
		</div>

		<section class="hud">
			<div class="hud-card">
				<h3>ของที่เก็บมา</h3>
				{#if Object.keys(counters).length === 0}
					<p class="status subtle">ยังไม่ได้หยิบอะไรเลย</p>
				{:else}
					<div class="counter-grid">
						{#each Object.entries(counters) as [key, value]}
							<div class="counter-chip">
								<span class="label">{humanizeId(key)}</span>
								<strong>{value}</strong>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<div class="hud-card">
				<h3>สัญญาณจากระบบ</h3>
				{#if messages.length === 0}
					<p class="status subtle">ระบบยังไม่ส่งสัญญาณ</p>
				{:else}
					<ul>
						{#each messages as message}
							<li>{message}</li>
						{/each}
					</ul>
				{/if}
			</div>

			{#if finishedLabel}
				<div class="hud-card success">
					<h3>ภารกิจ</h3>
					<p class="status">เสร็จสิ้น: {humanizeId(finishedLabel)}</p>
				</div>
			{/if}
		</section>

		<section class="journey">
			{#each sceneOrder as sceneId}
				<div class={`journey-chip ${currentScene === sceneId ? 'active' : ''}`}>
					<div class="label">
						<span>{humanizeId(sceneId)}</span>
						{#if currentScene === sceneId}
							<small>คุณอยู่ตรงนี้</small>
						{/if}
					</div>
				</div>
			{/each}
		</section>

		{#if parsedDSL.scenes[currentScene]}
			{@const sceneData = parsedDSL.scenes[currentScene] as SceneDefinition}
			<SceneFrame scene={sceneData} onAction={act} />
		{:else}
			<p class="status error">ฉาก {currentScene} ไม่มีใน DSL</p>
		{/if}
	{/if}
</main>

<style>
	:global(body) {
		min-height: 100vh;
		margin: 0;
		background: radial-gradient(circle at 20% 20%, #1a1038, #050505 75%);
		color: #f1f0ff;
		font-family: 'Space Grotesk', 'Prompt', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.dreamflow {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		align-items: center;
		padding: 2rem;
		width: 100%;
		max-width: 1000px;
	}

	h1 {
		margin: 0;
		font-size: 2rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	.world-header {
		display: flex;
		gap: 1rem;
		align-items: center;
		width: 100%;
		justify-content: space-between;
	}

	.world-badge {
		padding: 0.5rem 1rem;
		border-radius: 999px;
		background: rgba(164, 92, 255, 0.3);
		border: 1px solid rgba(164, 92, 255, 0.5);
		font-size: 0.9rem;
		font-weight: 600;
	}

	.btn-small {
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		border: none;
		font-size: 0.9rem;
		cursor: pointer;
		background: rgba(255, 255, 255, 0.1);
		color: white;
		transition: all 0.2s;
	}

	.btn-small:hover {
		background: rgba(255, 255, 255, 0.2);
	}

	.status {
		color: rgba(255, 255, 255, 0.75);
	}

	.error {
		color: #ff7676;
	}

	.hud {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 1rem;
		width: 100%;
	}

	.hud-card {
		padding: 1rem;
		border-radius: 1rem;
		border: 1px solid rgba(255, 255, 255, 0.1);
		background: rgba(255, 255, 255, 0.03);
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.hud-card h3 {
		margin: 0;
		font-size: 0.95rem;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.75);
		letter-spacing: 0.08em;
	}

	.hud-card ul {
		padding-left: 1.2rem;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.hud-card.success {
		border-color: rgba(90, 255, 188, 0.5);
		background: rgba(90, 255, 188, 0.08);
	}

	.counter-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.counter-chip {
		padding: 0.2rem 0.9rem;
		border-radius: 999px;
		border: 1px solid rgba(255, 255, 255, 0.2);
		background: rgba(255, 255, 255, 0.05);
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.85rem;
	}

	.counter-chip strong {
		font-size: 1rem;
	}

	.status.subtle {
		color: rgba(255, 255, 255, 0.6);
		font-size: 0.85rem;
	}

	.journey {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.5rem;
		max-width: 720px;
	}

	.journey-chip {
		padding: 0.5rem 0.9rem;
		border-radius: 999px;
		border: 1px solid rgba(255, 255, 255, 0.15);
		background: rgba(255, 255, 255, 0.04);
		color: rgba(255, 255, 255, 0.7);
		font-size: 0.9rem;
	}

	.journey-chip.active {
		background: rgba(255, 255, 255, 0.12);
		border-color: rgba(255, 255, 255, 0.6);
		color: #ffffff;
		box-shadow: 0 0 25px rgba(164, 92, 255, 0.35);
	}

	.journey-chip .label {
		display: flex;
		flex-direction: column;
		align-items: center;
		line-height: 1.1;
	}

	.journey-chip small {
		font-size: 0.65rem;
		color: rgba(255, 255, 255, 0.85);
		margin-top: 0.15rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
</style>
