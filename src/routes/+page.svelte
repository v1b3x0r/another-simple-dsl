<script lang="ts">
	import { parseDSL, type SceneDefinition } from '$lib/engine/parse';
	import { DreamEngine } from '$lib/engine/run';
	import SceneFrame from '$lib/scenes/scene-frame.svelte';
	import { humanizeId } from '$lib/utils/text';
	import dreamflowDSL from '../rules/dreamflow.dsl?raw';

	type SceneComponent = typeof SceneFrame;

	const SCENE_COMPONENTS: Record<string, SceneComponent> = {};

	const parsedDSL = parseDSL(dreamflowDSL);
	const { world: worldName, scenes, rules } = parsedDSL;
	const engine = new DreamEngine(rules);
	let currentScene: string = engine.state.scene;
	const sceneOrder = Object.keys(scenes);
	let counters: Record<string, number> = { ...engine.state.counters };
	let messages: string[] = [...engine.state.messages];
	let finishedLabel: string | null = engine.state.finished;

	function act(eventName: string) {
		engine.trigger(eventName);
		currentScene = engine.state.scene;
		counters = { ...engine.state.counters };
		messages = [...engine.state.messages];
		finishedLabel = engine.state.finished;
		const lastRecord = engine.history[engine.history.length - 1] ?? null;
		if (lastRecord) {
			console.log('[dreamflow]', lastRecord);
		}
	}
</script>

<main class="dreamflow">
	<h1>{worldName ?? 'Dreamflow Sandbox'}</h1>

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

	{#if scenes[currentScene]}
		{@const sceneData = scenes[currentScene] as SceneDefinition}
		{@const SceneComponent = SCENE_COMPONENTS[currentScene] ?? SceneFrame}
		<SceneComponent scene={sceneData} onAction={act} />
	{:else}
		<p class="status error">ฉาก {currentScene} ไม่มีใน DSL</p>
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
	}

	h1 {
		margin: 0;
		font-size: 2rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
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
		max-width: 900px;
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
