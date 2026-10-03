<script lang="ts">
  import { lang } from '$lib/stores/lang';
</script>
<div class="language-control">
  <button type="button" onclick={() => lang.toggle()} aria-label={$lang === 'hi' ? 'Switch language to English' : 'भाषा हिंदी में बदलें'}>{$lang === 'hi' ? 'English' : 'हिंदी'}</button>
</div>
<style>
  .language-control{position:fixed;right:1rem;top:1rem;z-index:60}
  button{border:1px solid var(--border,#d1d5db);border-radius:999px;padding:.45rem .8rem;background:var(--card,#fff);color:var(--text,#1f2937);font:inherit;font-size:.8rem;font-weight:700;box-shadow:0 2px 10px #00000012}
</style>