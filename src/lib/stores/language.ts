/**
 * Compatibility facade over the canonical lang store. All pages share one
 * language state; the previous independent store caused pages to disagree.
 */
import { derived } from 'svelte/store';
import { browser } from '$app/environment';
import { lang } from './lang';

export type PortalLanguage = 'en' | 'hi';
export const portalLanguage = derived(lang, ($lang): PortalLanguage => $lang);

export function initPortalLanguage(): void {
  if (!browser) return;
  // The canonical store owns the selected language. Do not overwrite it from
  // the legacy key on each route mount, or navigation can revert live changes.
  document.documentElement.setAttribute('lang', readLanguage());
}
function readLanguage(): PortalLanguage {
  let current: PortalLanguage = 'en';
  const unsubscribe = lang.subscribe(value => { current = value; });
  unsubscribe();
  return current;
}
export function togglePortalLanguage(): void { lang.toggle(); }
