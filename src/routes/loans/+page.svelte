<script lang="ts">
  import { onMount } from 'svelte';
  import { loadPortalData, portalData, portalLoading, portalError, selectedPortalYear } from '$lib/stores/portal';
  import BottomNav from '$lib/components/BottomNav.svelte';
  import { lang } from '$lib/stores/lang';
  type Row = Record<string, unknown>;
  type PortalData = { loans?: Row[]; users?: Row[]; guarantors?: Row[]; collections?: Row[]; committee?: Row[] };
  const API = 'https://chhath-public-worker.shaharpura.com?action=portalData';
  let data: PortalData = {};
  let loading = true, error = '', selectedYear = String(new Date().getFullYear()), query = '', filter = 'All';
  let selectedPortalYearValue = '';
  const value = (row: Row | undefined, ...keys: string[]) => {
    if (!row) return '';
    for (const key of keys) {
      const exact = row[key];
      if (exact !== undefined && exact !== null && String(exact).trim()) return String(exact).trim();
      const normalized = key.trim().toLowerCase().replace(/\s+/g,' ');
      const actual = Object.keys(row).find(k => k.trim().toLowerCase().replace(/\s+/g,' ') === normalized);
      if (actual && row[actual] !== undefined && row[actual] !== null && String(row[actual]).trim()) return String(row[actual]).trim();
    }
    return '';
  };
  const amount = (v: unknown) => { const n = Number(String(v ?? '').replace(/[^0-9.-]/g,'')); return Number.isFinite(n) ? n : 0; };
  const money = (n: number) => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n);
  const yearOf = (r: Row) => value(r,'Year');
  const idOf = (r: Row) => value(r,'Loaner','Loaner ID','Borrower ID','ID','Name','Receiver');
  const truthy = (v: string) => ['true','1','yes'].includes(v.toLowerCase());
  $: yearsAvailable = [...new Set((data.loans || []).map(yearOf).filter(y => /^20\d{2}$/.test(y)))].sort((a,b)=>Number(b)-Number(a));
  $: if (yearsAvailable.length && !yearsAvailable.includes(selectedYear)) selectedYear = yearsAvailable[0];
  $: if (yearsAvailable.length && selectedPortalYearValue && yearsAvailable.includes(selectedPortalYearValue)) selectedYear = selectedPortalYearValue;
  $: if (yearsAvailable.length && selectedYear) selectedPortalYear.set(selectedYear);
  $: years = yearsAvailable.length ? yearsAvailable : [selectedYear];
  $: userMap = new Map((data.users || []).map(u => [value(u,'ID'),u]).filter(([id]) => !!id) as [string,Row][]);
  $: records = (data.loans || []).filter(row => yearOf(row) === selectedYear).map(row => {
    const id = idOf(row), user = userMap.get(id);
    const principal = amount(value(row,'Amount','Principal','Loan Amount'));
    const rate = amount(value(row,'Intrest Rate','Interest Rate','Interest Rate (%)','Monthly Interest Rate'));
    const tenure = amount(value(row,'Tenure','Tenure (Months)','Duration','Months'));
    const interest = principal * rate / 100 * tenure;
    const loanId = value(row,'Loan ID');
    const loanYear = yearOf(row);
    let guarantorRows = (data.guarantors || []).filter(g => loanId
      ? value(g,'Loan ID') === loanId
      : yearOf(g) === loanYear && [value(g,'Loaner'),value(g,'ID'),value(g,'Name')].includes(id));
    const guarantors = guarantorRows.flatMap(g => {
      const ids = ['Guarantor','Guarantor ID','Guarantor 1','Guarantor 2','Guarantor 3'].map(k => value(g,k)).filter(Boolean);
      return [...new Set(ids)].map(gid => {
      const gu = userMap.get(gid);
      const isContributor = (data.collections || []).some(x => yearOf(x) === loanYear && [value(x,'ID'),value(x,'Name')].includes(gid));
      const isCommittee = (data.committee || []).some(x => yearOf(x) === loanYear && [value(x,'ID'),value(x,'Name')].includes(gid));
      return {id:gid,name:value(gu, $lang === 'hi' ? 'Name (Hindi)' : 'Name', $lang === 'hi' ? 'Name' : 'Name (Hindi)') || gid,village:value(gu,'Village'),isContributor,isCommittee};
      });
    });
    const repaid = amount(value(row,'Amount Returned','Returned Amount','Repaid Amount','Total Repaid','Paid Amount'));
    const outstanding = Math.max(0, principal + interest - repaid);
    return {id,name:value(user, $lang === 'hi' ? 'Name (Hindi)' : 'Name', $lang === 'hi' ? 'Name' : 'Name (Hindi)') || value(row, $lang === 'hi' ? 'Name (Hindi)' : 'Name', $lang === 'hi' ? 'Name' : 'Name (Hindi)') || id || 'Loan record',loanId,principal,rate,tenure,interest,total:principal+interest,repaid,outstanding,year:loanYear,guarantors};
  });
  $: visible = records.filter(r => {
    const q = query.toLowerCase();
    const status = r.outstanding <= 0 && r.principal > 0 ? 'Repaid' : r.repaid > 0 ? 'Partially repaid' : r.principal > 0 ? 'Active' : 'Unspecified';
    return (filter === 'All' || status === filter) && [r.name,r.loanId,r.year,...r.guarantors.map(g=>g.name)].join(' ').toLowerCase().includes(q);
  });
  $: totalLoan = visible.reduce((sum,r)=>sum+r.principal,0);
  $: totalWithInterest = visible.reduce((sum,r)=>sum+r.total,0);
  const unsubscribeData = portalData.subscribe((value) => { data = value as PortalData; });
  const unsubscribeLoading = portalLoading.subscribe((value) => { loading = value; });
  const unsubscribeError = portalError.subscribe((value) => { error = value; });
  const unsubscribeYear = selectedPortalYear.subscribe(value => { selectedPortalYearValue = value; });
  onMount(() => {
    void loadPortalData().catch(() => {});
    return () => { unsubscribeData(); unsubscribeLoading(); unsubscribeError(); unsubscribeYear(); };
  });</script>
