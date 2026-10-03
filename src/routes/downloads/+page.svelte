<script lang="ts">
  import { onMount } from 'svelte';
  import { loadPortalData, portalData, portalLoading, portalError } from '$lib/stores/portal';
  import { lang, tr } from '$lib/stores/lang';
  import { villages, peopleInVillage, downloadsForPerson, type DownloadGroup } from '$lib/api/derive';
  import type { PortalData } from '$lib/api/schema';
  import BottomNav from '$lib/components/BottomNav.svelte';
  let data: PortalData;
  let loading = true, error = '', selectedVillage = '', selectedPerson = '', nameQuery = '';
  const text = (en: string, hi: string) => $lang === 'hi' ? hi : en;
  const value = (r: Record<string, unknown> | undefined, key: string, fallback = '') => {
    if (!r) return fallback;
    const v = r[key];
    return v === undefined || v === null || !String(v).trim() ? fallback : String(v).trim();
  };
  $: source = data || { users: [], collections: [], loans: [], loanConsents: [], generatedFiles: [] };
  $: villageOptions = [...new Set((source.users || []).map(u => value(u as Record<string,unknown>, $lang === 'hi' ? 'Village (Hindi)' : 'Village', value(u as Record<string,unknown>, 'Village'))).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
  $: villageRecord = (source.users || []).find(u => value(u as Record<string,unknown>, 'Village') === selectedVillage || value(u as Record<string,unknown>, 'Village (Hindi)') === selectedVillage);
  $: canonicalVillage = villageRecord ? value(villageRecord as Record<string,unknown>, 'Village', selectedVillage) : selectedVillage;
  $: people = selectedVillage && nameQuery.trim() ? peopleInVillage(source, canonicalVillage, nameQuery.trim(), 1000).sort((a,b) => {
    const an = $lang === 'hi' ? value(a as Record<string,unknown>, 'Name (Hindi)', value(a as Record<string,unknown>, 'Name')) : value(a as Record<string,unknown>, 'Name', value(a as Record<string,unknown>, 'Name (Hindi)'));
    const bn = $lang === 'hi' ? value(b as Record<string,unknown>, 'Name (Hindi)', value(b as Record<string,unknown>, 'Name')) : value(b as Record<string,unknown>, 'Name', value(b as Record<string,unknown>, 'Name (Hindi)'));
    return an.localeCompare(bn);
  }) : [];
  $: person = (source.users || []).find(u => value(u as Record<string,unknown>, 'ID') === selectedPerson);
  $: groups = selectedPerson ? downloadsForPerson(source, selectedPerson) : [];
  $: allDocs = groups.flatMap(g => g.docs.map(d => ({...d, titleKey:g.titleKey})));
  $: availableDocs = allDocs.filter(d => !!d.publicLink);
  $: unavailableDocs = allDocs.filter(d => !d.publicLink);
  $: if (selectedVillage && !villageOptions.includes(selectedVillage)) { selectedVillage = ''; selectedPerson = ''; }
  $: if (selectedPerson && !people.some(p => value(p as Record<string,unknown>, 'ID') === selectedPerson)) selectedPerson = '';
  const unsubscribeData = portalData.subscribe(v => { data = v as PortalData; });
  const unsubscribeLoading = portalLoading.subscribe(v => { loading = v; });
  const unsubscribeError = portalError.subscribe(v => { error = v; });
  onMount(() => { void loadPortalData().catch(() => {}); return () => { unsubscribeData(); unsubscribeLoading(); unsubscribeError(); }; });
</script>
<svelte:head><title>{$lang === 'hi' ? 'डाउनलोड केंद्र — छठ पूजा' : 'Download Center — Chhath Puja'}</title><meta name="description" content="Find public receipts, certificates and consent documents by village and person." /></svelte:head>
<header class="topbar"><a class="brand" href="/"><span class="sun" aria-hidden="true">☼</span><span><strong>Chhath Puja</strong><small>{$lang === 'hi' ? 'पारदर्शिता पोर्टल' : 'Transparency Portal'}</small></span></a><button class="language" type="button" onclick={() => lang.toggle()}>{$lang === 'hi' ? 'English' : 'हिंदी'}</button></header>
<main class="page">
  <p class="eyebrow">{text('PUBLIC DOCUMENTS / GENERATED FILES','सार्वजनिक दस्तावेज़ / उपलब्ध फ़ाइलें')}</p>
  <h1>{text('Download Center','डाउनलोड केंद्र')}<span>.</span></h1>
  <p class="lede">{text('Choose a village, then a person, to see their available and unavailable documents.','पहले गाँव चुनें, फिर व्यक्ति का नाम चुनें। उसके उपलब्ध और अनुपलब्ध दस्तावेज़ यहाँ दिखेंगे।')}</p>
  {#if loading}<p class="notice">{text('Loading public records…','सार्वजनिक रिकॉर्ड लोड हो रहे हैं…')}</p>
  {:else if error}<p class="notice" role="status">{error}</p>
  {:else}
    <section class="picker-card">
      <label class="field-label" for="village-select">{text('1. Select village','1. गाँव चुनें')}</label>
      <select id="village-select" class="full-select" bind:value={selectedVillage} onchange={() => { selectedPerson = ''; nameQuery = ''; }}>
        <option value="">{text('-- Select village --','-- गाँव चुनें --')}</option>
        {#each villageOptions as village}<option value={village}>{village}</option>{/each}
      </select>
      <label class="field-label" for="person-search">{text('2. Search name','2. नाम खोजें')}</label>
      <input id="person-search" class="full-select" type="search" placeholder={text('Type a name to search…','नाम खोजने के लिए टाइप करें…')} bind:value={nameQuery} disabled={!selectedVillage} oninput={() => selectedPerson = ''} autocomplete="off" />
      {#if selectedVillage && nameQuery.trim()}
        <div class="search-results" role="listbox" aria-label={text('Matching people','मिलते-जुलते नाम')}>
          {#each people as p}
            <button type="button" class="person-option" onclick={() => { selectedPerson = value(p as Record<string,unknown>, 'ID'); nameQuery = $lang === 'hi' ? value(p as Record<string,unknown>, 'Name (Hindi)', value(p as Record<string,unknown>, 'Name')) : value(p as Record<string,unknown>, 'Name', value(p as Record<string,unknown>, 'Name (Hindi)'))); }}>
              <span>{ $lang === 'hi' ? value(p as Record<string,unknown>, 'Name (Hindi)', value(p as Record<string,unknown>, 'Name')) : value(p as Record<string,unknown>, 'Name', value(p as Record<string,unknown>, 'Name (Hindi'))) }</span><span aria-hidden="true">›</span>
            </button>
          {:else}
            <p class="empty">{text('No matching names found.','कोई मिलता-जुलता नाम नहीं मिला।')}</p>
          {/each}
        </div>
      {/if}
      {#if selectedPerson && person}<p class="selected-person">{text('Selected person:','चयनित व्यक्ति:')} <strong>{$lang === 'hi' ? value(person as Record<string,unknown>, 'Name (Hindi)', value(person as Record<string,unknown>, 'Name')) : value(person as Record<string,unknown>, 'Name', value(person as Record<string,unknown>, 'Name (Hindi)'))}</strong></p>{/if}
    </section>
    {#if selectedPerson}
      <section class="section-head"><div><p class="eyebrow">{text('DOCUMENT STATUS','दस्तावेज़ की स्थिति')}</p><h2>{text('Available files','उपलब्ध फ़ाइलें')} · {availableDocs.length}</h2></div></section>
      <section class="records" aria-label="Available files">
        {#each availableDocs as doc,i}
          <article class="record"><span class="rank">{String(i+1).padStart(2,'0')}</span><div class="record-main"><strong>{text(doc.labelKey === 'doc_receipt' ? 'Receipt' : doc.labelKey === 'doc_receipt_work' ? 'Work receipt' : doc.labelKey === 'doc_certificate' ? 'Certificate' : doc.labelKey === 'doc_samaan' ? 'Material receipt' : doc.labelKey === 'doc_consent_loaner' ? 'Loan consent (loaner)' : 'Loan consent (guarantor)', doc.labelKey === 'doc_receipt' ? 'रसीद' : doc.labelKey === 'doc_receipt_work' ? 'कार्य रसीद' : doc.labelKey === 'doc_certificate' ? 'प्रमाण-पत्र' : doc.labelKey === 'doc_samaan' ? 'सामग्री रसीद' : doc.labelKey === 'doc_consent_loaner' ? 'ऋण सहमति (ऋणी)' : 'ऋण सहमति (गारंटर)')}</strong><small>{doc.year} · {doc.recordId}</small></div><a class="text-link" href={doc.publicLink} target="_blank" rel="noopener noreferrer">{text('Download ↗','डाउनलोड ↗')}</a></article>
        {:else}<p class="empty">{text('No available files for this person.','इस व्यक्ति के लिए कोई उपलब्ध फ़ाइल नहीं है।')}</p>{/each}
      </section>
      <section class="section-head unavailable-head"><div><p class="eyebrow">{text('NOT PUBLISHED / MISSING FILES','प्रकाशित नहीं / अनुपलब्ध फ़ाइलें')}</p><h2>{text('Unavailable files','अनुपलब्ध फ़ाइलें')} · {unavailableDocs.length}</h2></div></section>
      <section class="records" aria-label="Unavailable files">
        {#each unavailableDocs as doc,i}
          <article class="record unavailable-record"><span class="rank">{String(i+1).padStart(2,'0')}</span><div class="record-main"><strong>{doc.labelKey === 'doc_receipt' ? text('Receipt','रसीद') : doc.labelKey === 'doc_receipt_work' ? text('Work receipt','कार्य रसीद') : doc.labelKey === 'doc_certificate' ? text('Certificate','प्रमाण-पत्र') : doc.labelKey === 'doc_samaan' ? text('Material receipt','सामग्री रसीद') : doc.labelKey === 'doc_consent_loaner' ? text('Loan consent (loaner)','ऋण सहमति (ऋणी)') : text('Loan consent (guarantor)','ऋण सहमति (गारंटर)')}</strong><small>{doc.year} · {doc.recordId}</small></div><span class="status-muted">{text('Not available','उपलब्ध नहीं')}</span></article>
        {:else}<p class="empty">{text('No missing files found for this person.','इस व्यक्ति के लिए कोई अनुपलब्ध फ़ाइल नहीं मिली।')}</p>{/each}
      </section>
    {:else}
      <p class="empty prompt-empty">{text('Select a village and name to view that person’s documents.','व्यक्ति के दस्तावेज़ देखने के लिए गाँव और नाम चुनें।')}</p>
    {/if}
  {/if}
  <a class="back-link" href="/">{text('← Back to home','← होम पर वापस')}</a>
</main><BottomNav />
<style>
  .picker-card{display:grid;gap:.55rem;padding:1rem;margin:1.2rem 0;border:1px solid var(--border,#e5e7eb);border-radius:1rem;background:var(--card,#fff);color:var(--text,#1f2937)}
  .field-label{font-size:.85rem;font-weight:700;margin-top:.25rem}
  .full-select{width:100%;min-height:46px;padding:.7rem .8rem;border:1px solid var(--border,#d1d5db);border-radius:.7rem;background:var(--card,#fff);color:var(--text,#1f2937);font:inherit}
  .full-select:disabled{opacity:.65}
  .search-results{display:grid;gap:.25rem;max-height:18rem;overflow:auto;margin-top:.25rem}\n  .person-option{display:flex;align-items:center;justify-content:space-between;gap:1rem;width:100%;padding:.75rem;border:1px solid var(--border,#e5e7eb);border-radius:.65rem;background:var(--card,#fff);color:var(--text,#1f2937);text-align:left;font:inherit}\n  .person-option:active{transform:scale(.99)}\n  .selected-person{margin:.4rem 0 0;font-size:.9rem;color:var(--muted,#68736e)}
  .unavailable-head{margin-top:1.5rem}
  .unavailable-record{opacity:.82}
  .status-muted{font-size:.8rem;font-weight:700;color:var(--muted,#68736e);white-space:nowrap}
  .prompt-empty{margin-top:1rem}
</style>