<script lang="ts">
  import { page } from '$app/stores';
  let open = false;
  let showNotifications = false;
  let installHint = '';
  type InstallPrompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{outcome:string}> };
  let installPrompt: InstallPrompt | null = null;
  const items = [
    { href: '/downloads/', label: 'Downloads', detail: 'Public records and documents', icon: '⇩' },
    { href: '/committee/', label: 'Committee', detail: 'Committee information', icon: '♙' },
    { href: '/donate/', label: 'Donate Now', detail: 'Support community Chhath Puja', icon: '♡' },
    { href: '/guide/', label: 'User Guide', detail: 'Portal help and app installation', icon: 'ⓘ' },
  ];
  $: activePath = $page.url.pathname;
  let lastPath = activePath;
  import { onMount } from 'svelte';
  import { inbox, unreadCount, refreshInbox, markAllRead, clearAll, initInbox } from '$lib/stores/notifications';
  import NotifyButton from '$lib/components/NotifyButton.svelte';
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
        <div class="menu-notice"><div class="notification-toolbar"><strong>Inbox · {$inbox.length}</strong><span></span><button class="menu-secondary" disabled={$unreadCount === 0} onclick={markAllRead}>Mark all read ({$unreadCount})</button><button class="menu-secondary" disabled={$inbox.length === 0} onclick={clearAll}>Clear all</button></div>{#if $inbox.length}<div class="notification-list">{#each $inbox as note (note.id)}<article class:notification-unread={!note.read} class="notification-item"><strong>{note.title}</strong>{#if note.body}<p>{note.body}</p>{/if}<small>{new Date(note.receivedAt).toLocaleString()}</small><a href={note.url.startsWith('/') ? note.url : '/'} onclick={() => { open = false; }}>Open ↗</a></article>{/each}</div>{:else}<span class="menu-big-icon">♧</span><strong>No notifications yet</strong><p>Notifications received and saved on this device will appear here.</p>{/if}<div class="push-optin"><NotifyButton /></div><button class="menu-secondary" onclick={() => showNotifications = false}>← Back to menu</button></div>
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

<style>
  .notification-toolbar { display:flex; align-items:center; flex-wrap:wrap; gap:.5rem; margin-bottom:.75rem; }
  .notification-toolbar strong { flex:1 1 100%; }
  .notification-list { display:grid; gap:.6rem; max-height:42vh; overflow:auto; margin:.5rem 0 1rem; text-align:left; }
  .notification-item { display:grid; gap:.3rem; padding:.8rem; border:1px solid var(--border, #e5e7eb); border-radius:.8rem; background:var(--card, #fff); color:var(--text, #1f2937); }
  .notification-item.notification-unread { border-color:#f27a1a; background:rgba(242,122,26,.07); }
  .notification-item p { margin:0; font-size:.9rem; }
  .notification-item small { opacity:.7; font-size:.75rem; }
  .notification-item a { justify-self:start; font-weight:700; color:#c65b08; }
  .notification-badge { display:inline-grid; place-items:center; min-width:1.25rem; height:1.25rem; padding:0 .25rem; border-radius:999px; background:#c65b08; color:white; font-size:.75rem; }
  .menu-secondary:disabled { opacity:.45; cursor:not-allowed; }
</style>
