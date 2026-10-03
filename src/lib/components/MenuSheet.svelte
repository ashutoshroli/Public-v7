<script lang="ts">
  import { page } from '$app/stores';
  let open = false;
  let showNotifications = false;
  let installHint = '';
  type InstallPrompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{outcome:string}> };
  let installPrompt: InstallPrompt | null = null;
  const items = [
    { href: '/decade/', label: 'Our Journey', detail: '2017–2026 community history', icon: '◷' },
    { href: '/downloads/', label: 'Downloads', detail: 'Public records and documents', icon: '⇩' },
    { href: '/guide/', label: 'User Guide', detail: 'Portal help and app installation', icon: 'ⓘ' },
    { href: '/committee/', label: 'Committee', detail: 'Committee information', icon: '♙' }
  ];
  $: activePath = $page.url.pathname;
  import { onMount } from 'svelte';
  onMount(() => {
    const handler = (event: Event) => { event.preventDefault(); installPrompt = event as InstallPrompt; };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  });
  async function installApp() {
    if (!installPrompt) {
      installHint = 'Open your browser menu and choose “Install app” or “Add to Home screen”.';
      return;
    }
    await installPrompt.prompt();
    const result = await installPrompt.userChoice;
    installHint = result.outcome === 'accepted' ? 'Install request accepted.' : 'You can install the app later from your browser menu.';
    installPrompt = null;
  }
</script>
<button class="menu-trigger" type="button" aria-expanded={open} aria-haspopup="dialog" onclick={() => {open = true; showNotifications = false;}}><span class="nav-icon">☰</span><span>Menu</span></button>
{#if open}
  <div class="menu-overlay" role="presentation" onclick={(e) => { if (e.target === e.currentTarget) open = false; }}>
    <section class="menu-sheet" role="dialog" aria-modal="true" aria-label="Menu">
      <div class="menu-grabber"></div>
      <header class="menu-sheet-head"><div><p class="eyebrow">CHHATH PUJA PORTAL</p><h2>{showNotifications ? 'Notifications' : 'Menu'}</h2></div><button class="menu-close" type="button" aria-label="Close menu" onclick={() => {open = false; showNotifications = false;}}>×</button></header>
      {#if showNotifications}
        <div class="menu-notice"><span class="menu-big-icon">♧</span><strong>Notifications</strong><p>Portal announcements will appear here when the notification service is connected.</p><a href="/guide/#notifications" onclick={() => open = false}>Notification setup guide ↗</a><button class="menu-secondary" onclick={() => showNotifications = false}>← Back to menu</button></div>
      {:else}
        <div class="menu-tools">
          <button class="menu-install" type="button" onclick={installApp}><span class="tool-icon">⇩</span><span><strong>Install app</strong><small>Add to your home screen</small></span></button>
          <button class="menu-notifications" type="button" onclick={() => showNotifications = true}><span class="tool-icon">♧</span><strong>Notifications</strong></button>
        </div>
        {#if installHint}<p class="menu-hint" role="status">{installHint}</p>{/if}
        <nav class="menu-items" aria-label="More pages">{#each items as item}<a class:menu-item-active={activePath.startsWith(item.href)} href={item.href} onclick={() => open = false}><span class="menu-item-icon">{item.icon}</span><span class="menu-item-copy"><strong>{item.label}</strong><small>{item.detail}</small></span><span class="menu-chevron">›</span></a>{/each}</nav>
      {/if}
      <p class="menu-foot">Faith · Unity · Transparency</p>
    </section>
  </div>
{/if}
