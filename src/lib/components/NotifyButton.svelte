<script lang="ts">
  import { onMount } from 'svelte';
  import { pushSupported, pushState, subscribe, unsubscribe, type PushState } from '$lib/push';
  let status: PushState = 'unsupported';
  let busy = false;
  let ready = false;
  onMount(async () => { status = await pushState(); ready = true; });
  async function turnOn() { if(busy)return; busy=true; try{status=await subscribe();}finally{busy=false;} }
  async function turnOff() { if(busy)return; busy=true; try{status=await unsubscribe();}finally{busy=false;} }
</script>
{#if ready && status !== 'unsupported'}
  {#if status === 'subscribed'}
    <div class="push-status" role="status"><span>🔔 Notifications enabled on this device</span><button type="button" disabled={busy} onclick={turnOff}>Turn off</button></div>
  {:else if status === 'denied'}
    <p class="push-help" role="status">Notifications are blocked in browser settings. Enable them there to subscribe.</p>
  {:else}
    <button class="push-enable" type="button" disabled={busy} onclick={turnOn}>{busy ? 'Please wait…' : 'Enable push notifications'}</button>
    <p class="push-help">You’ll receive community updates when notifications are sent. Permission is requested only after you tap the button.</p>
  {/if}
{/if}
<style>
.push-enable{width:100%;padding:.75rem 1rem;border-radius:.75rem;background:#f27a1a;color:white;font-weight:700;margin:.5rem 0}
.push-status{display:flex;justify-content:space-between;align-items:center;gap:.75rem;padding:.75rem;border-radius:.75rem;background:rgba(34,197,94,.1);font-size:.85rem}
.push-status button{font-weight:700;text-decoration:underline}
.push-help{font-size:.8rem;opacity:.75;margin:.5rem 0}
</style>
