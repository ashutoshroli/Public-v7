<!-- Shared, functional header for every public route. No theme/skin logic. -->
<script lang="ts">
  import { page } from '$app/stores';
  import { lang, tr } from '$lib/stores/lang';
  import { refreshPortal, portalState, year, years } from '$lib/stores/portal';
  import { navItems } from '$lib/nav';

  interface Props {
    showYear?: boolean;
  }

  let { showYear = true }: Props = $props();
  let refreshing = $state(false);

  const isActive = (href: string, path: string) =>
    href === '/' ? path === '/' : path.startsWith(href);

  async function refresh() {
    if (refreshing) return;
    refreshing = true;
    try {
      await refreshPortal();
    } finally {
      refreshing = false;
    }
  }

  const yearOptions = $derived($years);
  const currentYear = $derived(Number.isInteger($year) ? Number($year) : yearOptions[0] ?? new Date().getFullYear());
</script>

<header class="site-header">
  <div class="site-header-inner">
    <a class="site-brand" href="/" aria-label={$tr('app_title')}>
      <span class="site-logo" aria-hidden="true">☼</span>
      <span class="site-brand-copy">
        <strong>Chhath Puja</strong>
        <small>Transparency Portal · Shaharpura</small>
      </span>
    </a>

    <nav class="site-nav" aria-label="Primary navigation">
      {#each navItems as item}
        <a
          href={item.href}
          class:active={isActive(item.href, $page.url.pathname)}
          aria-current={isActive(item.href, $page.url.pathname) ? 'page' : undefined}
        >{item.label}</a>
      {/each}
    </nav>

    <div class="site-actions">
      <button class="site-control" type="button" onclick={() => lang.toggle()} aria-label={$tr('toggle_language')} title={$tr('toggle_language')}>
        {$lang === 'hi' ? 'EN' : 'हिं'}
      </button>

      {#if showYear && yearOptions.length}
        <label class="site-year">
          <span class="sr-only">Select year</span>
          <select
            value={currentYear}
            onchange={(event) => year.set(Number((event.currentTarget as HTMLSelectElement).value))}
            aria-label="Select year"
          >
            {#each yearOptions as y}
              <option value={y}>{y}</option>
            {/each}
          </select>
        </label>
      {/if}

      <button class="site-control site-refresh" type="button" onclick={refresh} disabled={refreshing} aria-label="Refresh public records" title="Refresh public records">
        <span aria-hidden="true" class:spin={refreshing}>↻</span>
      </button>

      <a class="site-login" href="https://mgmt-chhath.shaharpura.com/" target="_blank" rel="noopener noreferrer">Management</a>
    </div>
  </div>
</header>
