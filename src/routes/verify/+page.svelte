<script lang="ts">
  import { onMount } from 'svelte';
  import BottomNav from '$lib/components/BottomNav.svelte';
  import { loadPortalData, portalData, portalLoading, portalError } from '$lib/stores/portal';
  type Row=Record<string,unknown>;
  let data:Record<string,unknown>={};let loading=true;let error='';
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
  $: name=value(user,'Name','Name (Hindi)')||value(collection,'Name','Name (Hindi)')||'';
  $: amount=value(collection,'Amount');$: detail=value(collection,'Detail');$: village=value(user,'Village','Village (Hindi)');
  const u=portalData.subscribe(v=>data=v as Record<string,unknown>);
  const l=portalLoading.subscribe(v=>loading=v);
  const e=portalError.subscribe(v=>error=String(v||''));
  onMount(()=>{void loadPortalData();return()=>{u();l();e();};});
</script>
<svelte:head><title>Document verification — Chhath Puja</title><meta name="description" content="Verify a public Chhath Puja portal document."/></svelte:head>

<main class="page"><p class="eyebrow">PUBLIC RECORDS</p><h1>Document verification<span>.</span></h1><p class="lede">Check a receipt or public document against the portal's published generated-file index.</p>
<section class="records verification" aria-live="polite">
{#if loading}<p>Checking the public record…</p>{:else if error}<h2>Unable to verify right now</h2><p>The public index could not be confirmed. Please check your connection and try again; this is not a verdict on the document.</p><p class="record-id">Reference: {recordId}</p>{:else if !recordId}<h2>No record ID provided</h2><p>Open the verification link or scan the QR code printed on the document.</p>{:else if !file}<h2 class="verdict">Record not found</h2><p>No matching document is present in the current public index. This does not prove that a document is fraudulent; contact the committee to confirm.</p><p class="record-id">Reference: {recordId}</p>{:else}<p class="eyebrow">PUBLIC INDEX MATCH</p><h2 class="verdict">Record found</h2><dl><dt>Document type</dt><dd>{type||'Public document'}</dd><dt>Year</dt><dd>{year||'—'}</dd>{#if name}<dt>Name</dt><dd>{name}</dd>{/if}{#if village}<dt>Village</dt><dd>{village}</dd>{/if}{#if amount}<dt>Recorded amount</dt><dd>{amount}</dd>{/if}{#if detail}<dt>Details</dt><dd>{detail}</dd>{/if}</dl><p class="record-id">Reference: {recordId}</p>{/if}
</section><a class="back-link" href="/">← Back to home</a></main><BottomNav/>
<style>.verification{padding:1.4rem;margin-top:1.2rem}.verification h2{font-size:1.35rem;font-weight:800}.verdict{color:#075d48}.verification dl{display:grid;grid-template-columns:minmax(110px,auto) 1fr;gap:.7rem}.verification dt{color:var(--muted);font-size:.9rem}.verification dd{margin:0;font-weight:700;overflow-wrap:anywhere}.record-id{font-size:.8rem;color:var(--muted);overflow-wrap:anywhere}</style>
