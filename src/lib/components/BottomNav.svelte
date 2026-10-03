<script lang="ts">
  import { page } from '$app/stores';
  import MenuSheet from './MenuSheet.svelte';
  const isActive = (href: string, path: string) => href === '/' ? path === '/' : path.startsWith(href);
</script>
<nav class="bottom-nav" aria-label="Main navigation">
  <a class:active={isActive('/', $page.url.pathname)} href="/" aria-current={isActive('/', $page.url.pathname) ? 'page' : undefined}><span class="nav-icon">⌂</span><span>Home</span></a>
  <a class:active={isActive('/contributors/', $page.url.pathname)} href="/contributors/" aria-current={isActive('/contributors/', $page.url.pathname) ? 'page' : undefined}><span class="nav-icon">♙</span><span>Contributors</span></a>
  <a class:active={isActive('/expenses/', $page.url.pathname)} href="/expenses/" aria-current={isActive('/expenses/', $page.url.pathname) ? 'page' : undefined}><span class="nav-icon">▤</span><span>Expenses</span></a>
  <MenuSheet />
</nav>
