<script lang="ts">
  import { onMount } from 'svelte';
  import { loadPortalData, portalData } from '$lib/stores/portal';
  type Row=Record<string,unknown>;
  let open=false;let data:Record<string,unknown>={};
  const value=(r:Record<string,unknown>|undefined,...keys:string[])=>{if(!r)return '';for(const k of keys){if(r[k]!=null&&String(r[k]).trim())return String(r[k]).trim();const n=k.trim().toLowerCase();const actual=Object.keys(r).find(x=>x.trim().toLowerCase()===n);if(actual&&r[actual]!=null&&String(r[actual]).trim())return String(r[actual]).trim();}return '';};
  $: d=(data.donation||{}) as Record<string,unknown>;
  $: upi=value(d,'upiId','UPI ID','upi_id');
  $: qr=value(d,'qrUrl','QR URL','qr_url');
  const unsub=portalData.subscribe(v=>data=v as Record<string,unknown>);
  onMount(()=>{void loadPortalData().catch(()=>{});return unsub;});
  function onKey(e:KeyboardEvent){if(e.key==='Escape')open=false;}
</script>
<button class="donate-quick" type="button" onclick={()=>{open=true;}} aria-haspopup="dialog">♡ Donate Now</button>
<svelte:window onkeydown={onKey}/>
{#if open}
<div class="donate-backdrop" role="presentation" onclick={e=>{if(e.target===e.currentTarget)open=false;}}>
<section class="donate-modal" role="dialog" aria-modal="true" aria-labelledby="donate-popup-title">
<header><div><p>COMMUNITY SUPPORT</p><h2 id="donate-popup-title">Donate Now</h2></div><button aria-label="Close donation popup" onclick={()=>open=false}>×</button></header>
<p>Your contribution supports Chhath Puja arrangements and community service.</p>
{#if upi}<div class="upi"><small>UPI ID</small><strong>{upi}</strong><button onclick={()=>{if(typeof navigator!=='undefined')void navigator.clipboard?.writeText(upi);}}>Copy UPI</button></div>{/if}
{#if qr}<img class="qr" src={qr} alt="Donation payment QR code"/>{/if}
{#if !upi&&!qr}<p class="muted">Online payment details are not published in the current public data. Please confirm details with the committee before sending money.</p>{/if}
<a class="full" href="/donate/" onclick={()=>open=false}>View all donation methods ↗</a>
<p class="safety">Please verify the recipient and payment details before transferring money.</p>
</section></div>
{/if}
<style>
.donate-quick{border:0;border-radius:.8rem;padding:.8rem 1rem;background:#f27a1a;color:white;font-weight:800;cursor:pointer}.donate-backdrop{position:fixed;inset:0;z-index:1000;display:grid;place-items:end center;padding:1rem;background:rgba(5,10,18,.62);backdrop-filter:blur(5px)}.donate-modal{width:min(100%,520px);max-height:85vh;overflow:auto;background:#fffaf5;color:#1f2937;border-radius:1.5rem;padding:1.25rem;box-shadow:0 20px 70px #0004}.donate-modal header{display:flex;justify-content:space-between;align-items:center;gap:1rem}.donate-modal header p{font-size:.7rem;letter-spacing:.15em;font-weight:800;color:#c65b08}.donate-modal h2{font-size:1.5rem;font-weight:900}.donate-modal header button{width:2.5rem;height:2.5rem;border-radius:50%;background:#f2e9e2;font-size:1.5rem}.donate-modal>p{margin:.8rem 0}.upi{display:grid;gap:.4rem;background:white;border:1px solid #eee0d5;padding:.9rem;border-radius:.9rem;overflow-wrap:anywhere}.upi small,.muted,.safety{color:#6b7280;font-size:.85rem}.upi button,.full{display:block;text-align:center;background:#f27a1a;color:white;border-radius:.7rem;padding:.7rem;font-weight:800}.qr{width:min(100%,240px);aspect-ratio:1;object-fit:contain;margin:1rem auto;background:white;padding:.5rem;border-radius:.8rem}.full{margin-top:1rem}.safety{font-size:.75rem}
</style>
