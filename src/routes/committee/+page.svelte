<script lang="ts">
  import BottomNav from "$lib/components/BottomNav.svelte";
  import { onMount } from 'svelte';
  import { loadPortalData, portalData, portalLoading, portalError, selectedPortalYear } from '$lib/stores/portal';
  type Row = Record<string, unknown>;
  type PortalData = { committee?: Row[]; users?: Row[] };
  let data: PortalData = {};
  let rows: Row[] = [], users: Row[] = [], loading = true, error = '';
  let selectedYear = String(new Date().getFullYear());
  const value = (r: Row | undefined, ...keys: string[]) => {
    if (!r) return '';
    for (const key of keys) {
      const v = r[key];
      if (v !== undefined && v !== null && String(v).trim()) return String(v).trim();
      const norm = key.trim().toLowerCase().replace(/\s+/g,' ');
      const actual = Object.keys(r).find(k => k.trim().toLowerCase().replace(/\s+/g,' ') === norm);
      if (actual && r[actual] !== undefined && r[actual] !== null && String(r[actual]).trim()) return String(r[actual]).trim();
    }
    return '';
  };
  $: rows = data.committee || [];
  $: users = data.users || [];
  $: userMap = new Map(users.map(u => [value(u,'ID'),u]).filter(([id]) => !!id) as [string,Row][]);
  $: availableYears = [...new Set(rows.map(r => value(r,'Year')).filter(y => /^20\d{2}$/.test(y)))].sort((a,b)=>Number(b)-Number(a));
  $: if (availableYears.length && !availableYears.includes(selectedYear)) selectedYear = availableYears[0];
  $: if (selectedYear) selectedPortalYear.set(selectedYear);
  $: members = rows.filter(r => value(r,'Year') === selectedYear).map(r => {
    const id = value(r,'ID','Name');
    const u = userMap.get(id);
    return { id, name: value(u,'Name (Hindi)','Name') || value(r,'Name (Hindi)','Name') || id, hindi: value(u,'Name (Hindi)'), role: value(r,'View Role','Role') || value(u,'Designation'), roleHindi: value(r,'View Role (Hindi)','Role (Hindi)') || value(u,'Designation (Hindi)'), village: value(u,'Village'), villageHindi: value(u,'Village (Hindi)'), year: value(r,'Year'), mobile: value(u,'Mobile') };
  }).filter(m => m.name || m.role).sort((a,b)=>Number(b.year)-Number(a.year));
  const unsubscribeData = portalData.subscribe((value) => { data = value as PortalData; });
  const unsubscribeLoading = portalLoading.subscribe((value) => { loading = value; });
  const unsubscribeError = portalError.subscribe((value) => { error = value; });
  onMount(() => {
    void loadPortalData().catch(() => {});
    return () => { unsubscribeData(); unsubscribeLoading(); unsubscribeError(); };
  });</script>
<svelte:head><title>Committee — Chhath Puja</title><meta name="description" content="Committee information for Shaharpura Chhath Puja." /></svelte:head>
<header class="topbar"><a class="brand" href="/"><span class="sun" aria-hidden="true">☼</span><span><strong>Chhath Puja</strong><small>Transparency Portal</small></span></a><a class="language" href="/">← Home</a></header>
<main class="page">
  <p class="eyebrow">COMMUNITY / ORGANISATION</p><h1>Committee<span>.</span></h1><p class="lede">Navyuvak Chhath Puja Samiti, Shaharpura, Gardih.</p>
  <section class="journey"><div><p class="eyebrow">OUR PURPOSE</p><h2>Faith · Service · Transparency</h2><p>The committee organises community Chhath Puja activities and publishes available contribution and expense records through this portal.</p></div></section>
  <section class="section-head"><div><p class="eyebrow">PUBLIC INFORMATION · {members.length} RECORDS</p><h2>Committee members</h2></div><label class="year-picker"><span class="sr-only">Select year</span><select bind:value={selectedYear} aria-label="Select committee year">{#each availableYears as y}<option value={y}>{y}</option>{/each}</select></label></section>
  {#if loading}<p class="notice">Loading committee records…</p>{:else if error}<p class="notice" role="status">{error}</p>{:else}
    <section class="records" aria-label="Committee members">{#each members as member,i}<article class="record"><span class="rank">{String(i+1).padStart(2,'0')}</span><div class="record-main"><strong>{member.name}</strong><small>{member.role || 'Committee member'}{member.year ? ' · '+member.year : ''}{member.village ? ' · '+member.village : ''}</small>{#if member.hindi || member.roleHindi}<small>{member.hindi}{member.roleHindi ? ' · '+member.roleHindi : ''}</small>{/if}</div>{#if member.mobile}<a class="text-link" href={'tel:'+member.mobile}>Contact</a>{/if}</article>{:else}<p class="empty">No committee members are published in the current public data.</p>{/each}</section>
  {/if}
  <a class="back-link" href="/">← Back to home</a>
</main>
