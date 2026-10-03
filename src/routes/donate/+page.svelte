<script lang="ts">
  import { portalLanguage, togglePortalLanguage, initPortalLanguage } from '$lib/stores/language';
  let language: 'en' | 'hi' = 'en';
  const unsubLang = portalLanguage.subscribe(v => language = v);
  import { onMount } from 'svelte';
  import BottomNav from '$lib/components/BottomNav.svelte';
  import { loadPortalData, portalData, portalLoading, portalError } from '$lib/stores/portal';
  type Row=Record<string,unknown>;
  type Data={donation?:Record<string,unknown>;committee?:Row[];users?:Row[]};
  let data:Data={}; let loading=true; let error='';
  const value=(r:Record<string,unknown>|undefined,...keys:string[])=>{if(!r)return '';for(const key of keys){const direct=r[key];if(direct!==undefined&&direct!==null&&String(direct).trim())return String(direct).trim();const norm=key.trim().toLowerCase().replace(/\s+/g,' ');const actual=Object.keys(r).find(k=>k.trim().toLowerCase().replace(/\s+/g,' ')===norm);if(actual&&r[actual]!=null&&String(r[actual]).trim())return String(r[actual]).trim();}return '';};
  $: d=data.donation||{};
  $: details={upiId:value(d,'upiId','UPI ID','upi_id'),qrUrl:value(d,'qrUrl','QR URL','qr_url'),bankAccountName:value(d,'bankAccountName','Account Name','bank_account_name'),bankName:value(d,'bankName','Bank Name','bank_name'),accountNumber:value(d,'accountNumber','Account Number','account_number'),ifsc:value(d,'ifsc','IFSC'),whatsapp:value(d,'whatsapp','WhatsApp','whatsapp_number')};
  $: userMap=new Map((data.users||[]).map(u=>[value(u,'ID'),u]).filter(([id])=>!!id) as [string,Row][]);
  $: years=[...new Set((data.committee||[]).map(r=>value(r,'Year')).filter(y=>/^20\d{2}$/.test(y)))].sort((a,b)=>Number(b)-Number(a));
  $: liveYear=years.includes(String(new Date().getFullYear()))?String(new Date().getFullYear()):years[0];
  $: members=(data.committee||[]).filter(r=>value(r,'Year')===liveYear).map(r=>{const id=value(r,'ID','Name'),u=userMap.get(id);return {id,name:language === 'hi' ? (value(u,'Name (Hindi)','Name')||value(r,'Name (Hindi)','Name')||id) : (value(u,'Name')||value(r,'Name')||id),village:language === 'hi' ? value(u,'Village (Hindi)','Village') : value(u,'Village','Village (Hindi)'),mobile:value(u,'Mobile'),role:value(r,'View Role','Role')||value(u,'Designation')}}).filter(m=>m.name);
  $: hasAny=Object.values(details).some(Boolean)||members.length>0;
  const unsubData=portalData.subscribe(v=>data=v as Data);
  const unsubLoad=portalLoading.subscribe(v=>loading=v);
  const unsubError=portalError.subscribe(v=>error=v);
  onMount(()=>{initPortalLanguage();void loadPortalData().catch(()=>{});return()=>{unsubData();unsubLoad();unsubError();unsubLang();};});
