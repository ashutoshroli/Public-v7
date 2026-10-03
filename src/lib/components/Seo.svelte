<script lang="ts">
  import { page } from '$app/stores';
  import { config } from '$lib/config';
  import { tr } from '$lib/stores/lang';
  import { canonicalFor, metaFor, organisationJsonLd, websiteJsonLd } from '$lib/seo';

  const meta = $derived(metaFor($page.url.pathname));
  const canonical = $derived(canonicalFor(config.siteUrl, $page.url.pathname));
  const title = $derived(meta ? (meta.path === '' ? $tr('app_title') : `${$tr(meta.titleKey)} — ${$tr('app_title')}`) : $tr('app_title'));
  const socialTitle = $derived(meta?.path === '' ? $tr('social_title') : title);
</script>

<svelte:head>
  <link rel="canonical" href={canonical} />
  <meta property="og:url" content={canonical} />
  <meta property="og:title" content={socialTitle} />
  <meta property="og:image" content={`${config.siteUrl}/logo.svg`} />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content={socialTitle} />
  {#if meta}
    <meta name="description" content={meta.description} />
    <meta property="og:description" content={meta.description} />
    <meta name="twitter:description" content={meta.description} />
  {:else}
    <meta name="robots" content="noindex, follow" />
  {/if}
  {@html `<script type="application/ld+json">${organisationJsonLd(config.siteUrl)}</script>`}
  {@html `<script type="application/ld+json">${websiteJsonLd(config.siteUrl)}</script>`}
</svelte:head>
