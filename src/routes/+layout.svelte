<script lang="ts">
  import './app.css';
  import { onMount } from 'svelte';
  import { listenForSubscriptionChange } from '$lib/push';
  import { initPortalLanguage } from '$lib/stores/language';
  let { children } = $props();
  onMount(() => {
    initPortalLanguage();
    let stopPushListener = () => {};
    import('virtual:pwa-register').then(({ registerSW }) => { registerSW({ immediate: true }); }).catch(() => {});
    stopPushListener = listenForSubscriptionChange();
    return () => stopPushListener();
  });
</script>

{@render children()}