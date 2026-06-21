<script lang="ts">
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { visibleCards } from '../lib/store';

  let dialog: HTMLDialogElement;
  let open = $state(false);
  let currentUrl = $state('');
  let currentTitle = $state('');
  let currentTags = $state<string[]>([]);
  let currentSource = $state('');
  let currentSize = $state('');
  let currentFilename = $state('');
  let idx = $state(-1);
  let cards: HTMLElement[] = [];
  let histLenAtOpen = 0;

  function cardId(card: HTMLElement, i: number) {
    return card.dataset.id || card.dataset.title?.toLowerCase().replace(/\s+/g, '-') || String(i);
  }

  function render(i: number) {
    const card = cards[i];
    if (!card) return;
    idx = i;
    currentUrl = card.dataset.run!;
    currentTitle = card.dataset.title || '';
    currentTags = (card.dataset.tags || '').split(',').filter(Boolean);
    currentSource = card.dataset.source || '';
    currentSize = card.dataset.size || '';
    currentFilename = card.dataset.filename || '';
  }

  function openLightbox(card: HTMLElement) {
    cards = get(visibleCards);
    const i = cards.indexOf(card);
    const id = cardId(card, i < 0 ? 0 : i);
    histLenAtOpen = history.length;
    history.pushState({ lightbox: id }, '', `#${id}`);
    open = true;
    render(i < 0 ? 0 : i);
    // showModal() after Svelte renders the dialog
    requestAnimationFrame(() => dialog?.showModal());
  }

  function closeDom() {
    open = false;
    currentUrl = '';
    idx = -1;
    cards = [];
    histLenAtOpen = 0;
    dialog?.close();
  }

  function close() {
    if (!open) return;
    const steps = history.length - histLenAtOpen;
    if (steps > 0) {
      history.go(-steps);
    } else {
      closeDom();
      history.replaceState(null, '', location.pathname + location.search);
    }
  }

  function goPrev() {
    if (idx <= 0) return;
    history.replaceState(null, '', `#${cardId(cards[idx - 1], idx - 1)}`);
    render(idx - 1);
  }

  function goNext() {
    if (idx >= cards.length - 1) return;
    history.replaceState(null, '', `#${cardId(cards[idx + 1], idx + 1)}`);
    render(idx + 1);
  }

  function onKeydown(e: KeyboardEvent) {
    if (!open) return;
    if (e.key === 'ArrowLeft') goPrev();
    else if (e.key === 'ArrowRight') goNext();
    // Escape is handled natively by <dialog>
  }

  onMount(() => {
    // Card clicks (cards are static Astro DOM, not Svelte)
    document.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('dialog')) return;
      if (open) return;
      const card = (e.target as HTMLElement).closest('.card') as HTMLElement | null;
      if (card) openLightbox(card);
    });

    window.addEventListener('popstate', () => {
      if (open) closeDom();
    });

    window.addEventListener('pageshow', (e) => {
      if (e.persisted && open) closeDom();
    });

    // Page load with hash
    if (location.hash) {
      const hash = location.hash.slice(1);
      const allCards = Array.from(document.querySelectorAll<HTMLElement>('.card'));
      const card = allCards.find((c, i) => cardId(c, i) === hash);
      if (card) {
        // Let filter apply first
        requestAnimationFrame(() => openLightbox(card));
      }
    }
  });

  let pos = $derived(cards.length ? `${idx + 1} / ${cards.length}` : '');
</script>

<svelte:window onkeydown={onKeydown} />

{#if open}
<dialog
  bind:this={dialog}
  class="fixed inset-0 z-50 m-0 flex flex-col bg-black/95 backdrop-blur-sm w-full h-full max-w-none max-h-none p-0 border-0"
  onclose={closeDom}
>
  <!-- Header -->
  <div class="flex items-center gap-2 border-b border-white/10 px-3 py-2 md:gap-3 md:px-4 md:py-2.5">
    <!-- Prev/Next desktop -->
    <div class="hidden md:flex items-center gap-0.5 shrink-0">
      <button type="button" title="Previous (←)"
              class="rounded px-3 py-1.5 text-base text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-25 transition-colors"
              disabled={idx <= 0}
              onclick={goPrev}>‹</button>
      <button type="button" title="Next (→)"
              class="rounded px-3 py-1.5 text-base text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-25 transition-colors"
              disabled={idx >= cards.length - 1}
              onclick={goNext}>›</button>
      <span class="text-xs text-white/30 tabular-nums ml-1">{pos}</span>
    </div>

    <div class="hidden md:block w-px h-5 bg-white/10 shrink-0"></div>

    <!-- Title / meta -->
    <div class="flex min-w-0 flex-1 items-center gap-2 md:gap-3">
      <h2 class="truncate text-sm font-semibold text-white">{currentTitle}</h2>
      <div class="hidden md:flex flex-wrap gap-1 min-w-0">
        {#each currentTags as t}
          <span class="rounded bg-white/10 px-1.5 py-0.5 text-[0.65rem] text-white/50">{t}</span>
        {/each}
      </div>
      {#if currentSource}<span class="hidden md:inline shrink-0 text-[0.65rem] uppercase tracking-wide text-white/30">{currentSource}</span>{/if}
      {#if currentSize}<span class="hidden md:inline shrink-0 tabular-nums text-xs text-white/30">{currentSize}</span>{/if}
    </div>

    <!-- Actions -->
    <div class="flex shrink-0 items-center gap-1.5 md:gap-2">
      <a href={currentUrl} download={currentFilename}
         class="hidden sm:inline-flex rounded border border-white/15 px-2.5 py-1 text-xs text-white/60 hover:border-white/40 hover:text-white transition-colors">↓</a>
      <a href={currentUrl} target="_blank" rel="noopener"
         class="rounded border border-white/15 px-2.5 py-2 text-xs text-white/60 hover:border-white/40 hover:text-white transition-colors md:py-1">open ↗</a>
      <button type="button" onclick={close}
              class="rounded border border-white/15 px-3 py-2 text-sm text-white/60 hover:border-white/40 hover:text-white transition-colors md:px-2.5 md:py-1 md:text-xs">✕</button>
    </div>
  </div>

  <!-- iframe — keyed on url so Svelte destroys+remounts on navigation, never mutates src -->
  <div class="h-full w-full flex-1 bg-white overflow-hidden">
    {#key currentUrl}
      <iframe
        src={currentUrl}
        class="h-full w-full bg-white"
        sandbox="allow-scripts allow-same-origin allow-forms allow-downloads allow-popups"
        title={currentTitle}
      ></iframe>
    {/key}
  </div>

  <!-- Mobile bottom nav -->
  <div class="flex md:hidden items-center justify-between border-t border-white/10 px-4 py-2 bg-black/80">
    <button type="button" title="Previous"
            class="flex items-center gap-1.5 rounded-lg px-5 py-3 text-2xl text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-25 transition-colors active:bg-white/20"
            disabled={idx <= 0}
            onclick={goPrev}>‹</button>
    <span class="text-xs text-white/30 tabular-nums">{pos}</span>
    <button type="button" title="Next"
            class="flex items-center gap-1.5 rounded-lg px-5 py-3 text-2xl text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-25 transition-colors active:bg-white/20"
            disabled={idx >= cards.length - 1}
            onclick={goNext}>›</button>
  </div>
</dialog>
{/if}

<style>
  dialog::backdrop {
    background: transparent;
  }
  dialog[open] {
    display: flex;
    flex-direction: column;
  }
</style>
