<script lang="ts">
  import { onMount } from 'svelte';
  import { visibleCards } from '../lib/store';

  let { tags = [], sources = [] }: { tags: string[]; sources: string[] } = $props();

  const TAG_GROUPS: { label: string; tags: string[] }[] = [
    { label: 'Type', tags: ['starter', 'template', 'tool', 'collection', 'prototype', 'demo'] },
    { label: 'Tech', tags: ['react', 'solid', 'gsap', 'wasm', 'web-components', 'webawesome', 'openrouter', 'matchina', 'chatscope', 'markstream'] },
    { label: 'Motion & Interactivity', tags: ['animation', 'motion', 'interactive', 'simulation', 'game', 'reactive', 'persistent', 'streaming'] },
    { label: 'Data & Viz', tags: ['chart', 'viz', 'data', 'diagram', 'map', 'dashboard', 'report'] },
    { label: 'Content', tags: ['article', 'blog', 'card', 'deck', 'document', 'editor', 'email', 'frame', 'magazine', 'markdown', 'poster', 'presentation', 'resume', 'social'] },
    { label: 'Media', tags: ['video', 'html-to-video', 'pdf', '3d', 'ai'] },
    { label: 'Apps', tags: ['app', 'chat'] },
  ];

  const allGroupedTags = new Set(TAG_GROUPS.flatMap(g => g.tags));
  const otherTags = tags.filter(t => !allGroupedTags.has(t));
  if (otherTags.length) TAG_GROUPS.push({ label: 'Other', tags: otherTags });

  const views = [
    ['featured', 'Featured'],
    ['mine', 'Mine'],
    ['collected', 'Collected'],
    ['templates', 'Templates'],
    ['all', 'All'],
  ] as const;

  let view = $state('featured');
  let src = $state('');
  let tag = $state('');
  let q = $state('');
  let sidebarOpen = $state(false);
  let count = $state(0);
  let cards: HTMLElement[] = [];

  // --- Hash-based URL persistence ---

  function readHash() {
    const params = new URLSearchParams(location.hash.slice(1));
    view = params.get('view') ?? 'featured';
    src = params.get('src') ?? '';
    tag = params.get('tag') ?? '';
    q = params.get('q') ?? '';
  }

  function updateHash() {
    const params = new URLSearchParams();
    if (view !== 'featured') params.set('view', view);
    if (src) params.set('src', src);
    if (tag) params.set('tag', tag);
    if (q.trim()) params.set('q', q.trim());
    const qs = params.toString();
    history.replaceState(null, '', qs ? '#' + qs : location.pathname + location.search);
  }

  function onHashChange() {
    readHash();
    if (cards.length) apply();
  }

  // ----------------------------------

  onMount(() => {
    cards = Array.from(document.querySelectorAll<HTMLElement>('.card'));
    readHash();
    apply();
    document.addEventListener('toggle-sidebar', () => (sidebarOpen = !sidebarOpen));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  });

  function apply() {
    const ql = q.trim().toLowerCase();
    let n = 0;
    const visible: HTMLElement[] = [];
    for (const card of cards) {
      const cardTags = (card.dataset.tags || '').split(',');
      const show =
        inView(card) &&
        (!src || card.dataset.source === src) &&
        (!tag || cardTags.includes(tag)) &&
        (!ql ||
          (card.dataset.name || '').includes(ql) ||
          cardTags.some(t => t.includes(ql)) ||
          (card.dataset.source || '').includes(ql));
      card.classList.toggle('hidden', !show);
      if (show) { n++; visible.push(card); }
    }
    count = n;
    visibleCards.set(visible);
  }

  function inView(card: HTMLElement) {
    if (view === 'all') return true;
    if (view === 'featured') return card.dataset.featured === 'true';
    return card.dataset.bucket === view;
  }

  function setView(v: string) { view = v; apply(); updateHash(); closeSidebar(); }
  function setSrc(s: string) { src = s; apply(); updateHash(); closeSidebar(); }
  function setTag(t: string) { tag = t; apply(); updateHash(); closeSidebar(); }

  function closeSidebar() {
    if (window.innerWidth < 768) sidebarOpen = false;
  }

  $effect(() => {
    // re-run apply when q changes (after mount)
    if (cards.length) { q; apply(); updateHash(); }
  });
