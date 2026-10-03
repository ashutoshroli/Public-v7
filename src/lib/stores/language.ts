/**
 * Compatibility facade over the canonical lang store. There must be one language
 * state for the entire app; the old portalLanguage store caused pages to disagree.
 */
import { derived } from 'svelte/store';
import { browser } from '$app/environment';
import { lang } from './lang';

export type PortalLanguage = 'en' | 'hi';
export const portalLanguage = derived(lang, ($lang): PortalLanguage => $lang);
export function initPortalLanguage(): void {
  if (browser) document.documentElement.setAttribute('lang', langValue());
}
function langValue(): PortalLanguage {
  let current: PortalLanguage = 'en';
  const unsubscribe = lang.subscribe(value => { current = value; });
  unsubscribe();
  return current;
}
export function togglePortalLanguage(): void { lang.toggle(); }
