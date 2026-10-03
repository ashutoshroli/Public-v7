<script lang="ts">
  import BottomNav from "$lib/components/BottomNav.svelte";
  import { onMount } from 'svelte';
  import { loadPortalData, portalData, portalLoading, portalError, selectedPortalYear } from '$lib/stores/portal';
  import { portalLanguage, togglePortalLanguage, initPortalLanguage } from '$lib/stores/language';
  type Row = Record<string, unknown>;
  type PortalData = { committee?: Row[]; users?: Row[] };
  let data: PortalData = {};
  let rows: Row[] = [], users: Row[] = [], loading = true, error = '';
  let selectedYear = String(new Date().getFullYear());
  let language: 'en' | 'hi' = 'en';
  const unsubscribeLanguage = portalLanguage.subscribe(value => { language = value; });
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
    return { id, name: language === 'hi' ? (value(u,'Name (Hindi)','Name') || value(r,'Name (Hindi)','Name') || id) : (value(u,'Name') || value(r,'Name') || id), hindi: value(u,'Name (Hindi)'), role: value(r,'View Role','Role') || value(u,'Designation'), roleHindi: value(r,'View Role (Hindi)','Role (Hindi)') || value(u,'Designation (Hindi)'), village: language === 'hi' ? (value(u,'Village (Hindi)','Village')) : (value(u,'Village','Village (Hindi)')), villageHindi: value(u,'Village (Hindi)'), year: value(r,'Year'), mobile: value(u,'Mobile') };
  }).filter(m => m.name || m.role).sort((a,b)=>Number(b.year)-Number(a.year));
  const unsubscribeData = portalData.subscribe((value) => { data = value as PortalData; });
  const unsubscribeLoading = portalLoading.subscribe((value) => { loading = value; });
  const unsubscribeError = portalError.subscribe((value) => { error = value; });
  onMount(() => {
    initPortalLanguage();
    void loadPortalData().catch(() => {});
    return () => { unsubscribeData(); unsubscribeLoading(); unsubscribeError(); unsubscribeLanguage(); };
  });</script>
<svelte:head><title>{language === 'hi' ? 'समिति — छठ पूजा' : 'Committee — Chhath Puja'}</title><meta name="description" content="Committee information for Shaharpura Chhath Puja." /></svelte:head>
<header class="topbar"><a class="brand" href="/"><span class="sun" aria-hidden="true">☼</span><span><strong>Chhath Puja</strong><small>Transparency Portal</small></span></a><div class="header-actions"><button class="language" type="button" onclick={togglePortalLanguage}>{language === 'en' ? 'EN / हिंदी' : 'हिंदी / EN'}</button><a class="language" href="/">← Home</a></div></header>
<main class="page">
  <p class="eyebrow">COMMUNITY / ORGANISATION</p><h1>{language === 'hi' ? 'समिति' : 'Committee'}<span>.</span></h1><p class="lede">{language === 'hi' ? 'नवयुवक छठ पूजा समिति, शहरपुरा, गरडीह।' : 'Navyuvak Chhath Puja Samiti, Shaharpura, Gardih.'}</p>
  <section class="journey"><div><p class="eyebrow">{language === 'hi' ? 'हमारा उद्देश्य' : 'OUR PURPOSE'}</p><h2>{language === 'hi' ? 'आस्था · सेवा · पारदर्शिता' : 'Faith · Service · Transparency'}</h2><p>{language === 'hi' ? 'समिति सामुदायिक छठ पूजा का आयोजन करती है और इस पोर्टल पर उपलब्ध योगदान तथा खर्च रिकॉर्ड प्रकाशित करती है।' : 'The committee organises community Chhath Puja activities and publishes available contribution and expense records through this portal.'}</p></div></section>
  <section class="section-head"><div><p class="eyebrow">PUBLIC INFORMATION · {members.length} RECORDS</p><h2>{language === 'hi' ? 'समिति सदस्य' : 'Committee members'}</h2></div><label class="year-picker"><span class="sr-only">Select year</span><select bind:value={selectedYear} aria-label="Select committee year">{#each availableYears as y}<option value={y}>{y}</option>{/each}</select></label></section>
  {#if loading}<p class="notice">Loading committee records…</p>{:else if error}<p class="notice" role="status">{error}</p>{:else}
    <section class="records" aria-label="Committee members">{#each members as member,i}<article class="record"><span class="rank">{String(i+1).padStart(2,'0')}</span><div class="record-main"><strong>{member.name}</strong><small>{language === 'hi' ? (member.roleHindi || member.role || 'समिति सदस्य') : (member.role || 'Committee member')}{member.year ? ' · '+member.year : ''}{member.village ? ' · '+member.village : ''}</small>{#if member.hindi || member.roleHindi}<small>{language === 'hi' ? '' : member.hindi}{language === 'hi' ? '' : (member.roleHindi ? ' · '+member.roleHindi : '')}</small>{/if}</div>{#if member.mobile}<a class="text-link" href={'tel:'+member.mobile}>{language === 'hi' ? 'संपर्क करें' : 'Contact'}</a>{/if}</article>{:else}<p class="empty">{language === 'hi' ? 'वर्तमान सार्वजनिक डेटा में समिति सदस्य प्रकाशित नहीं हैं।' : 'No committee members are published in the current public data.'}</p>{/each}</section>
  {/if}
  <a class="back-link" href="/">{language === 'hi' ? '← होम पर वापस' : '← Back to home'}</a>
</main>
