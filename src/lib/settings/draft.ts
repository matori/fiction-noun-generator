// 前回の作業と起動時の復元（SPEC §5.6）

import { compactSettings, defaultSettings, normalizeSettings, type Settings } from './settings';
import type { SharedState } from './share';

export interface Draft {
  input: string;
  settings: Settings;
  savedAt: string;
}

/** 保存用。設定は初期値と同じ部分を省く */
export function serializeDraft(draft: Draft): unknown {
  return { ...draft, settings: compactSettings(draft.settings) };
}

export function normalizeDraft(value: unknown): Draft | null {
  if (typeof value !== 'object' || value === null) return null;
  const { input, settings, savedAt } = value as Record<string, unknown>;
  if (typeof input !== 'string' || typeof savedAt !== 'string') return null;
  return { input, settings: normalizeSettings(settings), savedAt };
}

export interface StartupState {
  input: string;
  settings: Settings;
  /** 復元ダイアログで確認する前回の作業。確認不要なら null */
  pendingRestore: Draft | null;
}

/**
 * 起動時の状態を決める。
 * legacySettings は旧版の `fng:settings`（設定だけを保存していた頃のデータ）。
 */
export function resolveStartup(
  shared: SharedState,
  draft: Draft | null,
  legacySettings: unknown,
): StartupState {
  const savedSettings = draft?.settings ?? (legacySettings ? normalizeSettings(legacySettings) : null);

  if (shared.settings || shared.text !== null) {
    return {
      input: shared.text ?? '',
      settings: shared.settings ?? savedSettings ?? defaultSettings(),
      pendingRestore: null,
    };
  }
  if (draft && draft.input) {
    return { input: '', settings: defaultSettings(), pendingRestore: draft };
  }
  return { input: '', settings: savedSettings ?? defaultSettings(), pendingRestore: null };
}
