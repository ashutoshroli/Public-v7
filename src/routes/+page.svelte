<script lang="ts">
  import { onMount } from 'svelte';

  type Row = Record<string, unknown>;
  type PortalData = { collections?: Row[]; expenses?: Row[]; loans?: Row[]; committee?: Row[]; users?: Row[] };
  const API = 'https://chhath-public-worker.shaharpura.com';
  let data: PortalData = {};
  let loading = true;
  let error = '';
  let selectedYear = String(new Date().getFullYear());
  let query = '';
  let hasLoaded = false;

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
  const byYear = (rows: Row[] = []) => selectedYear === 'All' ? rows : rows.filter(r => yearOf(r) === selectedYear);
  $: availableYears = [...new Set([...(data.collections || []), ...(data.expenses || []), ...(data.loans || []), ...(data.committee || [])].map(yearOf).filter(y => /^20\d{2}$/.test(y)))].sort((a,b) => Number(b)-Number(a));
  $: years = [...new Set([...(availableYears.length ? availableYears : [String(new Date().getFullYear())]), 'All'])];
  $: if (hasLoaded && selectedYear !== 'All' && availableYears.length && !availableYears.includes(selectedYear)) selectedYear = availableYears[0];
  $: collections = byYear(data.collections || []);
  $: expenses = byYear(data.expenses || []);
  $: contributors = collections.reduce((map, row) => {
    const name = value(row, 'Name', 'name') || 'Community contribution';
    const key = name.toLocaleLowerCase();
    const old = map.get(key) || { name, amount: 0, type: '' };
    old.amount += amount(value(row, 'Amount', 'amount'));
    old.type = value(row, 'Contribution Type', 'Type', 'type') || old.type;
    map.set(key, old);
    return map;
  }, new Map<string, {name: string; amount: number; type: string}>());
  $: collectionTotal = collections.reduce((sum, row) => sum + amount(value(row, 'Amount', 'amount')), 0);
  $: expenseTotal = expenses.reduce((sum, row) => sum + amount(value(row, 'Amount', 'amount')), 0);
  $: loanRows = (data.loans || []).filter(r => selectedYear === 'All' || yearOf(r) === String(Number(selectedYear) - 1));
  $: returnedLoans = loanRows.reduce((sum, row) => {
    const principal = amount(value(row, 'Amount', 'amount'));
    const rate = amount(value(row, 'Interest Rate', 'Intrest Rate'));
    const tenure = amount(value(row, 'Tenure'));
    return sum + principal + principal * rate / 100 * tenure;
  }, 0);
  $: budget = collectionTotal + returnedLoans;
  $: utilization = budget > 0 ? Math.min(100, expenseTotal / budget * 100) : 0;
  $: filteredContributors = [...contributors.values()].sort((a,b) => b.amount-a.amount);

  async function loadData() {
    loading = true;
    error = '';
    try {
      const response = await fetch(API + '?action=portalData');
      if (!response.ok) throw new Error('Portal data is temporarily unavailable.');
      const raw = await response.json();
      const next = raw.data && typeof raw.data === 'object' ? raw.data : raw;
      if (!next || typeof next !== 'object') throw new Error('The public data response was not in the expected format.');
      data = next;
      hasLoaded = true;
    } catch (e) {
      error = e instanceof Error ? e.message : 'Unable to load public records.';
    } finally {
      loading = false;
    }
  }

  onMount(() => { void loadData(); });
</script>

<svelte:head>
  <title>Chhath Puja — Transparency Portal</title>
  <meta name="description" content="Public contribution and expense records for the Shaharpura Chhath Puja committee." />
  <meta name="theme-color" content="#f8f8f5" />
</svelte:head>

