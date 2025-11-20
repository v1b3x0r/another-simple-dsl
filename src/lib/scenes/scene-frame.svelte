<script lang="ts">
	import type { SceneDefinition } from '$lib/engine/parse';
	import { actionLabelFromId, humanizeId } from '$lib/utils/text';

	export let scene: SceneDefinition;
	export let onAction: (actionId: string) => void;

	const sceneTitle = (id: string) => humanizeId(id);
</script>

<section
	class="flex max-w-md flex-col gap-4 rounded-2xl border border-white/10 bg-black/40 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
>
	<header class="space-y-1">
		<h2 class="text-xl font-semibold">{sceneTitle(scene.id)}</h2>
		<p class="text-sm text-white/75">{scene.description}</p>
	</header>

	<div class="flex flex-col gap-3">
		{#each scene.actions as actionId}
			<button
				type="button"
				on:click={() => onAction(actionId)}
				class="rounded-full border border-white/20 bg-white/5 px-4 py-3 text-base transition duration-150 hover:-translate-y-0.5 hover:border-white/40"
			>
				{actionLabelFromId(actionId)}
			</button>
		{/each}
	</div>
</section>
