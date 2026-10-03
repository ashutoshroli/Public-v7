import { writable } from 'svelte/store';

export type PortalRow = Record<string, unknown>;
export type PortalData = Record<string, PortalRow[] | unknown> & {
  collections?: PortalRow[];
  expenses?: PortalRow[];
  loans?: PortalRow[];
  users?: PortalRow[];
  committee?: PortalRow[];
  guarantors?: PortalRow[];
  generatedFiles?: PortalRow[];
};

const API_URL = 'https://chhath-public-worker.shaharpura.com?action=portalData';
const CACHE_KEY = 'chhath-public-portal-data-v1';
const CACHE_MAX_AGE = 6 * 60 * 60 * 1000;

export const portalData = writable<PortalData>({});
export const portalLoading = writable(false);
export const portalError = writable('');
export const selectedPortalYear = writable('');

let inFlight: Promise<PortalData> | null = null;
let loadedAt = 0;

function normalizePayload(raw: unknown): PortalData {
  if (!raw || typeof raw !== 'object') throw new Error('Public data response is not valid.');
  const outer = raw as Record<string, unknown>;
  const data = outer.data && typeof outer.data === 'object' ? outer.data as Record<string, unknown> : outer;
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) result[key] = value.filter(item => item && typeof item === 'object') as PortalRow[];
  }
  if (!Object.keys(result).length) throw new Error('Public data response contains no record tables.');
  return result as PortalData;
}

function readCache(): PortalData | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as { savedAt?: number; data?: unknown };
    if (!saved.savedAt || Date.now() - saved.savedAt > CACHE_MAX_AGE) return null;
    return normalizePayload(saved.data);
  } catch {
    return null;
  }
}

function writeCache(data: PortalData) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), data }));
  } catch {
    // Storage can be disabled or full; live data remains usable.
  }
}

export async function loadPortalData(force = false): Promise<PortalData> {
  if (!force && loadedAt && Date.now() - loadedAt < 60_000) return new Promise(resolve => {
    const unsubscribe = portalData.subscribe(value => { unsubscribe(); resolve(value); });
  });
  if (inFlight) return inFlight;

  portalLoading.set(true);
  portalError.set('');
  const cached = readCache();
  if (cached) portalData.set(cached);

  inFlight = (async () => {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : undefined;
    const timeout = controller ? setTimeout(() => controller.abort(), 12_000) : undefined;
    try {
      const response = await fetch(API_URL, { signal: controller?.signal });
      if (!response.ok) throw new Error('Public records are temporarily unavailable.');
      const data = normalizePayload(await response.json());
      portalData.set(data);
      writeCache(data);
      loadedAt = Date.now();
      return data;
    } catch (error) {
      if (cached) {
        portalData.set(cached);
        portalError.set('Showing saved public data. Live refresh failed.');
        return cached;
      }
      const message = error instanceof Error && error.name === 'AbortError'
        ? 'Public data request timed out.'
        : error instanceof Error ? error.message : 'Unable to load public records.';
      portalError.set(message);
      throw error instanceof Error ? error : new Error(message);
    } finally {
      if (timeout) clearTimeout(timeout);
      portalLoading.set(false);
      inFlight = null;
    }
  })();
  return inFlight;
}
