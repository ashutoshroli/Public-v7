<script lang="ts">
  import './app.css';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { goto, afterNavigate } from '$app/navigation';
  import { initPortal } from '$lib/stores/portal';
  import { startSync } from '$lib/sync';
  import { listenForSubscriptionChange } from '$lib/push';
  import { initInbox } from '$lib/stores/notifications';
  import { pushPageView } from '$lib/analytics/pageview';
  import SiteHeader from '$lib/components/SiteHeader.svelte';
  import Seo from '$lib/components/Seo.svelte';
  import StatusBanner from '$lib/components/StatusBanner.svelte';

  let { children } = $props();

  afterNavigate(() => {
    if (browser) pushPageView($page.url.pathname + $page.url.search, document.title);
  });

  $effect(() => {
    if (!browser) return;
    const record = $page.url.searchParams.get('record');
    if (record && $page.url.pathname !== '/verify') {
      void goto('/verify/?record=' + encodeURIComponent(record), { replaceState: true });
    }
  });

  onMount(() => {
    void initPortal();
    import('virtual:pwa-register').then(({ registerSW }) => registerSW({ immediate: true })).catch(() => {});
    const stopSync = startSync();
    const stopPush = listenForSubscriptionChange();
    const stopInbox = initInbox();
    return () => { stopSync(); stopPush(); stopInbox(); };
  });
</script>

<Seo />
<SiteHeader showYear={$page.url.pathname === '/'} />
<StatusBanner />
{@render children()}
