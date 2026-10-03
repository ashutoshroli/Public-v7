<script lang="ts">
  import BottomNav from "$lib/components/BottomNav.svelte";
  import { onMount } from 'svelte';

  type Row = Record<string, unknown>;
  type PortalData = { collections?: Row[]; expenses?: Row[]; loans?: Row[]; committee?: Row[]; users?: Row[] };
  const API = 'https://chhath-public-worker.shaharpura.com?action=portalData';
  let data: PortalData = {};
  let years = Array.from({ length: 10 }, (_, i) => 2017 + i);
  let active = 2017;
  let counts = 0;\n  let cashTotal = 0;\n  let peopleCount = 0;
  let loading = true;
  let error = '';

  const yearOf = (row: Row) => String(row.Year ?? row.year ?? '');
  function updateCount(year: number) {
    counts = (data.collections || []).filter(row => yearOf(row) === String(year)).length;
  }

  onMount(async () => {
    try {
      const response = await fetch(API);
      if (!response.ok) throw new Error('Journey records are temporarily unavailable.');
      const raw = await response.json();
      data = raw.data && typeof raw.data === 'object' ? raw.data : raw;
      const all = [...(data.collections || []), ...(data.expenses || []), ...(data.loans || []), ...(data.committee || [])];
      const seen = [...new Set(all.map(yearOf).filter(year => /^20\d{2}$/.test(year)))].map(Number).sort((a, b) => a - b);
      if (seen.length) {
        years = [...new Set([...seen, 2026])].sort((a, b) => a - b);
        if (!years.includes(active)) active = years[0];
      }
      updateCount(active);
    } catch (e) {
      error = e instanceof Error ? e.message : 'Unable to load journey records.';
    } finally {
      loading = false;
    }
  });

  function selectYear(year: number) {
    active = year;
    updateCount(year);
  }
</script>

<svelte:head>
  <title>Our Journey — Chhath Puja</title>
  <meta name="description" content="Explore the Shaharpura Chhath Puja community's journey by year." />
</svelte:head>
<header class="topbar"><a class="brand" href="/"><span class="sun" aria-hidden="true">☼</span><span><strong>Chhath Puja</strong><small>Transparency Portal</small></span></a><a class="language" href="/">← Home</a></header>
<main class="page journey-page">
  <p class="eyebrow">OUR JOURNEY / 2017—2026</p>
  <h1>A decade of<br /><span>showing up.</span></h1>
  <p class="lede">छठी मैया के आशीर्वाद, समुदाय के सहयोग और पारदर्शिता की यात्रा।</p>
  {#if error}<p class="notice" role="status">{error} Showing the published year range.</p>{/if}
  <div class="year-strip" aria-label="Choose a year">
    {#each years as y}<button class:active={active===y} aria-pressed={active===y} onclick={() => selectYear(y)}>{y}</button>{/each}
  </div>
  <section class="journey-feature" aria-live="polite"><p class="eyebrow">YEAR IN FOCUS</p><strong class="journey-year">{active}</strong><h2>One community. A shared commitment.</h2><p>Every contribution and every recorded expense is part of our shared story.</p><div class="journey-stat"><span>Contribution records{loading ? ' · Loading' : ''}</span><strong>{counts}</strong></div><div class="journey-stat"><span>Unique contributor IDs</span><strong>{peopleCount}</strong></div><div class="journey-stat"><span>Cash contributions</span><strong>{new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(cashTotal)}</strong></div></section>
  <a class="back-link" href="/">← Back to public ledger</a>
</main>
<BottomNav />
