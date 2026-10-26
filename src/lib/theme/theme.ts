// Fluent 2 トークン → CSS 変数、テーマ切替（SPEC §7）

import { webDarkTheme, webLightTheme, type Theme } from '@fluentui/tokens';
import { readStorage, writeStorage } from '../settings/storage';

export type ThemeMode = 'system' | 'light' | 'dark';

const THEME_KEY = 'fng:theme';
const STYLE_ID = 'fng-theme-tokens';

/**
 * Fluent のトークンから上書きする値。
 * 本文のフォントは Fluent の Segoe UI 指定をやめ、OS 既定の sans-serif に任せる
 */
const OVERRIDES: Partial<Record<keyof Theme, string>> = {
  fontFamilyBase: 'sans-serif',
};

function declarations(theme: Theme, keys: readonly string[]): string {
  return keys
    .map((key) => `--${key}: ${OVERRIDES[key as keyof Theme] ?? String(theme[key as keyof Theme])};`)
    .join('\n');
}

/**
 * ライトを既定にし、ダークで値が変わるトークンだけを上書きする。
 * data-theme 属性がなければ OS 設定に従う。
 */
export function buildThemeCss(): string {
  const allKeys = Object.keys(webLightTheme);
  const darkKeys = allKeys.filter(
    (key) => webLightTheme[key as keyof Theme] !== webDarkTheme[key as keyof Theme],
  );
  const dark = declarations(webDarkTheme, darkKeys);
  return [
    `:root { color-scheme: light; ${declarations(webLightTheme, allKeys)} }`,
    `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { color-scheme: dark; ${dark} } }`,
    `:root[data-theme="dark"] { color-scheme: dark; ${dark} }`,
  ].join('\n');
}

export function installThemeTokens(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = buildThemeCss();
  document.head.prepend(style);
}

export function loadThemeMode(): ThemeMode {
  const mode = readStorage<unknown>(THEME_KEY);
  return mode === 'light' || mode === 'dark' ? mode : 'system';
}

export function applyThemeMode(mode: ThemeMode): void {
  if (mode === 'system') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = mode;
  writeStorage(THEME_KEY, mode);
}
