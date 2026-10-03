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
  try {
    const legacy = localStorage.getItem('chhath-portal-language');
    if (legacy === 'hi' || legacy === 'en') lang.set(legacy);
    document.documentElement.setAttribute('lang', readLanguage());
  } catch {
    // Browser storage can be disabled; the in-memory language store still works.
  }
}
function readLanguage(): PortalLanguage {
  let current: PortalLanguage = 'en';
  const unsubscribe = lang.subscribe(value => { current = value; });
  unsubscribe();
  return current;
}
export function togglePortalLanguage(): void { lang.toggle(); }
