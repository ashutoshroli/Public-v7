import { config, apiUrl } from '$lib/config';
export type PushState = 'unsupported' | 'denied' | 'subscribed' | 'default';
function urlBase64ToBuffer(value: string): ArrayBuffer {
  const padded = value + '='.repeat((4 - value.length % 4) % 4);
  const raw = atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = new Uint8Array(raw.length);
  for (let i=0;i<raw.length;i++) bytes[i]=raw.charCodeAt(i);
  return bytes.buffer;
}
export function pushSupported(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window && !!config.vapidKey;
}
export async function pushState(): Promise<PushState> {
  if (!pushSupported()) return 'unsupported';
  if (Notification.permission === 'denied') return 'denied';
  try { if (await (await navigator.serviceWorker.ready).pushManager.getSubscription()) return 'subscribed'; } catch {}
  return 'default';
}
async function saveSubscription(sub: PushSubscription): Promise<boolean> {
  try {
    const res=await fetch(apiUrl('savePushSubscription'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({subscription:sub.toJSON()})});
    if(!res.ok) return false;
    const data=await res.json().catch(()=>null) as {success?:boolean}|null;
    return !!data?.success;
  } catch { return false; }
}
export async function subscribe(): Promise<PushState> {
  if(!pushSupported()) return 'unsupported';
  const permission=await Notification.requestPermission();
  if(permission==='denied') return 'denied';
  if(permission!=='granted') return 'default';
  try {
    const reg=await navigator.serviceWorker.ready;
    const existing=await reg.pushManager.getSubscription();
    const sub=existing || await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:urlBase64ToBuffer(config.vapidKey)});
    return await saveSubscription(sub) ? 'subscribed' : 'default';
  } catch { return 'default'; }
}
export async function unsubscribe(): Promise<PushState> {
  if(!pushSupported()) return 'unsupported';
  try { const sub=await (await navigator.serviceWorker.ready).pushManager.getSubscription(); if(sub) await sub.unsubscribe(); } catch {}
  return 'default';
}
export function listenForSubscriptionChange(): () => void {
  if(typeof navigator==='undefined'||!('serviceWorker' in navigator)) return ()=>{};
  const listener=(event:MessageEvent)=>{
    const d=event.data as {type?:string;subscription?:unknown}|null;
    if(d?.type==='push-subscription-changed'&&d.subscription) void fetch(apiUrl('savePushSubscription'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({subscription:d.subscription})}).catch(()=>{});
  };
  navigator.serviceWorker.addEventListener('message',listener);
  return ()=>navigator.serviceWorker.removeEventListener('message',listener);
}
