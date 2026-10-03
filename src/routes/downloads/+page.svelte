<script lang="ts">
  import { onMount } from 'svelte';
  import { loadPortalData, portalData, portalLoading, portalError, selectedPortalYear } from '$lib/stores/portal';
  import BottomNav from '$lib/components/BottomNav.svelte';
  type Row = Record<string, unknown>;
  type PortalData = { collections?: Row[]; users?: Row[]; generatedFiles?: Row[]; generated_files?: Row[]; loanConsents?: Row[]; loan_consents?: Row[] };
  const API = 'https://chhath-public-worker.shaharpura.com?action=portalData';
  let data: PortalData = {}, loading = true, error = '', query = '', selectedYear = '', selectedPortalYearValue = '';
  const value = (r: Row | undefined, ...keys: string[]) => {
    if (!r) return '';
    for (const key of keys) {
      if (r[key] !== undefined && r[key] !== null && String(r[key]).trim()) return String(r[key]).trim();
      const norm = key.trim().toLowerCase().replace(/\s+/g,' ');
      const actual = Object.keys(r).find(k => k.trim().toLowerCase().replace(/\s+/g,' ') === norm);
      if (actual && r[actual] !== undefined && r[actual] !== null && String(r[actual]).trim()) return String(r[actual]).trim();
    }
    return '';
  };
  const safePublicUrl = (raw: string) => {
    try {
      const url = new URL(raw);
      return url.protocol === 'https:' ? url.href : '';
    } catch {
      return '';
    }
  };
  const resell = (r: Row) => ['true','1','yes'].includes(value(r,'Is Resell').toLowerCase());
  $: users = data.users || [];
  $: userMap = new Map(users.map(u => [value(u,'ID'),u]).filter(([id]) => !!id) as [string,Row][]);
  $: generated = data.generatedFiles || data.generated_files || [];
  $: consents = data.loanConsents || data.loan_consents || [];
  $: years = [...new Set([...(data.collections || []).map(r=>value(r,'Year')),...generated.map(r=>value(r,'year','Year')),...consents.map(r=>value(r,'year','Year'))].filter(y=>/^20\d{2}$/.test(y)))].sort((a,b)=>Number(b)-Number(a));
  $: if (years.length && selectedPortalYearValue && years.includes(selectedPortalYearValue)) selectedYear = selectedPortalYearValue;
  $: if (years.length && !years.includes(selectedYear)) selectedYear = years[0];
  $: if (years.length && selectedYear) selectedPortalYear.set(selectedYear);
  $: documents = [
    ...(data.collections || []).flatMap((r,i) => {
      if (resell(r)) return [];
      const year = value(r,'Year'), id = value(r,'ID','Name'), user = userMap.get(id);
      const name = value(user,'Name (Hindi)','Name') || value(r,'Name (Hindi)','Name') || id || 'Contribution';
      const type = value(r,'Contribution Type');
      const docType = type === '2' ? 'samaan' : type === '3' ? 'receipt_work' : value(r,'Certificate','Is Certificate').toLowerCase() === 'true' ? 'certificate' : 'receipt';
      const rowIndex = value(r,'__rowIndex') || String(i);
      const recordId = docType+'-'+year+'-'+rowIndex;
      const file = generated.find(g=>value(g,'doc_type')===docType && value(g,'year')===year && value(g,'record_id')===recordId);
      const link = safePublicUrl(value(file,'public_link'));
      return link ? [{name,year,type:docType,recordId,link,kind:'Receipt / contribution'}] : [];
    }),
    ...consents.flatMap(r => {
      if (value(r,'status').toLowerCase() !== 'accepted') return [];
      const year = value(r,'year','Year'), cid = value(r,'consent_id'), role = value(r,'role').toLowerCase();
      if (!['loaner','guarantor'].includes(role) || !cid) return [];
      const type = role === 'loaner' ? 'consent_loaner' : 'consent_guarantor';
      const recordId = type+'-'+year+'-'+cid;
      const file = generated.find(g=>value(g,'doc_type')===type && value(g,'year')===year && value(g,'record_id')===recordId);
      const personId = value(r,'person_id'), user = userMap.get(personId);
      const link = value(file,'public_link');
      return link ? [{name:value(user,'Name') || personId || 'Consent document',year,type,recordId,link,kind:role === 'loaner' ? 'Loaner consent' : 'Guarantor consent'}] : [];
    })
  ];
  $: visible = documents.filter(d=>d.year===selectedYear && [d.name,d.year,d.kind,d.recordId].join(' ').toLowerCase().includes(query.toLowerCase()));
  const unsubscribeData = portalData.subscribe((value) => { data = value as PortalData; });
  const unsubscribeLoading = portalLoading.subscribe((value) => { loading = value; });
  const unsubscribeError = portalError.subscribe((value) => { error = value; });
  const unsubscribeYear = selectedPortalYear.subscribe(value => { selectedPortalYearValue = value; });
  onMount(() => {
    void loadPortalData().catch(() => {});
    return () => { unsubscribeData(); unsubscribeLoading(); unsubscribeError(); unsubscribeYear(); };
  });</script>
<svelte:head><title>Downloads — Chhath Puja</title><meta name="description" content="Public receipts, certificates and consent documents." /></svelte:head>

<main class="page">
  <p class="eyebrow">PUBLIC DOCUMENTS / GENERATED FILES</p><h1>Downloads<span>.</span></h1><p class="lede">Published receipts, material records, certificates and accepted loan consent documents.</p>
  <div class="header-actions"><label class="year-picker"><span class="sr-only">Select year</span><select bind:value={selectedYear} aria-label="Filter downloads by year">{#each years as y}<option value={y}>{y}</option>{/each}</select></label></div>
  <label class="search full-search"><span aria-hidden="true">⌕</span><input bind:value={query} placeholder="Search name, year or document…" aria-label="Search documents" /></label>
  {#if loading}<p class="notice">Loading published documents…</p>{:else if error}<p class="notice" role="status">{error}</p>{:else}
    <section class="section-head"><div><p class="eyebrow">AVAILABLE FILES · {visible.length}</p><h2>Published downloads</h2></div></section>
    <section class="records" aria-label="Published downloads">{#each visible as doc,i}<article class="record"><span class="rank">{String(i+1).padStart(2,'0')}</span><div class="record-main"><strong>{doc.name}</strong><small>{doc.kind} · {doc.year} · {doc.recordId}</small></div><a class="text-link" href={doc.link} target="_blank" rel="noopener noreferrer">Open ↗</a></article>{:else}<p class="empty">No generated files match this search. Only published links with a matching record ID are shown.</p>{/each}</section>
  {/if}
  <a class="back-link" href="/">← Back to public ledger</a>
</main><BottomNav />