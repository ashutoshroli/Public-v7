<script lang="ts">
  import BottomNav from "$lib/components/BottomNav.svelte";
  import { onMount } from 'svelte';
  type Row = Record<string, unknown>;
  type PortalData = { collections?: Row[] };
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
  $: yearsAvailable = [...new Set((data.collections || []).map(yearOf).filter(y => /^20\d{2}$/.test(y)))].sort((a,b)=>Number(b)-Number(a));
  $: years = [...new Set([...(yearsAvailable.length ? yearsAvailable : [selectedYear]), 'All'])];
  $: rows = (data.collections || []).filter(row => selectedYear === 'All' || yearOf(row) === selectedYear).reduce((map, row) => {
    const name = value(row, 'Name', 'name') || 'Community contribution';
    const key = name.toLocaleLowerCase();
    const kind = value(row, 'Contribution Type', 'Type', 'type') || 'Other';
    const old = map.get(key) || { name, amount: 0, type: kind, entries: 0 };
    old.amount += amount(value(row, 'Amount', 'amount'));
    old.type = kind || old.type;
    old.entries++;
    map.set(key, old);
    return map;
  }, new Map<string, {name:string;amount:number;type:string;entries:number}>());
  $: contributors = [...rows.values()].filter(c => c.name.toLowerCase().includes(query.toLowerCase()) && (filter === 'All' || c.type.toLowerCase() === filter.toLowerCase())).sort((a,b)=>b.amount-a.amount);
  $: total = contributors.reduce((sum,c)=>sum+c.amount,0);
  onMount(async () => {
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error('Public records are temporarily unavailable.');
      const raw = await res.json();
      data = raw.data && typeof raw.data === 'object' ? raw.data : raw;
      if (yearsAvailable.length && !yearsAvailable.includes(selectedYear)) selectedYear = yearsAvailable[0];
    } catch (e) { error = e instanceof Error ? e.message : 'Unable to load contributor records.'; }
    finally { loading = false; }
  });
</script>
<svelte:head><title>Contributors — Chhath Puja</title><meta name="description" content="Browse public contribution records for Shaharpura Chhath Puja." /></svelte:head>
<header class="topbar"><a class="brand" href="/"><span class="sun" aria-hidden="true">☼</span><span><strong>Chhath Puja</strong><small>Transparency Portal</small></span></a><div class="header-actions"><span class="language">EN / हिंदी</span><label class="year-picker"><span class="sr-only">Select year</span><select bind:value={selectedYear} aria-label="Select year">{#each years as y}<option value={y}>{y === 'All' ? 'All years' : y}</option>{/each}</select></label></div></header>
<main class="page">
  <p class="eyebrow">PUBLIC LEDGER / CONTRIBUTIONS</p><h1>Contributors<span>.</span></h1><p class="lede">Browse community contributions by name and year.</p>
  <section class="summary contributor-summary"><article class="budget-card"><p class="eyebrow">TOTAL CONTRIBUTED · {selectedYear}</p><strong>{money(total)}</strong><div class="budget-foot"><span>{contributors.length} contributors shown</span><span>{selectedYear === 'All' ? 'All years' : selectedYear}</span></div></article></section>
  <label class="search full-search"><span aria-hidden="true">⌕</span><input bind:value={query} placeholder="Search by name…" aria-label="Search contributors" /></label>
  <div class="filter-strip" aria-label="Filter by contribution type">{#each ['All','Material','Service','Cash','Other'] as f}<button class:active={filter===f} onclick={()=>filter=f}>{f}</button>{/each}</div>
  {#if loading}<div class="loading" aria-label="Loading contributors"><span></span><span></span><span></span></div>{:else if error}<p class="notice" role="status">{error}</p>{:else}
    <section class="section-head"><div><p class="eyebrow">COMMUNITY · {contributors.length} CONTRIBUTORS</p><h2>Contribution records</h2></div></section>
    <section class="records" aria-label="All contributors">{#each contributors as c,i}<article class="record"><span class="rank">{String(i+1).padStart(2,'0')}</span><div class="record-main"><strong>{c.name}</strong><small>{c.type} · {c.entries} record{c.entries===1?'':'s'}</small></div><strong class="record-amount">{money(c.amount)}</strong></article>{:else}<p class="empty">No contributors match these filters.</p>{/each}</section>
  {/if}
  <a class="back-link" href="/">← Back to home</a>
</main>
<BottomNav />
