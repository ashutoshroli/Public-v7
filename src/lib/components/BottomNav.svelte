<script lang="ts">
  import { page } from '$app/stores';
  import MenuSheet from './MenuSheet.svelte';
  import { lang, tr } from '$lib/stores/lang';
  const isActive = (href: string, path: string) => {
    const normalized = path.replace(/\/+$/, '') || '/';
    return href === '/' ? normalized === '/' : normalized === href.replace(/\/+$/, '');
  };
</script>
<nav class="bottom-nav" aria-label={$lang === 'hi' ? 'मुख्य नेविगेशन' : 'Main navigation'}>
  <a class:active={isActive('/', $page.url.pathname)} href="/" aria-current={isActive('/', $page.url.pathname) ? 'page' : undefined}><span class="nav-icon">⌂</span><span>{$tr('nav_home')}</span></a>
  <a class:active={isActive('/contributors/', $page.url.pathname)} href="/contributors/" aria-current={isActive('/contributors/', $page.url.pathname) ? 'page' : undefined}><span class="nav-icon">♙</span><span>{$tr('nav_contributors')}</span></a>
  <a class:active={isActive('/expenses/', $page.url.pathname)} href="/expenses/" aria-current={isActive('/expenses/', $page.url.pathname) ? 'page' : undefined}><span class="nav-icon">▤</span><span>{$tr('nav_expenses')}</span></a>
  <a class:active={isActive('/loans/', $page.url.pathname)} href="/loans/" aria-current={isActive('/loans/', $page.url.pathname) ? 'page' : undefined}><span class="nav-icon">▣</span><span>{$tr('nav_loans')}</span></a>
  <MenuSheet />
</nav>
