<script lang="ts">
  import BottomNav from "$lib/components/BottomNav.svelte";
  import { portalLanguage, togglePortalLanguage, initPortalLanguage } from "$lib/stores/language";
  let language: "en" | "hi" = "en";
  const unsubLang = portalLanguage.subscribe(v => language = v);
  import { onMount } from 'svelte';
  import { loadPortalData, portalData, portalLoading, portalError, selectedPortalYear } from '$lib/stores/portal';

  type Row = Record<string, unknown>;
  type PortalData = { collections?: Row[]; expenses?: Row[]; loans?: Row[]; committee?: Row[]; users?: Row[] };
  let data: PortalData = {};
  let years = Array.from({ length: 10 }, (_, i) => 2017 + i);
  let active = 2017;
  let counts = 0;
  let cashTotal = 0;
  let peopleCount = 0;
  let loading = true;
  let error = '';

  const value = (row: Row, ...keys: string[]) => {
    for (const key of keys) {
      if (row[key] !== undefined && row[key] !== null && String(row[key]).trim()) return String(row[key]).trim();
      const norm = key.trim().toLowerCase().replace(/\s+/g,' ');
      const actual = Object.keys(row).find(k => k.trim().toLowerCase().replace(/\s+/g,' ') === norm);
      if (actual && row[actual] !== undefined && row[actual] !== null && String(row[actual]).trim()) return String(row[actual]).trim();
    }
    return '';
  };
  const yearOf = (row: Row) => value(row,'Year','year');
  const amountOf = (v: unknown) => { const n = Number(String(v ?? '').replace(/[^0-9.-]/g,'')); return Number.isFinite(n) ? n : 0; };
  const isResell = (row: Row) => ['true','1','yes'].includes(value(row,'Is Resell').toLowerCase());
  const isCash = (row: Row) => ['1','cash','money','monetary',''].includes(value(row,'Contribution Type','Type').toLowerCase());
  function updateCount(year: number) {
    const rows = (data.collections || []).filter(row => yearOf(row) === String(year) && !isResell(row));
    counts = rows.length;
    cashTotal = rows.reduce((sum,row) => sum + (isCash(row) ? amountOf(value(row,'Amount')) : 0),0);
    peopleCount = new Set(rows.map(row => value(row,'ID','Name')).filter(Boolean)).size;
  }

  const unsubscribeData = portalData.subscribe(value => {
    data = value as PortalData;
    const all = [...(data.collections || []), ...(data.expenses || []), ...(data.loans || []), ...(data.committee || [])];
    const seen = [...new Set(all.map(yearOf).filter(year => /^20\d{2}$/.test(year)))].map(Number).sort((a,b)=>a-b);
    if (seen.length) {
      years = [...new Set([...seen,2026])].sort((a,b)=>a-b);
      if (!years.includes(active)) active = years[0];
    }
    updateCount(active);
  });
  const unsubscribeLoading = portalLoading.subscribe(value => { loading = value; });
  const unsubscribeError = portalError.subscribe(value => { error = value; });
  const unsubscribeYear = selectedPortalYear.subscribe(value => { const year = Number(value); if (Number.isFinite(year) && years.includes(year)) { active = year; updateCount(year); } });
  onMount(() => {
    initPortalLanguage();
    void loadPortalData().catch(() => {});
    return () => { unsubscribeData(); unsubscribeLoading(); unsubscribeError(); unsubscribeYear(); unsubLang(); };
  });

  function selectYear(year: number) {
    active = year;
    selectedPortalYear.set(String(year));
    updateCount(year);
  }
initPortalLanguage();
</script>

<svelte:head>
  <title>Our Journey — Chhath Puja</title>
  <meta name="description" content="Explore the Shaharpura Chhath Puja community's journey by year." />
</svelte:head>
<header class="topbar"><a class="brand" href="/"><span class="sun" aria-hidden="true">☼</span><span><strong>Chhath Puja</strong><small>Transparency Portal</small></span></a><div class="header-actions"><button class="language" type="button" onclick={togglePortalLanguage}>{language === "hi" ? "English" : "हिंदी"}</button><a class="language" href="/">{language === "hi" ? "← होम" : "← Home"}</a></div></header>
<main class="page journey-page">
  <p class="eyebrow">OUR JOURNEY / 2017—2026</p>
  <h1>{language === 'hi' ? 'एक दशक से<br /><span>साथ निभाते हुए।</span>' : 'A decade of<br /><span>showing up.</span>'}</h1>
  <p class="lede">छठी मैया के आशीर्वाद, समुदाय के सहयोग और पारदर्शिता की यात्रा।</p>
  {#if error}<p class="notice" role="status">{error} Showing the published year range.</p>{/if}
  <div class="year-strip" aria-label="Choose a year">
    {#each years as y}<button class:active={active===y} aria-pressed={active===y} onclick={() => selectYear(y)}>{y}</button>{/each}
  </div>
  <section class="journey-feature" aria-live="polite"><p class="eyebrow">YEAR IN FOCUS</p><strong class="journey-year">{active}</strong><h2>{language === 'hi' ? 'एक समुदाय, साझा संकल्प।' : 'One community. A shared commitment.'}</h2><p>{language === 'hi' ? 'हर योगदान और दर्ज खर्च हमारी साझा यात्रा का हिस्सा है।' : 'Every contribution and every recorded expense is part of our shared story.'}</p><div class="journey-stat"><span>{language === 'hi' ? 'योगदान रिकॉर्ड' : 'Contribution records'}{loading ? (language === 'hi' ? ' · लोड हो रहा है' : ' · Loading') : ''}</span><strong>{counts}</strong></div><div class="journey-stat"><span>{language === 'hi' ? 'अलग योगदानकर्ता ID' : 'Unique contributor IDs'}</span><strong>{peopleCount}</strong></div><div class="journey-stat"><span>{language === 'hi' ? 'नकद योगदान' : 'Cash contributions'}</span><strong>{new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(cashTotal)}</strong></div></section>
  <a class="back-link" href="/">{language === 'hi' ? '← सार्वजनिक लेखा पर वापस' : '← Back to public ledger'}</a>
</main>
<BottomNav />
