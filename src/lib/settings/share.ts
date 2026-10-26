// URL 共有（SPEC §5.5）。?s=<base64url の設定>&t=<入力>

import { compactSettings, normalizeSettings, type Settings } from './settings';

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join('');
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(encoded: string): string {
  const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64 + '='.repeat((4 - (base64.length % 4)) % 4));
  return new TextDecoder().decode(Uint8Array.from(binary, (ch) => ch.charCodeAt(0)));
}

export function buildShareUrl(base: string, settings: Settings, text: string): string {
  const url = new URL(base);
  url.search = '';
  url.hash = '';
  url.searchParams.set('s', toBase64Url(JSON.stringify(compactSettings(settings))));
  if (text) url.searchParams.set('t', text);
  return url.toString();
}

export interface SharedState {
  settings: Settings | null;
  text: string | null;
}

/** 壊れた `s` は無視する */
export function parseShareQuery(search: string): SharedState {
  const params = new URLSearchParams(search);
  const s = params.get('s');
  let settings: Settings | null = null;
  if (s) {
    try {
      settings = normalizeSettings(JSON.parse(fromBase64Url(s)));
    } catch {
      settings = null;
    }
  }
  return { settings, text: params.get('t') };
}
