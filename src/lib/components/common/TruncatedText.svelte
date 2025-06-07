<script lang="ts">
	export let text: string;
	export let className: string = '';

	// Responsive character limits
	export let mobileLimit: number = 50;
	export let tabletLimit: number = 150;
	export let desktopLimit: number = 200;

	let isExpanded = false;
	let windowWidth = 0;

	// Reactive character limit based on screen size
	$: responsiveCharLimit = getResponsiveCharLimit(windowWidth);

	function getResponsiveCharLimit(width: number): number {
		if (width < 900) {
			return mobileLimit;
		} else if (width < 1300) {
			return tabletLimit;
		} else {
			return desktopLimit;
		}
	}

	function shouldTruncate(): boolean {
		return !!(text && text.length > responsiveCharLimit);
	}

	function getTruncatedText(): string {
		return text.substring(0, responsiveCharLimit) + '...';
	}

	function toggleExpanded() {
		isExpanded = !isExpanded;
	}
</script>

<svelte:window bind:innerWidth={windowWidth} />

{#if shouldTruncate()}
	<p class={className}>
		{isExpanded ? text : getTruncatedText()}
		<button class="show-more-btn inline" on:click={toggleExpanded}>
			{isExpanded ? 'Show less' : 'Show more'}
		</button>
	</p>
{:else}
	<p class={className}>{text}</p>
{/if}

<style>
	.show-more-btn {
		background: none;
		border: none;
		color: var(--accent-color, #007acc);
		cursor: pointer;
		font-size: 0.9rem;
		text-decoration: underline;
		padding: 0;
		margin-left: 0.25rem;
		transition: opacity 0.2s ease;
	}

	.show-more-btn:hover {
		opacity: 0.8;
	}
</style>
