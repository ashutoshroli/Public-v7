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
  let lastPath = activePath;
  import { onMount } from 'svelte';
  import { inbox, unreadCount, refreshInbox, markAllRead, clearAll, initInbox } from '$lib/stores/notifications';
  $: if (activePath !== lastPath) {
    lastPath = activePath;
    open = false;
    showNotifications = false;
  }
  $: if (typeof document !== 'undefined') document.body.style.overflow = open ? 'hidden' : '';
  onMount(() => {
    const stopInbox = initInbox();
    const handler = (event: Event) => { event.preventDefault(); installPrompt = event as InstallPrompt; };
    const keyHandler = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) { open = false; showNotifications = false; }
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('keydown', keyHandler);
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('keydown', keyHandler);
      document.body.style.overflow = '';
      stopInbox();
    };
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
        <div class="menu-notice"><div class="notification-toolbar"><strong>Inbox · {$inbox.length}</strong><span></span><button class="menu-secondary" disabled={$unreadCount === 0} onclick={markAllRead}>Mark all read ({$unreadCount})</button><button class="menu-secondary" disabled={$inbox.length === 0} onclick={clearAll}>Clear all</button></div>{#if $inbox.length}<div class="notification-list">{#each $inbox as note (note.id)}<article class:notification-unread={!note.read} class="notification-item"><strong>{note.title}</strong>{#if note.body}<p>{note.body}</p>{/if}<small>{new Date(note.receivedAt).toLocaleString()}</small><a href={note.url.startsWith('/') ? note.url : '/'} onclick={() => { open = false; }}>Open ↗</a></article>{/each}</div>{:else}<span class="menu-big-icon">♧</span><strong>No notifications yet</strong><p>Notifications received and saved on this device will appear here.</p>{/if}<button class="menu-secondary" onclick={() => showNotifications = false}>← Back to menu</button></div>
      {:else}
        <div class="menu-tools">
          <button class="menu-install" type="button" onclick={installApp}><span class="tool-icon">⇩</span><span><strong>Install app</strong><small>Add to your home screen</small></span></button>
          <button class="menu-notifications" type="button" onclick={() => { refreshInbox(); showNotifications = true; }}><span class="tool-icon">♧</span><strong>Notifications</strong>{#if $unreadCount}<span class="notification-badge">{$unreadCount}</span>{/if}</button>
        </div>
        {#if installHint}<p class="menu-hint" role="status">{installHint}</p>{/if}
        <nav class="menu-items" aria-label="More pages">{#each items as item}<a class:menu-item-active={activePath.startsWith(item.href)} href={item.href} onclick={() => open = false}><span class="menu-item-icon">{item.icon}</span><span class="menu-item-copy"><strong>{item.label}</strong><small>{item.detail}</small></span><span class="menu-chevron">›</span></a>{/each}</nav>
      {/if}
      <p class="menu-foot">Faith · Unity · Transparency</p>
    </section>
  </div>
{/if}
