<script lang="ts">
  import { page } from '$app/stores';
  import MenuSheet from './MenuSheet.svelte';
  const isActive = (href: string, path: string) => {
    const normalized = path.replace(/\/+$/, '') || '/';
    return href === '/' ? normalized === '/' : normalized === href.replace(/\/+$/, '');
  };
</script>
<nav class="bottom-nav" aria-label="Main navigation">
  <a class:active={isActive('/', $page.url.pathname)} style:color={isActive('/', $page.url.pathname) ? '#c83f45' : 'var(--muted, #68736e)'} href="/" aria-current={isActive('/', $page.url.pathname) ? 'page' : undefined}><span class="nav-icon">⌂</span><span>Home</span></a>
  <a class:active={isActive('/contributors/', $page.url.pathname)} style:color={isActive('/contributors/', $page.url.pathname) ? '#c83f45' : 'var(--muted, #68736e)'} href="/contributors/" aria-current={isActive('/contributors/', $page.url.pathname) ? 'page' : undefined}><span class="nav-icon">♙</span><span>Contributors</span></a>
  <a class:active={isActive('/expenses/', $page.url.pathname)} style:color={isActive('/expenses/', $page.url.pathname) ? '#c83f45' : 'var(--muted, #68736e)'} href="/expenses/" aria-current={isActive('/expenses/', $page.url.pathname) ? 'page' : undefined}><span class="nav-icon">▤</span><span>Expenses</span></a>
  <a class:active={isActive('/loans/', $page.url.pathname)} style:color={isActive('/loans/', $page.url.pathname) ? '#c83f45' : 'var(--muted, #68736e)'} href="/loans/" aria-current={isActive('/loans/', $page.url.pathname) ? 'page' : undefined}><span class="nav-icon">▣</span><span>Loans</span></a>
  <MenuSheet />
</nav>