<header class="topbar">
  <a class="brand" href="/" aria-label="Chhath Puja home">
    <span class="sun" aria-hidden="true">☼</span>
    <span><strong>Chhath Puja</strong><small>Transparency Portal</small></span>
  </a>
  <div class="header-actions">
    <span class="language" aria-label="Language options not available yet">EN / हिंदी</span>
    <label class="year-picker"><span class="sr-only">Select year</span>
      <select bind:value={selectedYear} aria-label="Select year">
        {#each years as y}<option value={y}>{y === 'All' ? 'All years' : y}</option>{/each}
      </select>
    </label>
  </div>
</header>

<main class="page">
  <section class="intro">
    <p class="eyebrow"><span class="live-dot"></span> PUBLIC LEDGER <span class="separator">/</span> SHAHARPURA</p>
    <div class="hero-image" role="img" aria-label="Sunrise over a river, representing Chhath Puja">
      <div><p>आस्था • सहयोग • पारदर्शिता</p><h2>छठ पूजा</h2><p>आस्था · सहयोग · पारदर्शिता</p></div>
    </div>
    <h1>Faith deserves<br /><span>transparency.</span></h1>
    <p class="lede">छठ पूजा पारदर्शिता पोर्टल — नवयुवक छठ पूजा समिति</p>
  </section>

  {#if error}<div class="notice" role="status">{error} <button onclick={loadData} disabled={loading}>Retry</button></div>{/if}
  {#if loading}
    <div class="loading" aria-label="Loading public records"><span></span><span></span><span></span></div>
  {:else if hasLoaded}
    <section class="summary" aria-label="Financial summary">
      <article class="budget-card">
        <p class="eyebrow">TOTAL BUDGET · {selectedYear}</p>
        <strong>{money(budget)}</strong>
        <div class="progress-track"><span style:width="{utilization}%"></span></div>
        <div class="budget-foot"><span>{utilization.toFixed(1)}% utilized</span><span>{money(budget-expenseTotal)} still available</span></div>
      </article>
      <article class="metric"><span class="metric-label">Collected</span><strong>{money(collectionTotal)}</strong><span class="metric-note">Public contributions</span></article>
      <article class="metric"><span class="metric-label">Expenses</span><strong>{money(expenseTotal)}</strong><span class="metric-note">Recorded spending</span></article>
      <article class="metric"><span class="metric-label">Loan Returned (with Int.)</span><strong>{money(returnedLoans)}</strong><span class="metric-note">Estimated principal + interest</span></article>
    </section>
    <div class="stat-row">
      <a class="stat-tile" href="/contributors/"><small>Contributors ↗</small><strong>{filteredContributors.length}</strong><small>View full list</small></a>
      <a class="stat-tile" href="/expenses/"><small>Expense records ↗</small><strong>{expenses.length}</strong><small>View all expenses</small></a>
      <div class="stat-tile"><small>Years</small><strong>{availableYears.length || 10}</strong><small>Of community service</small></div>
    </div>
  {/if}

  <section class="journey" id="journey">
    <div><p class="eyebrow">2017 — 2026</p><h2>A decade of community service.</h2><p>See how our Chhath Puja journey has grown through the years.</p></div>
    <a href="/decade/">Explore journey <span aria-hidden="true">↗</span></a>
  </section>
  <nav class="quick-links" aria-label="Portal sections">
    <a href="/contributors/">Contributors <span>↗</span></a>
    <a href="/expenses/">Expenses <span>↗</span></a>
    <a href="/decade/">Our Journey <span>↗</span></a>
    <a href="/downloads/">Downloads <span>↗</span></a>
  </nav>
  <footer><span>CHHATH PUJA / TRANSPARENCY</span><span>Faith · Unity · Accountability</span></footer>
</main>
<nav class="bottom-nav" aria-label="Main navigation">
  <a class="active" href="/" aria-current="page"><span class="nav-icon">⌂</span><span>Home</span></a>
  <a href="/contributors/"><span class="nav-icon">♙</span><span>Contributors</span></a>
  <a href="/expenses/"><span class="nav-icon">▤</span><span>Expenses</span></a>
  <a href="/decade/"><span class="nav-icon">◷</span><span>Journey</span></a>
  <a href="/downloads/"><span class="nav-icon">☰</span><span>Menu</span></a>
</nav>
