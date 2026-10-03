<script lang="ts">
  import './app.css';
  import { onMount } from 'svelte';
  import { listenForSubscriptionChange } from '$lib/push';
  import { initPortalLanguage } from '$lib/stores/language';
  import { lang } from '$lib/stores/lang';
  let { children } = $props();
  onMount(() => {
    initPortalLanguage();
    const stopLang = lang.subscribe(value => document.documentElement.setAttribute('lang', value));
    let stopPushListener = () => {};
    import('virtual:pwa-register').then(({ registerSW }) => { registerSW({ immediate: true }); }).catch(() => {});
    stopPushListener = listenForSubscriptionChange();
    return () => { stopPushListener(); stopLang(); };
  });
</script>

{@render children()}