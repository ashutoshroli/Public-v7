<script lang="ts">
  import './app.css';
  import { onMount } from 'svelte';
  import { listenForSubscriptionChange } from '$lib/push';
  import LanguageToggle from '$lib/components/LanguageToggle.svelte';
  let { children } = $props();
  onMount(() => {
    let stopPushListener = () => {};
    import('virtual:pwa-register').then(({ registerSW }) => { registerSW({ immediate: true }); }).catch(() => {});
    stopPushListener = listenForSubscriptionChange();
    return () => stopPushListener();
  });
</script>

<LanguageToggle />

{@render children()}