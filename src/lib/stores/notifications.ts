import { writable, derived } from 'svelte/store';
import { listInbox, markInboxRead, clearInbox, type InboxItem } from '$lib/notifications';
const items=writable<InboxItem[]>([]);
export const inbox={subscribe:items.subscribe};
export const unreadCount=derived(items,rows=>rows.filter(row=>!row.read).length);
export async function refreshInbox(){items.set(await listInbox());}
export async function markAllRead(){await markInboxRead();await refreshInbox();}
export async function clearAll(){await clearInbox();await refreshInbox();}
export function initInbox():()=>void{
 void refreshInbox();
 if(typeof navigator==='undefined'||!('serviceWorker' in navigator))return ()=>{};
 const onMessage=(event:MessageEvent)=>{if((event.data as {type?:string}|null)?.type==='push-received')void refreshInbox();};
 navigator.serviceWorker.addEventListener('message',onMessage);
 return ()=>navigator.serviceWorker.removeEventListener('message',onMessage);
}
