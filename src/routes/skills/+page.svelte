<script lang="ts">
	import Slider from '$lib/Slider/Slider.svelte';
	import TagCloud from '$lib/TagCloud/TagCloud.svelte';
	import Card from '$lib/Card/Card.svelte';
</script>

<svelte:head>
	<title>Bernhard Mühl | My Skills</title>
</svelte:head>

<div class="hidden h-full w-full items-center lg:flex">
	<div class="container grid h-full max-h-[750px] w-full grid-cols-[minmax(0,_1fr)_auto]">
		<TagCloud />

		<div class="max-w-96">
			<Card class="h-full">
				{#snippet header()}
					<div class="flex flex-col overflow-hidden">
						<div class="h-6"></div>
						<Slider fadeOut={false} />
					</div>
				{/snippet}
			</Card>
		</div>
	</div>
</div>

<div class="container lg:hidden">
	<div class="h-96">
		<TagCloud />
	</div>

	<div class="h-6"></div>

	<div class="overflow-hidden">
		<Slider />
	</div>
</div>