</script>
<svelte:head><title>{language === 'hi' ? 'योगदान दें — छठ पूजा' : 'Donate Now — Chhath Puja'}</title><meta name="description" content="Support Navyuvak Chhath Puja Samiti, Shaharpura, Gardih."/></svelte:head>
<header class="topbar"><a class="brand" href="/"><span class="sun">☼</span><span><strong>Chhath Puja</strong><small>{language === 'hi' ? 'पारदर्शिता पोर्टल' : 'Transparency Portal'}</small></span></a><div class="header-actions"><button class="language" type="button" onclick={togglePortalLanguage}>{language === 'hi' ? 'English' : 'हिंदी'}</button><a class="language" href="/">{language === 'hi' ? '← होम' : '← Home'}</a></div></header>
<main class="page">
<p class="eyebrow">COMMUNITY SUPPORT</p><h1>{language === 'hi' ? 'योगदान दें' : 'Donate Now'}<span>.</span></h1><p class="lede">{language === 'hi' ? 'आपका योगदान छठ पूजा की व्यवस्था और सामुदायिक सेवा में सहयोग करता है। पैसे भेजने से पहले भुगतान विवरण की पुष्टि करें।' : 'Your contribution supports Chhath Puja arrangements and community service. Please verify payment details before sending money.'}</p>
{#if loading}<p class="notice">{language === 'hi' ? 'सत्यापित योगदान जानकारी लोड हो रही है…' : 'Loading verified donation information…'}</p>{:else if error}<p class="notice" role="status">{error}</p>{/if}
<section class="journey"><div><p class="eyebrow">NAVYUVAK CHHATH PUJA SAMITI</p><h2>Faith · Unity · Transparency</h2><p>Choose an available payment method below. Only details published in the portal data are shown.</p></div></section>
{#if details.upiId || details.qrUrl}
<section class="donate-card"><h2>{language === 'hi' ? 'UPI / ऑनलाइन भुगतान' : 'UPI / Online payment'}</h2>{#if details.upiId}<p><span>UPI ID</span><strong class="select-all">{details.upiId}</strong><button class="copy" onclick={() => {if(typeof navigator!=='undefined')void navigator.clipboard?.writeText(details.upiId);}}>{language === 'hi' ? 'UPI ID कॉपी करें' : 'Copy UPI ID'}</button></p>{/if}{#if details.qrUrl}<img class="qr" src={details.qrUrl} alt="Donation payment QR code" />{/if}{#if details.whatsapp}<p>{language === 'hi' ? 'भुगतान संबंधी प्रश्न: ' : 'Payment query: '}<a href={'https://wa.me/'+details.whatsapp.replace(/[^0-9]/g,'')} target="_blank" rel="noopener">{details.whatsapp}</a></p>{/if}</section>
{/if}
{#if details.bankAccountName || details.bankName || details.accountNumber || details.ifsc}
<section class="donate-card"><h2>{language === 'hi' ? 'बैंक ट्रांसफर' : 'Bank transfer'}</h2><dl>{#if details.bankAccountName}<dt>{language === 'hi' ? 'खाताधारक का नाम' : 'Account name'}</dt><dd>{details.bankAccountName}</dd>{/if}{#if details.bankName}<dt>{language === 'hi' ? 'बैंक' : 'Bank'}</dt><dd>{details.bankName}</dd>{/if}{#if details.accountNumber}<dt>{language === 'hi' ? 'खाता संख्या' : 'Account number'}</dt><dd class="select-all">{details.accountNumber}</dd>{/if}{#if details.ifsc}<dt>IFSC</dt><dd class="select-all">{details.ifsc}</dd>{/if}</dl></section>
{/if}
{#if members.length}
<section class="donate-card"><h2>{language === 'hi' ? 'समिति के माध्यम से नकद योगदान' : 'Cash donation through committee'}</h2><p>{language === 'hi' ? 'नकद योगदान के लिए वर्तमान समिति सदस्य से संपर्क कर सकते हैं।' : 'You may contact a current committee member to coordinate cash donations.'}</p>{#each members as m}<div class="member"><span><strong>{m.name}</strong><small>{m.role}{m.village?' · '+m.village:''}</small></span>{#if m.mobile}<a href={'tel:'+m.mobile}>{m.mobile}</a>{/if}</div>{/each}</section>
{/if}
{#if !loading&&!hasAny}<section class="donate-card"><h2>{language === 'hi' ? 'योगदान विवरण उपलब्ध नहीं' : 'Donation details unavailable'}</h2><p>Online payment details have not been published in the public portal data yet. Please contact the committee through its official channels before sending money.</p></section>{/if}
<p class="notice">For your safety, confirm the recipient name and payment details before making a transfer. This portal does not process or confirm payments.</p>
<a class="back-link" href="/">{language === 'hi' ? '← होम पर वापस' : '← Back to home'}</a>
</main><BottomNav/>
<style>
.donate-card{margin:1rem 0;padding:1.25rem;border:1px solid var(--line,#e5e7eb);border-radius:1.2rem;background:var(--card,#fff);display:grid;gap:.85rem}.donate-card h2{font-size:1.15rem;font-weight:800}.donate-card p{display:flex;gap:.75rem;flex-wrap:wrap;align-items:center}.donate-card p span,.donate-card dt{color:#6b7280;font-size:.85rem}.donate-card p strong,.donate-card dd{font-weight:750;overflow-wrap:anywhere}.donate-card dl{display:grid;grid-template-columns:minmax(100px,auto) 1fr;gap:.65rem}.qr{width:min(100%,260px);aspect-ratio:1;object-fit:contain;background:white;padding:.5rem;border-radius:.8rem}.copy{padding:.45rem .7rem;border-radius:.6rem;background:#f27a1a;color:white;font-weight:700}.member{display:flex;justify-content:space-between;gap:1rem;padding:.7rem 0;border-top:1px solid #e5e7eb}.member span{display:grid;gap:.2rem}.member small{color:#6b7280}.member a{white-space:nowrap;color:#c65b08;font-weight:700}
</style>
