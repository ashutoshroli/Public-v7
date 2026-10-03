<script lang="ts">
  import { onMount } from 'svelte';
  import { portalState, refreshPortal } from '$lib/stores/portal';
  import { tr } from '$lib/stores/lang';
  let offline = $state(false);
  let refreshing = $state(false);
  onMount(() => {
    const sync = () => (offline = !navigator.onLine);
    sync();
    window.addEventListener('online', sync);
    window.addEventListener('offline', sync);
    return () => { window.removeEventListener('online', sync); window.removeEventListener('offline', sync); };
  });
  async function retry() {
    if (refreshing) return;
    refreshing = true;
    try { await refreshPortal(); } finally { refreshing = false; }
  }
  const show = $derived(offline || $portalState.stale || $portalState.failed);
  const text = $derived(offline ? $tr('offline_notice') : $portalState.failed ? 'Live public data is unavailable right now.' : $tr('stale_notice'));
</script>
{#if show}
  <div class="status-banner" role="status">
    <span class="status-banner-dot" aria-hidden="true"></span><span class="status-banner-text">{text}</span>
    {#if $portalState.savedAt > 0}<span class="status-banner-time">· Last network fetch {new Date($portalState.savedAt).toLocaleString()}</span>{/if}
    <button type="button" onclick={retry} disabled={refreshing}>{refreshing ? 'Refreshing…' : 'Refresh'}</button>
  </div>
{/if}
