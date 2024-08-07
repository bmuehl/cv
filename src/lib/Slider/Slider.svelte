<script lang="ts">
	import { skills, store, type Skill } from '$lib/store.svelte';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { inView, onCollision } from '$lib/utils';
	import Rating from '$lib/Rating/Rating.svelte';
	import Icon from '$lib/Icon/Icon.svelte';
	import Pause from '$lib/Icon/icons/Pause.svelte';
	import Play from '$lib/Icon/icons/Play.svelte';
	import { slide } from 'svelte/transition';
	import { untrack } from 'svelte';

	let { fadeOut = true }: { fadeOut?: boolean } = $props();

	let slides: HTMLDivElement | undefined = $state(undefined);
	let collider: HTMLDivElement | undefined = $state(undefined);
	let showControlDescription = $state(false);
	let autoScroll = $state(true);
	const speed = 1.5;

	const focusTransition = tweened(0, { duration: 500, easing: cubicOut });

	const setActiveSlide = (skill: Skill | undefined) => {
		if (skill) {
			store.update({ activeSkill: skill });
		}
	};

	const setSlideFocus = (skill: Skill | undefined) => {
		if (!slides || !skill) {
			return;
		}

		const slide = slides.querySelector<HTMLDivElement>(
			`[data-slideId="${skills.findIndex((s) => s.name === skill.name)}"]`
		);

		if (slide) {
			focusTransition.set(slides.scrollLeft, { duration: 0 });
			focusTransition.set(slide.offsetLeft - slides.offsetWidth / 2 + slide.clientWidth / 2);
			focusTransition.subscribe((value) => {
				if (slides) {
					slides.scrollLeft = value;
				}
			});
			setActiveSlide(skill);
			if (document.activeElement !== slide) {
				autoScroll = false;
				slide.focus();
			}
		}
	};

	const collisionHandler = (skill: Skill | undefined) => {
		if (!store.value.focusSkill) {
			setActiveSlide(skill);
		}
	};

	const swapNodes = (e: CustomEvent) => {
		const node = e.target as HTMLDivElement;
		const id = Number(node.dataset.slideid) - skills.length;
		const slide = slides?.querySelector<HTMLDivElement>(`[data-slideId="${id}"]`);
		if (slide) {
			swap(slide, node);
		}
	};

	function swap(node1: HTMLElement, node2: HTMLElement) {
		const afterNode1 = node1.nextElementSibling;
		node2.replaceWith(node1);
		slides?.insertBefore(node2, afterNode1);
	}

	function focusCurrent() {
		if (store.value.focusSkill) {
			store.update({ focusSkill: undefined });
			autoScroll = true;
		} else {
			store.update({ focusSkill: store.value.activeSkill });
		}
	}

	$effect(() => {
		untrack(() => {
			let msPrev = performance.now();
			const fps = 60;
			const msPerFrame = 1000 / fps;

			const loop = () => {
				requestAnimationFrame(loop);

				const msNow = window.performance.now();
				const msPassed = msNow - msPrev;

				if (msPassed < msPerFrame) return; // ensure fps

				const excessTime = msPassed % msPerFrame;
				msPrev = msNow - excessTime;

				if (slides) {
					if (
						slides.scrollWidth / 2 - slides.clientWidth <=
						slides.scrollLeft - slides.clientWidth
					) {
						slides.scrollLeft = 0;
					}

					if (autoScroll) {
						slides.scrollLeft += speed;
					}
				}
			};
			loop();
		});
	});

	$effect(() => {
		if (store.value.focusSkill) {
			setSlideFocus(store.value.focusSkill);
			autoScroll = false;
		}
	});
</script>

