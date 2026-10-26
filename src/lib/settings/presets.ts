// 名前付きプリセットと JSON エクスポート／インポート（SPEC §5.3, §5.4）

import { normalizeSettings, type Preset, type Settings } from './settings';

export const EXPORT_APP = 'fiction-noun-generator';
export const EXPORT_VERSION = 1;

export interface ExportFile {
  app: typeof EXPORT_APP;
  version: typeof EXPORT_VERSION;
  presets: Preset[];
}

export function createPreset(name: string, settings: Settings, now = new Date()): Preset {
  return { name, settings: structuredClone(settings), updatedAt: now.toISOString() };
}

/** 同名があれば置き換え、なければ末尾に追加する */
export function upsertPreset(presets: readonly Preset[], preset: Preset): Preset[] {
  const index = presets.findIndex((p) => p.name === preset.name);
  if (index === -1) return [...presets, preset];
  return presets.map((p, i) => (i === index ? preset : p));
}

export function renamePreset(presets: readonly Preset[], from: string, to: string): Preset[] {
  return presets.map((p) => (p.name === from ? { ...p, name: to } : p));
}

export function removePreset(presets: readonly Preset[], name: string): Preset[] {
  return presets.filter((p) => p.name !== name);
}

/** 既存と重ならない名前にする（`名前 (2)` など） */
export function uniqueName(presets: readonly Preset[], name: string): string {
  const names = new Set(presets.map((p) => p.name));
  if (!names.has(name)) return name;
  let n = 2;
  while (names.has(`${name} (${n})`)) n += 1;
  return `${name} (${n})`;
}

export function buildExport(presets: readonly Preset[]): ExportFile {
  return { app: EXPORT_APP, version: EXPORT_VERSION, presets: [...presets] };
}

/** インポートする JSON を検証してプリセットの配列にする。不正なら Error を投げる */
export function parseImport(text: string): Preset[] {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('JSON として読み込めませんでした。');
  }
  if (typeof data !== 'object' || data === null) throw new Error('形式が正しくありません。');
  const file = data as Partial<ExportFile>;
  if (file.app !== EXPORT_APP) throw new Error('このアプリのエクスポートファイルではありません。');
  if (file.version !== EXPORT_VERSION) throw new Error(`未対応のバージョンです: ${String(file.version)}`);
  if (!Array.isArray(file.presets)) throw new Error('presets がありません。');

  return file.presets.flatMap((raw: unknown): Preset[] => {
    if (typeof raw !== 'object' || raw === null) return [];
    const { name, settings, updatedAt } = raw as Partial<Record<keyof Preset, unknown>>;
    if (typeof name !== 'string' || name.trim() === '') return [];
    return [
      {
        name: name.trim(),
        settings: normalizeSettings(settings),
        updatedAt: typeof updatedAt === 'string' ? updatedAt : new Date().toISOString(),
      },
    ];
  });
}

export function normalizePresets(value: unknown): Preset[] {
  if (!Array.isArray(value)) return [];
  try {
    return parseImport(JSON.stringify(buildExport(value as Preset[])));
  } catch {
    return [];
  }
}
