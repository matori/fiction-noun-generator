// 生成履歴（SPEC §5.2, §6.1, §6.2）

import { compactSettings, normalizeSettings, type Settings } from './settings';

export const HISTORY_LIMIT = 50;

export interface HistoryEntry {
  id: string;
  input: string;
  output: string;
  /** 生成したときの設定。設定を記録する前の履歴にはない */
  settings: Settings | null;
  createdAt: string;
}

/** 設定の同一判定用のキー。設定のない古い履歴は null */
export function settingsKey(settings: Settings | null): string | null {
  return settings ? JSON.stringify(compactSettings(settings)) : null;
}

/**
 * 新しいものを先頭に足す（SPEC §6.2）。
 * 入力・出力・設定がすべて同じ履歴がすでにあれば、それを先頭に移して日時を更新する。
 */
export function addHistory(
  history: readonly HistoryEntry[],
  input: string,
  output: string,
  settings: Settings,
  now = new Date(),
): HistoryEntry[] {
  if (!input || !output) return [...history];
  const key = settingsKey(settings);
  const existing = history.find(
    (e) => e.input === input && e.output === output && settingsKey(e.settings) === key,
  );
  const entry: HistoryEntry = {
    id: existing?.id ?? `${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    input,
    output,
    settings: structuredClone(settings),
    createdAt: now.toISOString(),
  };
  const rest = existing ? history.filter((e) => e !== existing) : history;
  return [entry, ...rest].slice(0, HISTORY_LIMIT);
}

export interface HistoryGroup {
  /** settingsKey。設定のない古い履歴のグループは null */
  key: string | null;
  settings: Settings | null;
  /** 新しい順 */
  entries: HistoryEntry[];
}

/** 同じ設定の履歴をまとめる。グループはいちばん新しい履歴の順（SPEC §6.5） */
export function groupHistory(history: readonly HistoryEntry[]): HistoryGroup[] {
  const groups = new Map<string | null, HistoryGroup>();
  for (const entry of history) {
    const key = settingsKey(entry.settings);
    let group = groups.get(key);
    if (!group) {
      group = { key, settings: entry.settings, entries: [] };
      groups.set(key, group);
    }
    group.entries.push(entry);
  }
  return [...groups.values()];
}

/** 保存用。設定は初期値と同じ部分を省く */
export function serializeHistory(history: readonly HistoryEntry[]): unknown[] {
  return history.map((entry) => ({
    ...entry,
    settings: entry.settings ? compactSettings(entry.settings) : null,
  }));
}

export function normalizeHistory(value: unknown): HistoryEntry[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (e) =>
        typeof e === 'object' &&
        e !== null &&
        typeof e.id === 'string' &&
        typeof e.input === 'string' &&
        typeof e.output === 'string' &&
        typeof e.createdAt === 'string',
    )
    .slice(0, HISTORY_LIMIT)
    .map((e) => ({
      id: e.id,
      input: e.input,
      output: e.output,
      settings: typeof e.settings === 'object' && e.settings !== null ? normalizeSettings(e.settings) : null,
      createdAt: e.createdAt,
    }));
}
