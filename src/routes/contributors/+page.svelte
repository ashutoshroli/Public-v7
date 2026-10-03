<script lang="ts">
  import BottomNav from "$lib/components/BottomNav.svelte";
  import { onMount } from 'svelte';
  import { loadPortalData, portalData, portalLoading, portalError, selectedPortalYear } from '$lib/stores/portal';
  import { portalLanguage, togglePortalLanguage, initPortalLanguage } from '$lib/stores/language';
  type Row = Record<string, unknown>;
  type PortalData = { collections?: Row[]; users?: Row[] };
  const API = 'https://chhath-public-worker.shaharpura.com?action=portalData';
  let data: PortalData = {};
  let loading = true;
  let error = '';
  let selectedYear = String(new Date().getFullYear());
  let yearInitialized = false;
  let selectedPortalYearValue = '';
  let language: 'en' | 'hi' = 'en';
  const unsubscribeLanguage = portalLanguage.subscribe(value => { language = value; });
  let query = '';
  let filter = 'All';
  const value = (row: Row | undefined, ...keys: string[]) => {
    if (!row) return '';
    for (const key of keys) {
      if (row[key] !== undefined && row[key] !== null && String(row[key]).trim()) return String(row[key]).trim();
      const normalized = key.trim().toLowerCase().replace(/\s+/g, ' ');
      const actual = Object.keys(row).find(k => k.trim().toLowerCase().replace(/\s+/g, ' ') === normalized);
      if (actual && row[actual] !== undefined && row[actual] !== null && String(row[actual]).trim()) return String(row[actual]).trim();
    }
    return '';
  };
  const amount = (v: unknown) => { const n = Number(String(v ?? '').replace(/[^0-9.-]/g, '')); return Number.isFinite(n) ? n : 0; };
  const money = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
  const yearOf = (r: Row) => value(r, 'Year', 'year');
  const kindOf = (r: Row): 'Cash' | 'Material' | 'Service' | 'Other' => {
    const type = value(r, 'Contribution Type', 'Contribution Type ', 'Type', 'type').trim().toLowerCase();
    if (['1','cash','money','monetary',''].includes(type)) return 'Cash';
    if (['2','material','samaan','सामान'].includes(type)) return 'Material';
    if (['3','service','work','सेवा','काम'].includes(type)) return 'Service';
    return 'Other';
  };
  const isResell = (r: Row) => ['true','1','yes'].includes(value(r,'Is Resell','Is Resell ').toLowerCase());
  $: yearsAvailable = [...new Set((data.collections || []).map(yearOf).filter(y => /^20\d{2}$/.test(y)))].sort((a,b)=>Number(b)-Number(a));
  $: if (yearsAvailable.length && selectedPortalYearValue && yearsAvailable.includes(selectedPortalYearValue)) selectedYear = selectedPortalYearValue;
  $: if (yearsAvailable.length && !yearsAvailable.includes(selectedYear)) selectedYear = yearsAvailable[0];
  $: if (yearsAvailable.length && !yearInitialized) { selectedYear = yearsAvailable[0]; yearInitialized = true; }
  $: if (yearInitialized && selectedYear) selectedPortalYear.set(selectedYear);
  $: years = yearsAvailable.length ? yearsAvailable : [selectedYear];
  $: userMap = new Map((data.users || []).map(u => [value(u,'ID'), u]).filter(([id]) => !!id) as [string, Row][]);
  $: contributorMap = (data.collections || []).filter(row => !isResell(row) && yearOf(row) === selectedYear).reduce((map, row) => {
    const id = value(row,'ID','ID ') || value(row,'Name','name');
    if (!id) return map;
    const user = userMap.get(id);
    const displayName = language === 'hi' ? (value(user,'Name (Hindi)','Name (Hindi) ','Name','Name ') || value(row,'Name (Hindi)','Name','name') || id) : (value(user,'Name','Name ') || value(row,'Name','name') || value(user,'Name (Hindi)') || id);
    const kind = kindOf(row);
    const old = map.get(id) || { id, name: displayName, amount: 0, kinds: new Set<string>(), entries: 0, detail: '', village: language === 'hi' ? (value(user,'Village (Hindi)') || value(user,'Village')) : (value(user,'Village') || value(user,'Village (Hindi)')), photo: value(user,'Photo','Photo URL','Image') };
    if (kind === 'Cash') old.amount += amount(value(row,'Amount','amount'));
    old.kinds.add(kind);
    old.entries++;
    old.detail = value(row,'Detail','Detail ') || old.detail;
    map.set(id, old);
    return map;
  }, new Map<string, {id:string;name:string;amount:number;kinds:Set<string>;entries:number;detail:string;village:string;photo:string}>());
  $: contributors = [...contributorMap.values()]
    .filter(c => c.name.toLowerCase().includes(query.toLowerCase()) && (filter === 'All' || c.kinds.has(filter)))
    .sort((a,b)=>b.amount-a.amount);
  $: total = contributors.reduce((sum,c)=>sum+c.amount,0);
  const unsubscribeData = portalData.subscribe((value) => { data = value as PortalData; });
  const unsubscribeLoading = portalLoading.subscribe((value) => { loading = value; });
  const unsubscribeError = portalError.subscribe((value) => { error = value; });
  const unsubscribeYear = selectedPortalYear.subscribe(value => { selectedPortalYearValue = value; });
  onMount(() => {
    initPortalLanguage();
    void loadPortalData().catch(() => {});
    return () => { unsubscribeData(); unsubscribeLoading(); unsubscribeError(); unsubscribeYear(); unsubscribeLanguage(); };
  });</script>
