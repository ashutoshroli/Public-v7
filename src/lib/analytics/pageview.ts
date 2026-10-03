interface DataLayerWindow { dataLayer?: unknown[]; }
export function pushPageView(path: string, title: string): void {
  if (typeof window === 'undefined') return;
  const dl = (window as DataLayerWindow).dataLayer;
  if (Array.isArray(dl)) dl.push({ event: 'page_view', page_path: path, page_title: title });
}
