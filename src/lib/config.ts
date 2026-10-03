const DEFAULT_VAPID_KEY = 'BFoFsfDkYfYdHbKwGBZ7xtbOaXAKQRiCRwkXF4Nuz23q6fyidU-0VHjv3fhBA8177tavQfe2-dWGYcgKsWgVp-s';
export const config = {
  apiBase: (import.meta.env.PUBLIC_API_BASE || 'https://chhath-public-worker.shaharpura.com').replace(/\\/+$/, ''),
  vapidKey: import.meta.env.PUBLIC_VAPID_KEY ?? DEFAULT_VAPID_KEY
};
export const apiUrl = (action: string) => `${config.apiBase}/?action=${encodeURIComponent(action)}`;
