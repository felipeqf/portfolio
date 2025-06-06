<script lang="ts">
  import type { PortfolioData, PageData } from '../types/types.js';
  import CardsOutside from '$lib/components/sections/Cards/CardsOutside.svelte';
	import CardsWithLink from './sections/Cards/CardsWithLink.svelte';
	import Cards from './sections/Cards/Cards.svelte'; 
	import CardsWithIcons from '$lib/components/sections/Cards/CardsWithIcons.svelte';


  export let portfolioData: PortfolioData;
  export let content: PageData['content'];

  // Extract the pagination setting
  $: itemsPerPage = portfolioData.settings?.cards_before_pagination || 3;
</script>

{#each portfolioData.sections as section}
    {#if section.type === 'cards_with_link'}
      <CardsWithLink 
        sectionTitle={section.title}
        items={section.content || []}
        {itemsPerPage}
      />
    {:else if section.type === 'cards_with_icons'}
      <CardsWithIcons
        skillsData={section.content as any}
      />
    {:else if section.type === 'cards'}
      <Cards 
        sectionTitle={section.title}
        items={section.content || []}
        {itemsPerPage}
      />
    {:else if section.type === 'cards_outside'}
      <CardsOutside 
        sectionTitle={section.title}
        items={content[section.title.toLowerCase()]?.content || []}
        availableTags={content[section.title.toLowerCase()]?.tags || []}
        {itemsPerPage}
      />
    {/if}
{/each}