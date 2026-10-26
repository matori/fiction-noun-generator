// 画面全体の状態と保存（SPEC §5, §6）

import { convert } from './lib/core';
import { normalizeDraft, resolveStartup, serializeDraft, type Draft } from './lib/settings/draft';
import { addHistory, normalizeHistory, serializeHistory, type HistoryEntry } from './lib/settings/history';
import { normalizePresets } from './lib/settings/presets';
import { defaultSettings, type Preset, type Settings } from './lib/settings/settings';
import { parseShareQuery } from './lib/settings/share';
import { readStorage, removeStorage, STORAGE_KEYS, writeStorage } from './lib/settings/storage';
import { applyThemeMode, loadThemeMode, type ThemeMode } from './lib/theme/theme';

export class AppState {
  input = $state('');
  settings = $state<Settings>(defaultSettings());
  presets = $state<Preset[]>([]);
  history = $state<HistoryEntry[]>([]);
  themeMode = $state<ThemeMode>('system');

  /** 起動時の復元ダイアログで確認中の前回の作業。確認が済むまで前回の作業は上書きしない */
  pendingRestore = $state<Draft | null>(null);

  /** 保存状態（SPEC §6.6） */
  savedAt = $state<Date | null>(null);
  saveFailed = $state(false);
  #failedKeys = new Set<string>();

  result = $derived(convert(this.input, this.settings));

  constructor() {
    const shared = parseShareQuery(location.search);
    const startup = resolveStartup(
      shared,
      normalizeDraft(readStorage(STORAGE_KEYS.draft)),
      readStorage(STORAGE_KEYS.legacySettings),
    );
    this.input = startup.input;
    this.settings = startup.settings;
    this.pendingRestore = startup.pendingRestore;
    this.presets = normalizePresets(readStorage(STORAGE_KEYS.presets));
    this.history = normalizeHistory(readStorage(STORAGE_KEYS.history));
    this.themeMode = loadThemeMode();

    if (shared.settings || shared.text !== null) {
      window.history.replaceState(null, '', location.pathname + location.hash);
    }

    $effect.root(() => {
      $effect(() => {
        const draft: Draft = {
          input: this.input,
          settings: $state.snapshot(this.settings),
          savedAt: new Date().toISOString(),
        };
        if (this.pendingRestore) return;
        if (this.#save(STORAGE_KEYS.draft, serializeDraft(draft))) {
          this.savedAt = new Date(draft.savedAt);
          removeStorage(STORAGE_KEYS.legacySettings);
        }
      });
      $effect(() => {
        this.#save(STORAGE_KEYS.presets, $state.snapshot(this.presets));
      });
      $effect(() => {
        this.#save(STORAGE_KEYS.history, serializeHistory($state.snapshot(this.history)));
      });
      $effect(() => applyThemeMode(this.themeMode));
    });
  }

  #save(key: string, value: unknown): boolean {
    const ok = writeStorage(key, value);
    if (ok) this.#failedKeys.delete(key);
    else this.#failedKeys.add(key);
    this.saveFailed = this.#failedKeys.size > 0;
    return ok;
  }

  addToHistory(): void {
    this.history = addHistory(this.history, this.input, this.result.output, $state.snapshot(this.settings));
  }

  /** 履歴・プリセットの設定は $state のプロキシなので、snapshot で素のオブジェクトにしてから使う */
  applySettings(settings: Settings): void {
    this.settings = $state.snapshot(settings);
  }

  /** 復元ダイアログの選択（SPEC §5.6） */
  resolveRestore(choice: 'all' | 'settings' | 'fresh'): void {
    const draft = this.pendingRestore;
    if (!draft) return;
    if (choice !== 'fresh') this.applySettings(draft.settings);
    if (choice === 'all') this.input = draft.input;
    this.pendingRestore = null;
  }
}
