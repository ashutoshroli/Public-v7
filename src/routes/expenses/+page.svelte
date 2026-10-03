<script lang="ts">
  import BottomNav from "$lib/components/BottomNav.svelte";
  import { onMount } from 'svelte';
  import { loadPortalData, portalData, portalLoading, portalError, selectedPortalYear } from '$lib/stores/portal';
  import { lang } from '$lib/stores/lang';
  type Row = Record<string, unknown>;
  type PortalData = { expenses?: Row[] };
  const API = 'https://chhath-public-worker.shaharpura.com?action=portalData';
  let data: PortalData = {};
  let loading = true;
  let error = '';
  let selectedYear = String(new Date().getFullYear());
  let selectedPortalYearValue = '';
  let query = '';
  let filter = 'All';
  const value = (row: Row, ...keys: string[]) => {
    for (const key of keys) {
      if (row[key] !== undefined && row[key] !== null && String(row[key]).trim()) return String(row[key]).trim();
      const normalized = key.trim().toLowerCase().replace(/\s+/g, ' ');
      const actual = Object.keys(row).find(k => k.trim().toLowerCase().replace(/\s+/g, ' ') === normalized);
      if (actual && row[actual] !== undefined && row[actual] !== null && String(row[actual]).trim()) return String(row[actual]).trim();
    }
    return '';
  };
  const amount = (v: unknown) => {
    const n = Number(String(v ?? '').replace(/[^0-9.-]/g, ''));
    return Number.isFinite(n) ? n : 0;
  };
  const money = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
  const yearOf = (r: Row) => value(r, 'Year', 'year');
  const categoryOf = (r: Row) => value(r, 'Category', 'category') || 'Other';
  const descriptionOf = (r: Row) => value(r, $lang === 'hi' ? 'Discription (Hindi)' : 'Discription', $lang === 'hi' ? 'Discription' : 'Discription (Hindi)', $lang === 'hi' ? 'Description (Hindi)' : 'Description', $lang === 'hi' ? 'Description' : 'Description (Hindi)', 'description','Name') || 'Expense record';
  $: yearsAvailable = [...new Set((data.expenses || []).map(yearOf).filter(y => /^20\d{2}$/.test(y)))].sort((a,b)=>Number(b)-Number(a));
  $: if (yearsAvailable.length && !yearsAvailable.includes(selectedYear)) selectedYear = yearsAvailable[0];
  $: if (yearsAvailable.length && selectedPortalYearValue && yearsAvailable.includes(selectedPortalYearValue)) selectedYear = selectedPortalYearValue;
  $: if (yearsAvailable.length && selectedYear) selectedPortalYear.set(selectedYear);
  $: years = yearsAvailable.length ? yearsAvailable : [selectedYear];
  $: records = (data.expenses || []).filter(row => yearOf(row) === selectedYear && (filter === 'All' || categoryOf(row).toLowerCase() === filter.toLowerCase()) && (descriptionOf(row).toLowerCase().includes(query.toLowerCase()) || categoryOf(row).toLowerCase().includes(query.toLowerCase())));
  $: total = records.reduce((sum,row)=>sum+amount(value(row,'Amount','amount')),0);
  const unsubscribeData = portalData.subscribe((value) => { data = value as PortalData; });
  const unsubscribeLoading = portalLoading.subscribe((value) => { loading = value; });
  const unsubscribeError = portalError.subscribe((value) => { error = value; });
  const unsubscribeYear = selectedPortalYear.subscribe(value => { selectedPortalYearValue = value; });
  onMount(() => {
    void loadPortalData().catch(() => {});
    return () => { unsubscribeData(); unsubscribeLoading(); unsubscribeError(); unsubscribeYear(); };
  });</script>
<svelte:head><title>Expenses — Chhath Puja</title><meta name="description" content="Browse recorded expenses for Shaharpura Chhath Puja." /></svelte:head>

<main class="page">
  <p class="eyebrow">PUBLIC LEDGER / SPENDING</p><h1>Expenses<span>.</span></h1><p class="lede">Browse recorded spending and filter transactions by year, category or description.</p>
  <section class="summary expense-summary"><article class="metric expense-total-card"><span class="metric-label">Total expenses · {selectedYear}</span><strong>{money(total)}</strong><span class="metric-note">{records.length} matching records</span></article><article class="metric"><span class="metric-label">Transactions</span><strong>{records.length}</strong><span class="metric-note">Matching records</span></article></section>
  <label class="search full-search"><span aria-hidden="true">⌕</span><input bind:value={query} placeholder="Search expenses…" aria-label="Search expenses" /></label>
  <div class="filter-strip" aria-label="Filter by category">{#each ['All','Material','Service','Other'] as f}<button class:active={filter===f} onclick={()=>filter=f}>{f}</button>{/each}</div>
  {#if loading}<div class="loading" aria-label="Loading expenses"><span></span><span></span><span></span></div>{:else if error}<p class="notice" role="status">{error}</p>{:else}
    <section class="section-head"><div><p class="eyebrow">OUTGOING · {records.length} RECORDS</p><h2>Expense transactions</h2></div></section>
    <section class="records" aria-label="All expense records">{#each records as item,i}<article class="record"><span class="date-box">{value(item,'Date','date') || '—'}</span><div class="record-main"><strong>{descriptionOf(item)}</strong><small>{categoryOf(item)} · {yearOf(item) || selectedYear}</small></div><strong class="record-amount">{money(amount(value(item,'Amount','amount')))}</strong></article>{:else}<p class="empty">No expenses match these filters.</p>{/each}</section>
  {/if}
  <a class="back-link" href="/">← Back to home</a>
</main>
<BottomNav />
