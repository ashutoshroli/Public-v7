<script lang="ts">
  import { onMount } from 'svelte';
  type Row = Record<string, unknown>;
  type PortalData = { expenses?: Row[] };
  const API = 'https://chhath-public-worker.shaharpura.com?action=portalData';
  let data: PortalData = {};
  let loading = true;
  let error = '';
  let selectedYear = String(new Date().getFullYear());
  let query = '';
  let filter = 'All';
  const value = (row: Row, ...keys: string[]) => {
    for (const key of keys) if (row[key] !== undefined && row[key] !== null && String(row[key]).trim()) return String(row[key]);
    return '';
  };
  const amount = (v: unknown) => {
    const n = Number(String(v ?? '').replace(/[^0-9.-]/g, ''));
    return Number.isFinite(n) ? n : 0;
  };
  const money = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
  const yearOf = (r: Row) => value(r, 'Year', 'year');
  const categoryOf = (r: Row) => value(r, 'Category', 'category') || 'Other';
  $: yearsAvailable = [...new Set((data.expenses || []).map(yearOf).filter(y => /^20\d{2}$/.test(y)))].sort((a,b)=>Number(b)-Number(a));
  $: years = [...new Set([...(yearsAvailable.length ? yearsAvailable : [selectedYear]), 'All'])];
  $: records = (data.expenses || []).filter(row => (selectedYear === 'All' || yearOf(row) === selectedYear) && (filter === 'All' || categoryOf(row).toLowerCase() === filter.toLowerCase()) && (value(row,'Description','Discription','description','Name').toLowerCase().includes(query.toLowerCase()) || categoryOf(row).toLowerCase().includes(query.toLowerCase())));
  $: total = records.reduce((sum,row)=>sum+amount(value(row,'Amount','amount')),0);
  onMount(async () => {
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error('Public records are temporarily unavailable.');
      const raw = await res.json();
      data = raw.data && typeof raw.data === 'object' ? raw.data : raw;
      if (yearsAvailable.length && !yearsAvailable.includes(selectedYear)) selectedYear = yearsAvailable[0];
    } catch (e) { error = e instanceof Error ? e.message : 'Unable to load expense records.'; }
    finally { loading = false; }
  });
</script>
<svelte:head><title>Expenses — Chhath Puja</title><meta name="description" content="Browse recorded expenses for Shaharpura Chhath Puja." /></svelte:head>
<header class="topbar"><a class="brand" href="/"><span class="sun" aria-hidden="true">☼</span><span><strong>Chhath Puja</strong><small>Transparency Portal</small></span></a><div class="header-actions"><span class="language">EN / हिंदी</span><label class="year-picker"><span class="sr-only">Select year</span><select bind:value={selectedYear} aria-label="Select year">{#each years as y}<option value={y}>{y === 'All' ? 'All years' : y}</option>{/each}</select></label></div></header>
<main class="page">
  <p class="eyebrow">PUBLIC LEDGER / SPENDING</p><h1>Expenses<span>.</span></h1><p class="lede">Browse recorded spending and filter transactions by year, category or description.</p>
  <section class="summary expense-summary"><article class="metric expense-total-card"><span class="metric-label">Total expenses · {selectedYear}</span><strong>{money(total)}</strong><span class="metric-note">{records.length} matching records</span></article><article class="metric"><span class="metric-label">Transactions</span><strong>{records.length}</strong><span class="metric-note">Matching records</span></article></section>
  <label class="search full-search"><span aria-hidden="true">⌕</span><input bind:value={query} placeholder="Search expenses…" aria-label="Search expenses" /></label>
  <div class="filter-strip" aria-label="Filter by category">{#each ['All','Material','Service','Other'] as f}<button class:active={filter===f} onclick={()=>filter=f}>{f}</button>{/each}</div>
  {#if loading}<div class="loading" aria-label="Loading expenses"><span></span><span></span><span></span></div>{:else if error}<p class="notice" role="status">{error}</p>{:else}
    <section class="section-head"><div><p class="eyebrow">OUTGOING · {records.length} RECORDS</p><h2>Expense transactions</h2></div></section>
    <section class="records" aria-label="All expense records">{#each records as item,i}<article class="record"><span class="date-box">{value(item,'Date','date') || '—'}</span><div class="record-main"><strong>{value(item,'Description','Discription','description','Name') || 'Expense record'}</strong><small>{categoryOf(item)} · {yearOf(item) || selectedYear}</small></div><strong class="record-amount">{money(amount(value(item,'Amount','amount')))}</strong></article>{:else}<p class="empty">No expenses match these filters.</p>{/each}</section>
  {/if}
  <a class="back-link" href="/">← Back to home</a>
</main>
<nav class="bottom-nav" aria-label="Main navigation"><a href="/"><span class="nav-icon">⌂</span><span>Home</span></a><a href="/contributors/"><span class="nav-icon">♙</span><span>Contributors</span></a><a class="active" href="/expenses/" aria-current="page"><span class="nav-icon">▤</span><span>Expenses</span></a><a href="/decade/"><span class="nav-icon">◷</span><span>Journey</span></a><a href="/downloads/"><span class="nav-icon">☰</span><span>Menu</span></a></nav>
