<script lang="ts">
  import BottomNav from "$lib/components/BottomNav.svelte";
  import { onMount } from 'svelte';
  import { loadPortalData, portalData, portalLoading, portalError, selectedPortalYear } from '$lib/stores/portal';
  import { portalLanguage, togglePortalLanguage, initPortalLanguage } from '$lib/stores/language';
  type Row = Record<string, unknown>;
  type PortalData = { expenses?: Row[] };
  const API = 'https://chhath-public-worker.shaharpura.com?action=portalData';
  let data: PortalData = {};
  let loading = true;
  let error = '';
  let selectedYear = String(new Date().getFullYear());
  let selectedPortalYearValue = '';
  $: language = $portalLanguage;
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
  const descriptionEnglish = (r: Row) => value(r, 'Discription', 'Description', 'description', 'Name');
  const descriptionHindi = (r: Row) => value(r, 'Discription (Hindi)', 'Description (Hindi)');
  const descriptionOf = (r: Row) => (language === 'hi'
    ? descriptionHindi(r) || descriptionEnglish(r)
    : descriptionEnglish(r) || descriptionHindi(r)) || (language === 'hi' ? 'खर्च का विवरण' : 'Expense record');
  const searchableDescription = (r: Row) => [descriptionEnglish(r), descriptionHindi(r)].filter(Boolean).join(' ').toLowerCase();
  $: yearsAvailable = [...new Set((data.expenses || []).map(yearOf).filter(y => /^20\d{2}$/.test(y)))].sort((a,b)=>Number(b)-Number(a));
  $: if (yearsAvailable.length && !yearsAvailable.includes(selectedYear)) selectedYear = yearsAvailable[0];
  $: if (yearsAvailable.length && selectedPortalYearValue && yearsAvailable.includes(selectedPortalYearValue)) selectedYear = selectedPortalYearValue;
  $: if (yearsAvailable.length && selectedYear) selectedPortalYear.set(selectedYear);
  $: years = yearsAvailable.length ? yearsAvailable : [selectedYear];
  $: records = (data.expenses || []).filter(row => yearOf(row) === selectedYear && (filter === 'All' || categoryOf(row).toLowerCase() === filter.toLowerCase()) && (searchableDescription(row).includes(query.toLowerCase()) || categoryOf(row).toLowerCase().includes(query.toLowerCase())));
  $: total = records.reduce((sum,row)=>sum+amount(value(row,'Amount','amount')),0);
  const unsubscribeData = portalData.subscribe((value) => { data = value as PortalData; });
  const unsubscribeLoading = portalLoading.subscribe((value) => { loading = value; });
  const unsubscribeError = portalError.subscribe((value) => { error = value; });
  const unsubscribeYear = selectedPortalYear.subscribe(value => { selectedPortalYearValue = value; });
  onMount(() => {
    initPortalLanguage();
    void loadPortalData().catch(() => {});
    return () => { unsubscribeData(); unsubscribeLoading(); unsubscribeError(); unsubscribeYear(); };
  });</script>
<svelte:head><title>{language === 'hi' ? 'खर्च — छठ पूजा' : 'Expenses — Chhath Puja'}</title><meta name="description" content="Browse recorded expenses for Shaharpura Chhath Puja." /></svelte:head>
<header class="topbar"><a class="brand" href="/"><span class="sun" aria-hidden="true">☼</span><span><strong>Chhath Puja</strong><small>{language === 'hi' ? 'पारदर्शिता पोर्टल' : 'Transparency Portal'}</small></span></a><div class="header-actions"><button class="language" type="button" onclick={togglePortalLanguage}>{language === 'en' ? 'EN / हिंदी' : 'हिंदी / EN'}</button><label class="year-picker"><span class="sr-only">Select year</span><select bind:value={selectedYear} aria-label={language === 'hi' ? 'वर्ष चुनें' : 'Select year'}>{#each years as y}<option value={y}>{y}</option>{/each}</select></label></div></header>
<main class="page">
  <p class="eyebrow">{language === 'hi' ? 'सार्वजनिक लेखा / खर्च' : 'PUBLIC LEDGER / SPENDING'}</p><h1>{language === 'hi' ? 'खर्च' : 'Expenses'}<span>.</span></h1><p class="lede">{language === 'hi' ? 'दर्ज खर्च देखें और वर्ष, श्रेणी या विवरण से फ़िल्टर करें।' : 'Browse recorded spending and filter transactions by year, category or description.'}</p>
  <section class="summary expense-summary"><article class="metric expense-total-card"><span class="metric-label">{language === 'hi' ? 'कुल खर्च' : 'Total expenses'} · {selectedYear}</span><strong>{money(total)}</strong><span class="metric-note">{records.length} {language === 'hi' ? 'मिलते रिकॉर्ड' : 'matching records'}</span></article><article class="metric"><span class="metric-label">{language === 'hi' ? 'लेन-देन' : 'Transactions'}</span><strong>{records.length}</strong><span class="metric-note">{language === 'hi' ? 'मिलते रिकॉर्ड' : 'Matching records'}</span></article></section>
  <label class="search full-search"><span aria-hidden="true">⌕</span><input bind:value={query} placeholder={language === 'hi' ? 'खर्च खोजें…' : 'Search expenses…'} aria-label={language === 'hi' ? 'खर्च खोजें' : 'Search expenses'} /></label>
  <div class="filter-strip" aria-label={language === 'hi' ? 'श्रेणी से फ़िल्टर करें' : 'Filter by category'}>{#each ['All','Material','Service','Other'] as f}<button class:active={filter===f} onclick={()=>filter=f}>{language === 'hi' ? ({All:'सभी',Material:'सामग्री',Service:'सेवा',Other:'अन्य'}[f]) : f}</button>{/each}</div>
  {#if loading}<div class="loading" aria-label={language === 'hi' ? 'खर्च लोड हो रहे हैं' : 'Loading expenses'}><span></span><span></span><span></span></div>{:else if error}<p class="notice" role="status">{error}</p>{:else}
    <section class="section-head"><div><p class="eyebrow">OUTGOING · {records.length} RECORDS</p><h2>{language === 'hi' ? 'खर्च लेन-देन' : 'Expense transactions'}</h2></div></section>
    <section class="records" aria-label={language === 'hi' ? 'सभी खर्च रिकॉर्ड' : 'All expense records'}>{#each records as item,i}<article class="record"><span class="date-box">{value(item,'Date','date') || '—'}</span><div class="record-main"><strong>{descriptionOf(item)}</strong><small>{categoryOf(item)} · {yearOf(item) || selectedYear}</small></div><strong class="record-amount">{money(amount(value(item,'Amount','amount')))}</strong></article>{:else}<p class="empty">{language === 'hi' ? 'इन फ़िल्टरों से कोई खर्च नहीं मिला।' : 'No expenses match these filters.'}</p>{/each}</section>
  {/if}
  <a class="back-link" href="/">{language === 'hi' ? '← होम पर वापस' : '← Back to home'}</a>
</main>
<BottomNav />
