// localStorage の読み書き（SPEC §5.2）。失敗しても例外を外に出さない

export function readStorage<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? null : (JSON.parse(raw) as T);
  } catch {
    return null;
  }
}

/** 保存できたら true */
export function writeStorage(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // 消せなくても動作は続ける
  }
}

export const STORAGE_KEYS = {
  draft: 'fng:draft',
  presets: 'fng:presets',
  history: 'fng:history',
  /** 旧版。設定だけを保存していた頃のキー */
  legacySettings: 'fng:settings',
} as const;
