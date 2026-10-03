import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type PortalLanguage = 'en' | 'hi';
export const portalLanguage = writable<PortalLanguage>('en');

export function initPortalLanguage(): void {
  if (!browser) return;
  try {
    const saved = localStorage.getItem('chhath-portal-language');
    if (saved === 'hi' || saved === 'en') portalLanguage.set(saved);
  } catch { /* storage may be unavailable */ }
}

export function togglePortalLanguage(): void {
  let next: PortalLanguage = 'en';
  portalLanguage.update(current => {
    next = current === 'en' ? 'hi' : 'en';
    return next;
  });
  if (browser) {
    try { localStorage.setItem('chhath-portal-language', next); } catch { /* ignore */ }
  }
}
