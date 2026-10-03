<script lang="ts">
  import BottomNav from '$lib/components/BottomNav.svelte';
  import { portalState, year, selectedPortalYear } from '$lib/stores/portal';
  import { lang, tr } from '$lib/stores/lang';
  import { decadeStats, journeyEntries, journeyTagline, journeyText } from '$lib/api/derive';
  import { fmt } from '$lib/utils/format';
  let active = $state(new Date().getFullYear());
  const stats = $derived(decadeStats($portalState.data));
  const entries = $derived(journeyEntries($portalState.data));
  const tagline = $derived(journeyTagline($portalState.data));
  const pageText = $derived(journeyText($portalState.data, $lang));
  const years = $derived(stats.years);
  const activeStats = $derived(years.find((item) => item.year === active) ?? years[years.length - 1]);
  const activeEntry = $derived(entries.find((item) => item.year === active) ?? null);
  const activeTitle = $derived(($lang === 'hi' ? activeEntry?.titleHi : activeEntry?.titleEn) || '');
  const activeContent = $derived(($lang === 'hi' ? activeEntry?.contentHi : activeEntry?.contentEn) || '');
  const heading = $derived(pageText.title || $tr('decade_title'));
  const subtitle = $derived(pageText.subtitle || ($lang === 'hi' ? tagline.hi : tagline.en) || $tr('decade_sub'));
  const intro = $derived(pageText.intro || $tr('decade_intro'));
  function selectYear(y: number) { active = y; year.set(y); selectedPortalYear.set(String(y)); }
  $effect(() => { if (years.length && !years.some((item) => item.year === active)) active = years[years.length - 1].year; });
</script>
<svelte:head><title>{$tr('decade_title')} — {$tr('app_title')}</title></svelte:head>
<main class="page journey-page">
  <p class="eyebrow">{$lang === 'hi' ? 'हमारी यात्रा' : 'OUR JOURNEY'} / {stats.startYear}—{stats.endYear}</p>
  <h1>{heading}<span>.</span></h1><p class="lede">{subtitle}</p><p class="lede">{intro}</p>
  <section class="summary stat-row">
    <article class="stat-tile"><small>{$lang === 'hi' ? 'कुल नकद योगदान' : 'Total monetary contributions'}</small><strong>{fmt(stats.grandTotal)}</strong></article>
    <article class="stat-tile"><small>{$lang === 'hi' ? 'योगदान रिकॉर्ड' : 'Contribution entries'}</small><strong>{stats.grandContributors}</strong></article>
    <article class="stat-tile"><small>{$lang === 'hi' ? 'वर्ष' : 'Years covered'}</small><strong>{stats.years.length}</strong></article>
  </section>
  <div class="year-strip" aria-label="Choose a year">{#each years as item (item.year)}<button class:active={active === item.year} aria-pressed={active === item.year} onclick={() => selectYear(item.year)}>{item.year}{item.isCurrent ? ' ·' : ''}</button>{/each}</div>
  {#if activeStats}<section class="journey-feature" aria-live="polite">
    <p class="eyebrow">{$lang === 'hi' ? 'चुना हुआ वर्ष' : 'YEAR IN FOCUS'}{activeStats.isCurrent ? ' · ' + ($lang === 'hi' ? 'वर्तमान' : 'CURRENT') : ''}</p>
    <strong class="journey-year">{activeStats.year}</strong>
    <h2>{activeTitle || ($lang === 'hi' ? 'समुदाय, सेवा और साझा संकल्प' : 'One community. A shared commitment.')}</h2>
    <p>{activeContent || ($lang === 'hi' ? 'हर प्रकाशित योगदान और खर्च हमारी साझा यात्रा का हिस्सा है।' : 'Every published contribution and recorded expense is part of our shared story.')}</p>
    <div class="journey-stat"><span>{$lang === 'hi' ? 'योगदानकर्ता रिकॉर्ड' : 'Contributor entries'}</span><strong>{activeStats.contributors}</strong></div>
    <div class="journey-stat"><span>{$lang === 'hi' ? 'नकद योगदान' : 'Monetary contributions'}</span><strong>{fmt(activeStats.total)}</strong></div>
  </section>{/if}
  {#if $portalState.stale}<p class="notice" role="status">{$tr('stale_notice')}</p>{/if}
  <a class="back-link" href="/">← {$lang === 'hi' ? 'मुख्य पृष्ठ' : 'Back to public ledger'}</a>
</main><BottomNav />