</script>

<!-- Mobile backdrop -->
{#if sidebarOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 z-40 bg-black/60 md:hidden"
    aria-hidden="true"
    onclick={() => (sidebarOpen = false)}
  ></div>
{/if}


<aside
  id="sidebar"
  class="fixed inset-y-0 left-0 z-50 w-72 shrink-0 border-r border-border flex flex-col bg-background overflow-y-auto transition-transform duration-200 md:sticky md:top-0 md:h-screen md:w-60 md:transition-none"
  class:sidebar-closed={!sidebarOpen}
>
  <!-- Search -->
  <div class="px-4 pt-4 pb-3 border-b border-border">
    <input
      id="q"
      type="search"
      placeholder="Search…"
      bind:value={q}
      class="w-full rounded border border-border bg-muted px-3 py-1.5 text-sm outline-none focus:border-accent placeholder:text-muted-foreground/60"
    />
  </div>

  <!-- Views -->
  <div class="px-4 pt-4 pb-2">
    <p class="mb-2 text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground/50">View</p>
    <div class="flex flex-col gap-0.5">
      {#each views as [val, label]}
        <button
          class="w-full rounded px-2.5 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:py-1.5"
          class:active={view === val}
          onclick={() => setView(val)}
        >{label}</button>
      {/each}
    </div>
  </div>

  <div class="mx-4 border-t border-border my-2"></div>

  <!-- Source -->
  <div class="px-4 py-2">
    <p class="mb-2 text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground/50">Source</p>
    <div class="flex flex-col gap-0.5">
      <button
        class="w-full rounded px-2.5 py-2.5 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground md:py-1.5"
        class:active={src === ''}
        onclick={() => setSrc('')}
      >all</button>
      {#each sources as s}
        <button
          class="w-full rounded px-2.5 py-2.5 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground md:py-1.5"
          class:active={src === s}
          onclick={() => setSrc(s)}
        >{s}</button>
      {/each}
    </div>
  </div>

  <div class="mx-4 border-t border-border my-2"></div>

  <!-- Tags by group -->
  <div class="px-4 py-2 pb-6 flex flex-col gap-3">
    <p class="text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground/50">Tags</p>
    <button
      class="w-full rounded px-2.5 py-2.5 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground md:py-1"
      class:active={tag === ''}
      onclick={() => setTag('')}
    >all tags</button>

    {#each TAG_GROUPS as group}
      {@const groupTags = group.tags.filter(t => tags.includes(t))}
      {#if groupTags.length}
        <details open>
          <summary class="flex cursor-pointer list-none items-center justify-between py-0.5 text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground/70 hover:text-muted-foreground select-none">
            {group.label}
            <span class="text-muted-foreground/40">›</span>
          </summary>
          <div class="mt-1 flex flex-col gap-0.5 pl-1">
            {#each groupTags as t}
              <button
                class="w-full rounded px-2 py-2.5 text-left text-[0.8rem] text-muted-foreground hover:bg-muted hover:text-foreground md:py-1"
                class:active-tag={tag === t}
                onclick={() => setTag(t)}
              >{t}</button>
            {/each}
          </div>
        </details>
      {/if}
    {/each}
  </div>

  <!-- Count -->
  <div class="mt-auto px-4 py-3 border-t border-border sticky bottom-0 bg-background">
    <p class="text-xs text-muted-foreground">{count} artifact{count === 1 ? '' : 's'}</p>
  </div>
</aside>

<style>
  /* On mobile (<768px), hide sidebar by default; open class shows it */
  @media (max-width: 767px) {
    aside.sidebar-closed {
      transform: translateX(-100%);
    }
  }
  .active {
    background-color: var(--color-muted);
    color: var(--color-foreground);
    font-weight: 500;
  }
  .active-tag {
    background-color: var(--color-muted);
    color: var(--color-accent);
    font-weight: 500;
  }
</style>
