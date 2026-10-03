import { writable, derived } from 'svelte/store';

export type InboxItem = { id: number; title: string; body: string; url: string; receivedAt: number; read: boolean };
const KEY = 'chhath-public-v7-inbox-v1';
const items = writable<InboxItem[]>([]);
export const inbox = { subscribe: items.subscribe };
export const unreadCount = derived(items, rows => rows.filter(row => !row.read).length);

function readSaved(): InboxItem[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(value) ? value.filter(row => row && typeof row.title === 'string') : [];
  } catch { return []; }
}
function save(rows: InboxItem[]) {
  try { if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, JSON.stringify(rows)); } catch { /* storage may be unavailable */ }
}
export function refreshInbox() { items.set(readSaved()); }
export function addNotification(input: {title:string; body?:string; url?:string}) {
  const rows = readSaved();
  rows.unshift({ id: Date.now(), title: input.title, body: input.body || '', url: input.url || '/', receivedAt: Date.now(), read: false });
  save(rows.slice(0,100)); items.set(readSaved());
}
export function markAllRead() { const rows = readSaved().map(row => ({...row, read:true})); save(rows); items.set(rows); }
export function clearAll() { save([]); items.set([]); }
export function initInbox(): () => void {
  refreshInbox();
  const onStorage = (event: StorageEvent) => { if (event.key === KEY) refreshInbox(); };
  if (typeof window !== 'undefined') window.addEventListener('storage', onStorage);
  return () => { if (typeof window !== 'undefined') window.removeEventListener('storage', onStorage); };
}
