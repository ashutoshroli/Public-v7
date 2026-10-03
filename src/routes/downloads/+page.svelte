<script lang="ts">
  import { onMount } from 'svelte';
  import { loadPortalData, portalData, portalLoading, portalError } from '$lib/stores/portal';
  import { lang } from '$lib/stores/lang';
  import { initPortalLanguage } from '$lib/stores/language';
  import { peopleInVillage, downloadsForPerson } from '$lib/api/derive';
  import type { PortalData, UserRow } from '$lib/api/schema';
  import BottomNav from '$lib/components/BottomNav.svelte';
  let data: PortalData;
  let loading = true, error = '', selectedVillage = '', selectedPerson = '', nameQuery = '';
  const text = (en: string, hi: string) => $lang === 'hi' ? hi : en;
  const value = (row: Record<string, unknown> | undefined, key: string, fallback = '') => {
    if (!row) return fallback;
    const v = row[key];
    return v === undefined || v === null || !String(v).trim() ? fallback : String(v).trim();
  };
  const displayName = (p: UserRow) => $lang === 'hi' ? value(p as Record<string,unknown>,'Name (Hindi)',value(p as Record<string,unknown>,'Name')) : value(p as Record<string,unknown>,'Name',value(p as Record<string,unknown>,'Name (Hindi)'));
  const displayVillage = (p: UserRow) => $lang === 'hi' ? value(p as Record<string,unknown>,'Village (Hindi)',value(p as Record<string,unknown>,'Village')) : value(p as Record<string,unknown>,'Village',value(p as Record<string,unknown>,'Village (Hindi)'));
  const docLabel = (key: string) => {
    const labels: Record<string,[string,string]> = {
      doc_receipt:['Receipt','रसीद'], doc_receipt_work:['Work receipt','कार्य रसीद'],
      doc_certificate:['Certificate','प्रमाण-पत्र'], doc_samaan:['Material receipt','सामग्री रसीद'],
      doc_consent_loaner:['Loan consent (borrower)','ऋण सहमति (ऋणी)'],
      doc_consent_guarantor:['Loan consent (guarantor)','ऋण सहमति (गारंटर)']
    };
    const pair = labels[key] || [key,key];
    return text(pair[0],pair[1]);
  };
  function choosePerson(p: UserRow) { selectedPerson = value(p as Record<string,unknown>,'ID'); nameQuery = displayName(p); }
  function resetSelection() { selectedPerson = ''; nameQuery = ''; }
  $: source = data || ({users:[],collections:[],loans:[],loanConsents:[],generatedFiles:[]} as unknown as PortalData);
  $: villageOptions = [...new Map((source.users || []).map(u => {
    const row = u as Record<string,unknown>, en = value(row,'Village'), hi = value(row,'Village (Hindi)',en);
    return [en || hi,{value:en || hi,en:en || hi,hi:hi || en || hi}] as const;
  }).filter(([key]) => Boolean(key))).values()].sort((a,b) => ($lang === 'hi' ? a.hi : a.en).localeCompare($lang === 'hi' ? b.hi : b.en));
  $: people = selectedVillage && nameQuery.trim() ? peopleInVillage(source,selectedVillage,nameQuery.trim(),1000).sort((a,b)=>displayName(a).localeCompare(displayName(b))) : [];
  $: person = (source.users || []).find(u => value(u as Record<string,unknown>,'ID') === selectedPerson);
  $: groups = selectedPerson ? downloadsForPerson(source,selectedPerson) : [];
  $: docs = groups.flatMap(group => group.docs.map(doc => ({...doc,titleKey:group.titleKey})));
  $: availableDocs = docs.filter(doc => Boolean(doc.publicLink));
  $: unavailableDocs = docs.filter(doc => !doc.publicLink);
  const unsubData = portalData.subscribe(v => data = v as PortalData);
  const unsubLoading = portalLoading.subscribe(v => loading = v);
  const unsubError = portalError.subscribe(v => error = v);
  onMount(() => { initPortalLanguage(); void loadPortalData().catch(e => error = e instanceof Error ? e.message : 'Unable to load public records.'); return () => { unsubData(); unsubLoading(); unsubError(); }; });
