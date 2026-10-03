<script lang="ts">
  import './app.css';
  import { onMount } from 'svelte';
  import { listenForSubscriptionChange } from '$lib/push';
  let { children } = $props();
  onMount(() => {
    let stopPushListener = () => {};
    import('virtual:pwa-register').then(({ registerSW }) => { registerSW({ immediate: true }); }).catch(() => {});
    stopPushListener = listenForSubscriptionChange();
    return () => stopPushListener();
  });
</script>

{@render children()}