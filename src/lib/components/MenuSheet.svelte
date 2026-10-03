<script lang="ts">
  import { page } from '$app/stores';
  import { lang, tr } from '$lib/stores/lang';
  const text = (en: string, hi: string) => $lang === 'hi' ? hi : en;
  let open = false;
  let showNotifications = false;
  let installHint = '';
  type InstallPrompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{outcome:string}> };
  let installPrompt: InstallPrompt | null = null;
  const items = [
    { href: '/downloads/', en: 'Downloads', hi: 'डाउनलोड', detailEn: 'Public records and documents', detailHi: 'सार्वजनिक रिकॉर्ड और दस्तावेज़', icon: '⇩' },
    { href: '/committee/', en: 'Committee', hi: 'समिति', detailEn: 'Committee information', detailHi: 'समिति की जानकारी', icon: '♙' },
    { href: '/donate/', en: 'Donate Now', hi: 'योगदान दें', detailEn: 'Support community Chhath Puja', detailHi: 'समुदाय की छठ पूजा में सहयोग करें', icon: '♡' },
    { href: '/guide/', en: 'User Guide', hi: 'उपयोग गाइड', detailEn: 'Portal help and app installation', detailHi: 'पोर्टल सहायता और ऐप इंस्टॉल करना', icon: 'ⓘ' },
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
      installHint = text('Open your browser menu and choose “Install app” or “Add to Home screen”.','ब्राउज़र मेन्यू खोलें और “Install app” या “Add to Home screen” चुनें।');
      return;
    }
    await installPrompt.prompt();
    const result = await installPrompt.userChoice;
    installHint = result.outcome === 'accepted' ? text('Install request accepted.','ऐप इंस्टॉल करने का अनुरोध स्वीकार हुआ।') : text('You can install the app later from your browser menu.','आप बाद में ब्राउज़र मेन्यू से ऐप इंस्टॉल कर सकते हैं।');
    installPrompt = null;
  }
</script>
<button class="menu-trigger" type="button" aria-expanded={open} aria-haspopup="dialog" onclick={() => {open = true; showNotifications = false;}}><span class="nav-icon">☰</span><span>{text('Menu','मेन्यू')}</span></button>
{#if open}
  <div class="menu-overlay" role="presentation" onclick={(e) => { if (e.target === e.currentTarget) open = false; }}>
    <dialog open class="menu-sheet" aria-label={text("Menu","मेन्यू")}>
      <div class="menu-grabber"></div>
      <header class="menu-sheet-head"><div><p class="eyebrow">CHHATH PUJA PORTAL</p><h2>{showNotifications ? text('Notifications','सूचनाएँ') : text('Menu','मेन्यू')}</h2></div><button class="menu-close" type="button" aria-label="Close menu" onclick={() => {open = false; showNotifications = false;}}>×</button></header>
      {#if showNotifications}
        <div class="menu-notice"><div class="notification-toolbar"><strong>{text('Inbox','इनबॉक्स')} · {$inbox.length}</strong><span></span><button class="menu-secondary" disabled={$unreadCount === 0} onclick={markAllRead}>{text('Mark all read','सभी पढ़े हुए करें')} ({$unreadCount})</button><button class="menu-secondary" disabled={$inbox.length === 0} onclick={clearAll}>{text('Clear all','सभी हटाएँ')}</button></div>{#if $inbox.length}<div class="notification-list">{#each $inbox as note (note.id)}<article class:notification-unread={!note.read} class="notification-item"><strong>{note.title}</strong>{#if note.body}<p>{note.body}</p>{/if}<small>{new Date(note.receivedAt).toLocaleString()}</small><a href={note.url.startsWith('/') ? note.url : '/'} onclick={() => { open = false; }}>{text('Open ↗','खोलें ↗')}</a></article>{/each}</div>{:else}<span class="menu-big-icon">♧</span><strong>{text('No notifications yet','अभी कोई सूचना नहीं है')}</strong><p>{text('Notifications received and saved on this device will appear here.','इस डिवाइस पर प्राप्त और सहेजी गई सूचनाएँ यहाँ दिखाई देंगी।')}</p>{/if}<div class="push-optin"><NotifyButton /></div><button class="menu-secondary" onclick={() => showNotifications = false}>{text('← Back to menu','← मेन्यू पर वापस')}</button></div>
      {:else}
        <div class="menu-tools">
          <button class="menu-install" type="button" onclick={installApp}><span class="tool-icon">⇩</span><span><strong>{text('Install app','ऐप इंस्टॉल करें')}</strong><small>{text('Add to your home screen','होम स्क्रीन पर जोड़ें')}</small></span></button>
          <button class="menu-notifications" type="button" onclick={() => { refreshInbox(); showNotifications = true; }}><span class="tool-icon">♧</span><strong>{text('Notifications','सूचनाएँ')}</strong>{#if $unreadCount}<span class="notification-badge">{$unreadCount}</span>{/if}</button>
        </div>
        {#if installHint}<p class="menu-hint" role="status">{installHint}</p>{/if}
        <nav class="menu-items" aria-label={text("More pages","अन्य पेज")}>{#each items as item}<a class:menu-item-active={activePath.startsWith(item.href)} href={item.href} onclick={() => open = false}><span class="menu-item-icon">{item.icon}</span><span class="menu-item-copy"><strong>{text(item.en,item.hi)}</strong><small>{text(item.detailEn,item.detailHi)}</small></span><span class="menu-chevron">›</span></a>{/each}</nav>
      {/if}
      <nav class="menu-legal" aria-label={text("Legal pages","कानूनी पेज")}><a href="/terms/" onclick={() => open = false}>{text('Terms of use','उपयोग की शर्तें')}</a><a href="/privacy/" onclick={() => open = false}>{text('Privacy','गोपनीयता')}</a><a href="/verify/" onclick={() => open = false}>{text('Verify a document','दस्तावेज़ सत्यापित करें')}</a></nav><p class="menu-foot">{text('Faith · Unity · Transparency','आस्था · एकता · पारदर्शिता')}</p>
    </dialog>
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
  .menu-legal{display:flex;flex-wrap:wrap;gap:1rem;padding:.9rem 0 .2rem;border-top:1px solid var(--border,#e5e7eb);font-size:.78rem;color:var(--muted,#68736e)}
  .menu-legal a{text-decoration:underline;text-underline-offset:3px}
</style>
