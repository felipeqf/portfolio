<script lang="ts">
	export let sectionTitle: string;
	export let items: any[];
	export let itemsPerPage: number = 5;
	
	import { fadeIn } from '$lib/utils/fadeIn';
	import TruncatedMarkdown from '$lib/components/common/TruncatedMarkdown.svelte';
	import Pagination from '$lib/components/common/Pagination.svelte';
	import '/src/styles/cards.css';

	let currentPage = 1;

	$: totalPages = Math.ceil(items.length / itemsPerPage);

	$: paginatedItems = items.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

	function handlePageChange(newPage: number) {
		if (newPage >= 1 && newPage <= totalPages) {
			currentPage = newPage;
		}
	}
</script>

<section id={sectionTitle.toLowerCase()} class="section" use:fadeIn>
	<h2 class="section-title">{sectionTitle}</h2>
	{#each paginatedItems as item, index (item.title || index)}
		<div class="timeline-content">
			<div class="details">
				<span class="date">{item.date}</span>
				<!-- Check for icon -->
				{#if item?.icon}
					<div class="timeline-header">
						<div class="timeline-icon">
							<img src={item.icon} alt="" />
						</div>
						<h3>
							{item.title}
						</h3>
					</div>
				{:else}
					<h3>
						{item.title}
					</h3>
				{/if}
				{#each ['school', 'company', 'description', 'publication'] as key}
					{#if item[key]}
						<div class="content-item">
							{#if key === 'description'}
								<TruncatedMarkdown text={item.description} />
							{:else}
								<p>{item[key]}</p>
							{/if}
						</div>
					{/if}
				{/each}
				{#if item.link}
					<div class="external-link-wrapper">
						<a href={item.link} target="_blank" rel="noopener noreferrer" class="hover-link">
							<p>{item.link}</p>
						</a>
					</div>
				{/if}
			</div>
		</div>
	{/each}
	<Pagination {currentPage} {totalPages} onPageChange={handlePageChange} />
</section>