<svelte:head><title>{language === 'hi' ? 'योगदानकर्ता — छठ पूजा' : 'Contributors — Chhath Puja'}</title><meta name="description" content="Browse public contribution records for Shaharpura Chhath Puja." /></svelte:head>
<header class="topbar"><a class="brand" href="/"><span class="sun" aria-hidden="true">☼</span><span><strong>Chhath Puja</strong><small>{language === 'hi' ? 'पारदर्शिता पोर्टल' : 'Transparency Portal'}</small></span></a><div class="header-actions"><button class="language" type="button" onclick={togglePortalLanguage}>{language === 'en' ? 'EN / हिंदी' : 'हिंदी / EN'}</button><label class="year-picker"><span class="sr-only">{language === 'hi' ? 'वर्ष चुनें' : 'Select year'}</span><select bind:value={selectedYear} aria-label={language === 'hi' ? 'वर्ष चुनें' : 'Select year'}>{#each years as y}<option value={y}>{y}</option>{/each}</select></label></div></header>
<main class="page">
  <p class="eyebrow">{language === 'hi' ? 'सार्वजनिक लेखा / योगदान' : 'PUBLIC LEDGER / CONTRIBUTIONS'}</p><h1>{language === 'hi' ? 'योगदानकर्ता' : 'Contributors'}<span>.</span></h1><p class="lede">{language === 'hi' ? 'नाम और वर्ष के अनुसार सामुदायिक योगदान देखें।' : 'Browse community contributions by name and year.'}</p>
  <section class="summary contributor-summary"><article class="budget-card"><p class="eyebrow">{language === 'hi' ? 'कुल योगदान' : 'TOTAL CONTRIBUTED'} · {selectedYear}</p><strong>{money(total)}</strong><div class="budget-foot"><span>{contributors.length} {language === 'hi' ? 'योगदानकर्ता दिखाए गए' : 'contributors shown'}</span><span>{selectedYear}</span></div></article></section>
  <label class="search full-search"><span aria-hidden="true">⌕</span><input bind:value={query} placeholder="{language === 'hi' ? 'नाम से खोजें…' : 'Search by name…'}" aria-label={language === 'hi' ? 'योगदानकर्ता खोजें' : 'Search contributors'} /></label>
  <div class="filter-strip" aria-label={language === 'hi' ? 'योगदान प्रकार से फ़िल्टर करें' : 'Filter by contribution type'}>{#each ['All','Cash','Material','Service'] as f}<button class:active={filter===f} onclick={()=>filter=f}>{language === 'hi' ? ({All:'सभी',Cash:'नकद',Material:'सामग्री',Service:'सेवा'}[f]) : f}</button>{/each}</div>
  {#if loading}<div class="loading" aria-label={language === 'hi' ? 'योगदानकर्ता लोड हो रहे हैं' : 'Loading contributors'}><span></span><span></span><span></span></div>{:else if error}<p class="notice" role="status">{error}</p>{:else}
    <section class="section-head"><div><p class="eyebrow">{language === 'hi' ? 'समुदाय · ' : 'COMMUNITY · '}{contributors.length} {language === 'hi' ? 'योगदानकर्ता' : 'CONTRIBUTORS'}</p><h2>{language === 'hi' ? 'योगदान रिकॉर्ड' : 'Contribution records'}</h2></div></section>
    <section class="records" aria-label={language === 'hi' ? 'सभी योगदानकर्ता' : 'All contributors'}>{#each contributors as c,i}<article class="record"><span class="rank">{String(i+1).padStart(2,'0')}</span><div class="record-main"><strong>{c.name}</strong><small>{[...c.kinds].map(k => language === 'hi' ? (k === 'Cash' ? 'नकद' : k === 'Material' ? 'सामग्री' : k === 'Service' ? 'सेवा' : 'अन्य') : k).join(' · ')} · {c.entries} {language === 'hi' ? 'रिकॉर्ड' : (c.entries===1 ? 'record' : 'records')}{c.village ? ' · '+c.village : ''}{c.detail ? ' · '+c.detail : ''}</small></div><strong class="record-amount">{money(c.amount)}</strong></article>{:else}<p class="empty">{language === 'hi' ? 'इन फ़िल्टरों से कोई योगदानकर्ता नहीं मिला।' : 'No contributors match these filters.'}</p>{/each}</section>
  {/if}
  <a class="back-link" href="/">{language === 'hi' ? '← होम पर वापस' : '← Back to home'}</a>
</main>
<BottomNav />
