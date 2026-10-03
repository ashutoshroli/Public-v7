<script lang="ts">
  import { onMount } from 'svelte';
  import BottomNav from '$lib/components/BottomNav.svelte';
  type Row = Record<string, unknown>;
  type PortalData = { loans?: Row[] };
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
  const statusOf = (r: Row) => value(r, 'Status', 'status') || 'Unspecified';
  $: yearsAvailable = [...new Set((data.loans || []).map(yearOf).filter(y => /^20\d{2}$/.test(y)))].sort((a,b)=>Number(b)-Number(a));
  $: years = [...new Set([...(yearsAvailable.length ? yearsAvailable : [selectedYear]), 'All'])];
  $: records = (data.loans || []).filter(row =>
    (selectedYear === 'All' || yearOf(row) === selectedYear) &&
    (filter === 'All' || statusOf(row).toLowerCase() === filter.toLowerCase()) &&
    [value(row,'Name','Borrower','Person','name'), value(row,'Purpose','Description','Reason','purpose'), statusOf(row)].join(' ').toLowerCase().includes(query.toLowerCase())
  );
  $: totalLoan = records.reduce((sum,row)=>sum+amount(value(row,'Amount','Principal','amount')),0);
  $: returned = records.reduce((sum,row)=>sum+amount(value(row,'Returned','Repaid','Amount Returned','returned')),0);
  $: pending = Math.max(0,totalLoan-returned);
  onMount(async () => {
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error('Public records are temporarily unavailable.');
      const raw = await res.json();
      data = raw.data && typeof raw.data === 'object' ? raw.data : raw;
      if (yearsAvailable.length && !yearsAvailable.includes(selectedYear)) selectedYear = yearsAvailable[0];
    } catch (e) { error = e instanceof Error ? e.message : 'Unable to load loan records.'; }
    finally { loading = false; }
  });
</script>
<svelte:head><title>Loans — Chhath Puja</title><meta name="description" content="Browse public loan and repayment records for Shaharpura Chhath Puja." /></svelte:head>
<header class="topbar"><a class="brand" href="/"><span class="sun" aria-hidden="true">☼</span><span><strong>Chhath Puja</strong><small>Transparency Portal</small></span></a><div class="header-actions"><span class="language">EN / हिंदी</span><label class="year-picker"><span class="sr-only">Select year</span><select bind:value={selectedYear} aria-label="Select year">{#each years as y}<option value={y}>{y === 'All' ? 'All years' : y}</option>{/each}</select></label></div></header>
<main class="page">
  <p class="eyebrow">PUBLIC LEDGER / LOANS</p><h1>Loans & Returns<span>.</span></h1><p class="lede">Browse recorded loans and repayment information.</p>
  <section class="summary expense-summary">
    <article class="metric"><span class="metric-label">Loan amount</span><strong>{money(totalLoan)}</strong><span class="metric-note">For selected records</span></article>
    <article class="metric expense-total-card"><span class="metric-label">Returned amount</span><strong>{money(returned)}</strong><span class="metric-note">Where recorded in source data</span></article>
  </section>
  <section class="summary"><article class="budget-card"><p class="eyebrow">OUTSTANDING ESTIMATE</p><strong>{money(pending)}</strong><p class="metric-note">Calculated only from loan and returned fields available in the public data.</p></article></section>
  <label class="search full-search"><span aria-hidden="true">⌕</span><input bind:value={query} placeholder="Search borrower or purpose…" aria-label="Search loans" /></label>
  <div class="filter-strip" aria-label="Filter loan status">{#each ['All','Active','Returned'] as f}<button class:active={filter===f} onclick={()=>filter=f}>{f}</button>{/each}</div>
  {#if loading}<div class="loading" aria-label="Loading loans"><span></span><span></span><span></span></div>{:else if error}<p class="notice" role="status">{error}</p>{:else}
    <section class="section-head"><div><p class="eyebrow">LOAN RECORDS · {records.length}</p><h2>Loans & repayments</h2></div></section>
    <section class="records" aria-label="Loan records">{#each records as row,i}<article class="record"><span class="rank">{String(i+1).padStart(2,'0')}</span><div class="record-main"><strong>{value(row,'Name','Borrower','Person','name') || 'Loan record'}</strong><small>{value(row,'Purpose','Description','Reason','purpose') || yearOf(row) || selectedYear} · {statusOf(row)}</small></div><strong class="record-amount">{money(amount(value(row,'Amount','Principal','amount')))}</strong></article>{:else}<p class="empty">No loan records match these filters.</p>{/each}</section>
  {/if}
  <a class="back-link" href="/">← Back to home</a>
</main>
<BottomNav />
