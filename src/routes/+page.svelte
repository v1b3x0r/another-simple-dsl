<script lang="ts">
	import { parseDSL, type SceneDefinition } from '$lib/engine/parse';
	import { DreamEngine } from '$lib/engine/run';
	import SceneFrame from '$lib/scenes/scene-frame.svelte';
	import { humanizeId } from '$lib/utils/text';
	import dreamflowDSL from '../rules/dreamflow.dsl?raw';

	type SceneComponent = typeof SceneFrame;

	const SCENE_COMPONENTS: Record<string, SceneComponent> = {};

	const parsedDSL = parseDSL(dreamflowDSL);
	const { scenes, rules } = parsedDSL;
	const engine = new DreamEngine(rules);
	let currentScene: string = engine.state.scene;
	const sceneOrder = Object.keys(scenes);

	function act(eventName: string) {
		engine.trigger(eventName);
		currentScene = engine.state.scene;
		const lastRecord = engine.history[engine.history.length - 1] ?? null;
		if (lastRecord) {
			console.log('[dreamflow]', lastRecord);
		}
	}
</script>

<main class="dreamflow">
	<h1>Dreamflow Sandbox</h1>

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