<svelte:head><title>Loans — Chhath Puja</title><meta name="description" content="Browse public loan and repayment records for Shaharpura Chhath Puja." /></svelte:head>

<main class="page">
  <p class="eyebrow">PUBLIC LEDGER / LOANS</p><h1>Loans & Returns<span>.</span></h1><p class="lede">Browse recorded loans and repayment information.</p>
  <section class="summary expense-summary">
    <article class="metric"><span class="metric-label">Loan amount</span><strong>{money(totalLoan)}</strong><span class="metric-note">For selected records</span></article>
    <article class="metric expense-total-card"><span class="metric-label">Total with interest</span><strong>{money(totalWithInterest)}</strong><span class="metric-note">Principal + simple monthly interest</span></article>
  </section>
  
  <label class="search full-search"><span aria-hidden="true">⌕</span><input bind:value={query} placeholder="Search borrower or purpose…" aria-label="Search loans" /></label>
  <div class="filter-strip" aria-label="Filter loan status">{#each ['All','Active','Partially repaid','Repaid','Unspecified'] as f}<button class:active={filter===f} onclick={()=>filter=f}>{f}</button>{/each}</div>
  {#if loading}<div class="loading" aria-label="Loading loans"><span></span><span></span><span></span></div>{:else if error}<p class="notice" role="status">{error}</p>{:else}
    <section class="section-head"><div><p class="eyebrow">LOAN RECORDS · {visible.length}</p><h2>Loans & repayments</h2></div></section>
    <section class="records" aria-label="Loan records">{#each visible as row,i}<article class="record"><span class="rank">{String(i+1).padStart(2,'0')}</span><div class="record-main"><strong>{row.name}</strong><small>{row.year}{row.loanId ? ' · '+row.loanId : ''} · {row.rate}%/month · {row.tenure} months</small><small>Principal {money(row.principal)} · Interest {money(row.interest)}</small>{#if row.guarantors.length}<small>Guarantors: {row.guarantors.map(g=>g.name+(g.isCommittee?' ⚠ Committee member': '')).join(', ')}</small>{:else}<small>No guarantors recorded</small>{/if}</div><strong class="record-amount">{money(row.total)}</strong></article>{:else}<p class="empty">No loan records match these filters.</p>{/each}</section>
  {/if}
  <a class="back-link" href="/">← Back to home</a>
</main>
<BottomNav />
