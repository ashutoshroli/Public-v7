<script lang="ts">
  import { portalLanguage, togglePortalLanguage, initPortalLanguage } from '$lib/stores/language';
  let language: 'en' | 'hi' = 'en';
  const unsubLang = portalLanguage.subscribe(v => language = v);
  import { onMount } from 'svelte';
  import BottomNav from '$lib/components/BottomNav.svelte';
  import { loadPortalData, portalData, portalLoading } from '$lib/stores/portal';
  type Row=Record<string,unknown>;
  let data:Record<string,unknown>={};let loading=true;
  const params=typeof window!=='undefined'?new URLSearchParams(window.location.search):new URLSearchParams();
  const recordId=params.get('record')||params.get('id')||'';
  const value=(r:Row|undefined,...keys:string[])=>{if(!r)return '';for(const k of keys){if(r[k]!=null&&String(r[k]).trim())return String(r[k]).trim();const n=k.trim().toLowerCase().replace(/\s+/g,' ');const actual=Object.keys(r).find(x=>x.trim().toLowerCase().replace(/\s+/g,' ')===n);if(actual&&r[actual]!=null&&String(r[actual]).trim())return String(r[actual]).trim();}return '';};
  $: files=(data.generatedFiles||data.generated_files||[]) as Row[];
  $: collections=(data.collections||[]) as Row[];
  $: users=(data.users||[]) as Row[];
  $: file=files.find(f=>value(f,'record_id','recordId')===recordId);
  $: year=value(file,'year','Year');$: type=value(file,'doc_type','type');
  $: parts=recordId.split('-');$: rowIndex=parts.length>=3?parts.slice(2).join('-'):'';
  $: collection=collections.find((r,i)=>value(r,'Year')===year&&(value(r,'__rowIndex')===rowIndex||String(i)===rowIndex));
  $: personId=value(collection,'ID','Name');$: user=users.find(u=>value(u,'ID')===personId);
  $: name=language === 'hi' ? (value(user,'Name (Hindi)','Name')||value(collection,'Name (Hindi)','Name')||'') : (value(user,'Name')||value(collection,'Name')||value(user,'Name (Hindi)')||'');
  $: amount=value(collection,'Amount');$: detail=value(collection,'Detail');$: village=language === 'hi' ? value(user,'Village (Hindi)','Village') : value(user,'Village','Village (Hindi)');
  const u=portalData.subscribe(v=>data=v as Record<string,unknown>);
  const l=portalLoading.subscribe(v=>loading=v);
  onMount(()=>{initPortalLanguage();void loadPortalData();return()=>{u();l();unsubLang();};});
</script>
<svelte:head><title>{language === 'hi' ? 'दस्तावेज़ सत्यापन — छठ पूजा' : 'Document verification — Chhath Puja'}</title><meta name="description" content="Verify a public Chhath Puja portal document."/></svelte:head>
<header class="topbar"><a class="brand" href="/"><span class="sun">☼</span><span><strong>Chhath Puja</strong><small>{language === 'hi' ? 'पारदर्शिता पोर्टल' : 'Transparency Portal'}</small></span></a><div class="header-actions"><button class="language" type="button" onclick={togglePortalLanguage}>{language === 'hi' ? 'English' : 'हिंदी'}</button><a class="language" href="/">{language === 'hi' ? '← होम' : '{language === 'hi' ? '← होम' : '← Home'}'}</a></div></header>
<main class="page"><p class="eyebrow">PUBLIC RECORDS</p><h1>{language === 'hi' ? 'दस्तावेज़ सत्यापन' : 'Document verification'}<span>.</span></h1><p class="lede">{language === 'hi' ? 'रसीद या सार्वजनिक दस्तावेज़ को पोर्टल की प्रकाशित फ़ाइल सूची से मिलाएँ।' : 'Check a receipt or public document against the portal\'s published generated-file index.'}</p>
<section class="records verification" aria-live="polite">
{#if loading}<p>{language === 'hi' ? 'सार्वजनिक रिकॉर्ड जाँचा जा रहा है…' : 'Checking the public record…'}</p>{:else if !recordId}<h2>{language === 'hi' ? 'रिकॉर्ड ID नहीं दी गई' : 'No record ID provided'}</h2><p>{language === 'hi' ? 'सत्यापन लिंक खोलें या दस्तावेज़ पर छपा QR कोड स्कैन करें।' : 'Open the verification link or scan the QR code printed on the document.'}</p>{:else if !file}<h2 class="verdict">{language === 'hi' ? 'रिकॉर्ड नहीं मिला' : 'Record not found'}</h2><p>{language === 'hi' ? 'वर्तमान सार्वजनिक सूची में कोई मिलता दस्तावेज़ नहीं है। इससे यह सिद्ध नहीं होता कि दस्तावेज़ जाली है; पुष्टि के लिए समिति से संपर्क करें।' : 'No matching document is present in the current public index. This does not prove that a document is fraudulent; contact the committee to confirm.'}</p><p class="record-id">{language === 'hi' ? 'संदर्भ' : 'Reference'}: {recordId}</p>{:else}<p class="eyebrow">{language === 'hi' ? 'सार्वजनिक सूची में मिला' : 'PUBLIC INDEX MATCH'}</p><h2 class="verdict">{language === 'hi' ? 'रिकॉर्ड मिल गया' : 'Record found'}</h2><dl><dt>{language === 'hi' ? 'दस्तावेज़ प्रकार' : 'Document type'}</dt><dd>{type||(language === 'hi' ? 'सार्वजनिक दस्तावेज़' : 'Public document')}</dd><dt>{language === 'hi' ? 'वर्ष' : 'Year'}</dt><dd>{year||'—'}</dd>{#if name}<dt>{language === 'hi' ? 'नाम' : 'Name'}</dt><dd>{name}</dd>{/if}{#if village}<dt>{language === 'hi' ? 'गाँव' : 'Village'}</dt><dd>{village}</dd>{/if}{#if amount}<dt>{language === 'hi' ? 'दर्ज राशि' : 'Recorded amount'}</dt><dd>{amount}</dd>{/if}{#if detail}<dt>{language === 'hi' ? 'विवरण' : 'Details'}</dt><dd>{detail}</dd>{/if}</dl><p class="record-id">{language === 'hi' ? 'संदर्भ' : 'Reference'}: {recordId}</p>{/if}
</section><a class="back-link" href="/">{language === 'hi' ? '← होम पर वापस' : '← Back to home'}</a></main><BottomNav/>
<style>.verification{padding:1.4rem;margin-top:1.2rem}.verification h2{font-size:1.35rem;font-weight:800}.verdict{color:#075d48}.verification dl{display:grid;grid-template-columns:minmax(110px,auto) 1fr;gap:.7rem}.verification dt{color:var(--muted);font-size:.9rem}.verification dd{margin:0;font-weight:700;overflow-wrap:anywhere}.record-id{font-size:.8rem;color:var(--muted);overflow-wrap:anywhere}</style>