</script>
<svelte:head><title>{text('Download Center — Chhath Puja','डाउनलोड केंद्र — छठ पूजा')}</title><meta name="description" content="Find public receipts, certificates and consent documents by village and person."/></svelte:head>
<header class="topbar"><a class="brand" href="/"><span class="sun" aria-hidden="true">☼</span><span><strong>Chhath Puja</strong><small>{text('Transparency Portal','पारदर्शिता पोर्टल')}</small></span></a><button class="language" type="button" onclick={() => lang.toggle()}>{text('हिंदी','English')}</button></header>
<main class="page">
  <p class="eyebrow">{text('PUBLIC DOCUMENTS / GENERATED FILES','सार्वजनिक दस्तावेज़ / उपलब्ध फ़ाइलें')}</p>
  <h1>{text('Download Center','डाउनलोड केंद्र')}<span>.</span></h1>
  <p class="lede">{text('Choose a village, then search for a person to see their documents.','पहले गाँव चुनें, फिर नाम खोजें और उस व्यक्ति के दस्तावेज़ देखें।')}</p>
  {#if loading}<p class="notice" role="status">{text('Loading public records…','सार्वजनिक रिकॉर्ड लोड हो रहे हैं…')}</p>
  {:else if error}<p class="notice" role="status">{error}</p><button type="button" class="retry" onclick={() => {error='';void loadPortalData().catch(e=>error=e instanceof Error?e.message:'Unable to load public records.')}}>{text('Retry','फिर से प्रयास करें')}</button>
  {:else}
    <section class="picker-card">
      <label class="field-label" for="village-select">{text('1. Select village','1. गाँव चुनें')}</label>
      <select id="village-select" class="full-select" bind:value={selectedVillage} onchange={resetSelection}><option value="">{text('-- Select village --','-- गाँव चुनें --')}</option>{#each villageOptions as village}<option value={village.value}>{$lang === 'hi' ? village.hi : village.en}</option>{/each}</select>
      <label class="field-label" for="person-search">{text('2. Search name','2. नाम खोजें')}</label>
      <input id="person-search" class="full-select" type="search" placeholder={text('Type a name to search…','नाम खोजने के लिए लिखें…')} bind:value={nameQuery} disabled={!selectedVillage} oninput={() => selectedPerson=''} autocomplete="off"/>
      {#if !selectedVillage}
        <p class="hint">{text('Please select a village first.','कृपया पहले गाँव चुनें।')}</p>
      {:else if nameQuery.trim()}
        <div class="search-results" aria-label={text('Matching people','मिलते-जुलते नाम')}>
          {#each people as p}
            <button type="button" class="person-option" onclick={() => choosePerson(p)}>
              <span><strong>{displayName(p)}</strong><small>{displayVillage(p)}</small></span><span aria-hidden="true">›</span>
            </button>
          {:else}
            <p class="empty">{text('No matching names found.','कोई मिलता-जुलता नाम नहीं मिला।')}</p>
          {/each}
        </div>
      {/if}
      {#if selectedPerson && person}<div class="selected-person"><span>{text('Selected person','चयनित व्यक्ति')}</span><strong>{displayName(person)}</strong><button type="button" class="text-button" onclick={resetSelection}>{text('Change','बदलें')}</button></div>{/if}
    </section>
    {#if selectedPerson}
      <section class="section-head"><div><p class="eyebrow">{text('DOCUMENT STATUS','दस्तावेज़ की स्थिति')}</p><h2>{text('Available files','उपलब्ध फ़ाइलें')} · {availableDocs.length}</h2></div></section>
      <section class="records" aria-label={text('Available files','उपलब्ध फ़ाइलें')}>{#each availableDocs as doc,i}<article class="record"><span class="rank">{String(i+1).padStart(2,'0')}</span><div class="record-main"><strong>{docLabel(doc.labelKey)}</strong><small>{doc.year}</small></div><a class="text-link" href={doc.publicLink} target="_blank" rel="noopener noreferrer">{text('Download ↗','डाउनलोड ↗')}</a></article>{:else}<p class="empty">{text('No available files for this person.','इस व्यक्ति के लिए कोई उपलब्ध फ़ाइल नहीं है।')}</p>{/each}</section>
      <section class="section-head unavailable-head"><div><p class="eyebrow">{text('NOT PUBLISHED / MISSING FILES','प्रकाशित नहीं / अनुपलब्ध फ़ाइलें')}</p><h2>{text('Unavailable files','अनुपलब्ध फ़ाइलें')} · {unavailableDocs.length}</h2></div></section>
      <section class="records" aria-label={text('Unavailable files','अनुपलब्ध फ़ाइलें')}>{#each unavailableDocs as doc,i}<article class="record unavailable-record"><span class="rank">{String(i+1).padStart(2,'0')}</span><div class="record-main"><strong>{docLabel(doc.labelKey)}</strong><small>{doc.year}</small></div><span class="status-muted">{text('Not available','उपलब्ध नहीं')}</span></article>{:else}<p class="empty">{text('No missing files found for this person.','इस व्यक्ति के लिए कोई अनुपलब्ध फ़ाइल नहीं मिली।')}</p>{/each}</section>
    {:else}<p class="empty prompt-empty">{text('Select a village and search for a name to view documents.','दस्तावेज़ देखने के लिए गाँव चुनें और नाम खोजें।')}</p>{/if}
  {/if}
  <a class="back-link" href="/">{text('← Back to home','← होम पर वापस')}</a>
</main><BottomNav/>
<style>
.picker-card{display:grid;gap:.55rem;padding:1rem;margin:1.2rem 0;border:1px solid var(--border,#e5e7eb);border-radius:1rem;background:var(--card,#fff);color:var(--text,#1f2937)}
.field-label{font-size:.85rem;font-weight:700;margin-top:.25rem}
.full-select{width:100%;min-height:46px;padding:.7rem .8rem;border:1px solid var(--border,#d1d5db);border-radius:.7rem;background:var(--card,#fff);color:var(--text,#1f2937);font:inherit}
.full-select:disabled{opacity:.65}.search-results{display:grid;gap:.35rem;max-height:18rem;overflow:auto;margin-top:.25rem}
.person-option{display:flex;align-items:center;justify-content:space-between;gap:1rem;width:100%;padding:.75rem;border:1px solid var(--border,#e5e7eb);border-radius:.65rem;background:var(--card,#fff);color:var(--text,#1f2937);text-align:left;font:inherit;cursor:pointer}
.person-option span:first-child{display:grid;gap:.2rem}.person-option small{color:var(--muted,#68736e)}.person-option:active{transform:scale(.99)}
.selected-person{display:flex;align-items:center;gap:.6rem;flex-wrap:wrap;margin-top:.5rem;padding:.8rem;border-radius:.7rem;background:var(--surface,#f6f6f2)}
.selected-person span,.hint{color:var(--muted,#68736e);font-size:.85rem}.selected-person strong{flex:1}
.text-button,.retry{padding:.5rem .7rem;border:1px solid var(--border,#d1d5db);border-radius:.6rem;background:var(--card,#fff);font:inherit}
.unavailable-head{margin-top:1.5rem}.unavailable-record{opacity:.82}.status-muted{font-size:.8rem;font-weight:700;color:var(--muted,#68736e);white-space:nowrap}.prompt-empty{margin-top:1rem}
</style>