<div class="slider" class:before:hidden={!fadeOut} class:after:hidden={!fadeOut}>
	<div class="collider" bind:this={collider}></div>
	<div class="slides" bind:this={slides}>
		{#each { length: skills.length * 2 } as _n, i}
			{#if i < skills.length}
				{@const skill = skills[i]}
				<button
					class="slide"
					class:active={store.value.activeSkill?.name === skill.name}
					onclick={() => store.update({ focusSkill: skill })}
					data-slideId={i}
					use:onCollision={{ collider }}
					oncollision={() => collisionHandler(skill)}
				>
					<img src={skill.logo} alt={skill.name} />
				</button>
			{:else}
				{@const skill = skills[i - skills.length]}
				<div class="slide" data-slideId={i} use:inView={{ threshold: 0 }} onenter={swapNodes}>
					<img src={skill.logo} alt={skill.name} />
				</div>
			{/if}
		{/each}
	</div>
	<div
		class="absolute bottom-0 right-2 z-20 flex items-end md:h-full"
		class:opacity-40={!store.value.focusSkill}
	>
		<button
			class="flex items-center"
			onclick={focusCurrent}
			onmouseenter={() => (showControlDescription = true)}
			onmouseleave={() => (showControlDescription = false)}
			onfocus={() => (showControlDescription = true)}
			onblur={() => (showControlDescription = false)}
		>
			{#if showControlDescription}
				<span transition:slide class="text-sm">{store.value.focusSkill ? 'Play' : 'Pause'}</span>
			{/if}
			<Icon src={store.value.focusSkill ? Play : Pause} />
		</button>
	</div>
</div>

<div class="description">
	<div class="header">
		<strong class="text-lg">{store.value.activeSkill?.name}</strong>
		{#if store.value.activeSkill?.url}
			<div class="flex items-center">
				<a
					href={store.value.activeSkill.url}
					target="_blank"
					rel="noopener noreferrer"
					class="ml-1 flex items-center text-xs"
				>
					open website
				</a>
			</div>
		{/if}
	</div>
	<hr class="w-full border-t border-cat-surface2" />
	<div class="flex flex-auto items-center p-6 text-center">
		{store.value.activeSkill?.description}
	</div>
	<hr class="w-full border-t border-cat-surface2" />
	<div class="footer">
		<Rating score={store.value.activeSkill?.score || 0} />
	</div>
</div>

<style lang="postcss">
	.slider {
		@apply relative flex flex-col;
		@apply max-w-7xl before:left-0 before:bg-gradient-to-r after:right-0 after:bg-gradient-to-l;

		&::before,
		&::after {
			@apply absolute bottom-0 top-0 z-10 w-20 rounded-tl-lg rounded-tr-lg from-cat-surface0 to-transparent content-[''];
			@apply pointer-events-none;
			--tw-gradient-to: rgba(46, 52, 64, 0); /* fix for safari */
		}
	}

	.slides {
		@apply flex overflow-y-hidden overflow-x-scroll py-2;
		-ms-overflow-style: none; /* for Internet Explorer, Edge */
		scrollbar-width: none; /* for Firefox */
	}

	.collider {
		@apply absolute left-1/2 h-full w-[1px] bg-transparent;
	}

	.slides::-webkit-scrollbar {
		display: none; /* for Chrome, Safari, and Opera */
	}

	.slide {
		@apply pointer-events-auto flex h-32 w-32 flex-shrink-0 cursor-pointer items-center justify-center rounded-3xl p-6 transition-colors duration-200;

		img {
			@apply h-full w-full select-none object-contain transition-transform duration-300;
			@apply scale-0;
			--tw-scale-x: 0.6;
			--tw-scale-y: 0.6;
		}

		&.active {
			@apply bg-cat-surface2 bg-opacity-50;
		}

		&:hover img,
		&.active img {
			@apply scale-100;
		}
	}

	.description {
		@apply mt-6 flex max-w-3xl flex-auto flex-col rounded-lg;

		.header {
			@apply flex flex-col items-center justify-center p-3;
		}

		.footer {
			@apply flex items-center justify-center p-3;
		}
	}
</style>
