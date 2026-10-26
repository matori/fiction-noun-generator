import { describe, expect, it } from 'vitest';
import {
  addHistory,
  groupHistory,
  HISTORY_LIMIT,
  normalizeHistory,
  serializeHistory,
  type HistoryEntry,
} from './history';
import {
  buildExport,
  createPreset,
  normalizePresets,
  parseImport,
  renamePreset,
  removePreset,
  uniqueName,
  upsertPreset,
} from './presets';
import { compactSettings, defaultSettings, normalizeSettings } from './settings';
import { buildShareUrl, parseShareQuery } from './share';
import { formatSummary, summarizeSettings } from './summary';

function customSettings() {
  const s = defaultSettings();
  s.vowelMap.a = 'i';
  s.consonantMap.k = 'ky';
  s.reverse = 'romaji';
  s.moveLeadingVowel = true;
  return s;
}

describe('normalizeSettings', () => {
  it('不正な値は初期値で補う', () => {
    expect(normalizeSettings(null)).toEqual(defaultSettings());
    const s = normalizeSettings({
      vowelMap: { a: 'x', i: 'u' },
      consonantMap: { k: 's', zz: 'k', t: 'nope' },
      reverse: 'both',
      moveLeadingVowel: 'yes',
    });
    expect(s.vowelMap).toEqual({ a: 'a', i: 'u', u: 'u', e: 'e', o: 'o' });
    expect(s.consonantMap.k).toBe('s');
    expect(s.consonantMap.t).toBe('t');
    expect(s.consonantMap).not.toHaveProperty('zz');
    expect(s.reverse).toBe('none');
    expect(s.moveLeadingVowel).toBe(false);
  });
});

describe('compactSettings', () => {
  it('初期値と同じエントリを省く', () => {
    const compact = compactSettings(customSettings());
    expect(compact.vowelMap).toEqual({ a: 'i' });
    expect(compact.consonantMap).toEqual({ k: 'ky' });
  });
});

describe('URL 共有', () => {
  it('設定と入力が往復する', () => {
    const url = buildShareUrl('http://localhost:5173/?old=1#x', customSettings(), 'さくら・テスト');
    const parsed = parseShareQuery(new URL(url).search);
    expect(parsed.settings).toEqual(customSettings());
    expect(parsed.text).toBe('さくら・テスト');
    expect(url).not.toContain('old=1');
  });

  it('入力が空なら t を付けない', () => {
    expect(buildShareUrl('http://localhost/', defaultSettings(), '')).not.toContain('t=');
  });

  it('壊れた s は無視する', () => {
    expect(parseShareQuery('?s=%%%&t=a')).toEqual({ settings: null, text: 'a' });
    expect(parseShareQuery('')).toEqual({ settings: null, text: null });
  });
});

describe('プリセット', () => {
  const now = new Date('2026-01-01T00:00:00Z');
  const a = createPreset('A', defaultSettings(), now);
  const b = createPreset('B', customSettings(), now);

  it('upsert は同名を置き換える', () => {
    const replaced = upsertPreset([a, b], createPreset('A', customSettings(), now));
    expect(replaced.map((p) => p.name)).toEqual(['A', 'B']);
    expect(replaced[0].settings).toEqual(customSettings());
    expect(upsertPreset([a], b).map((p) => p.name)).toEqual(['A', 'B']);
  });

  it('名前変更・削除', () => {
    expect(renamePreset([a, b], 'A', 'C').map((p) => p.name)).toEqual(['C', 'B']);
    expect(removePreset([a, b], 'A').map((p) => p.name)).toEqual(['B']);
  });

  it('uniqueName', () => {
    expect(uniqueName([a], 'B')).toBe('B');
    expect(uniqueName([a], 'A')).toBe('A (2)');
    expect(uniqueName([a, createPreset('A (2)', defaultSettings())], 'A')).toBe('A (3)');
  });

  it('エクスポートしたものをインポートできる', () => {
    const json = JSON.stringify(buildExport([a, b]));
    expect(parseImport(json)).toEqual([a, b]);
  });

  it('不正なファイルはエラー', () => {
    expect(() => parseImport('{')).toThrow();
    expect(() => parseImport('{"app":"other","version":1,"presets":[]}')).toThrow();
    expect(() => parseImport('{"app":"fiction-noun-generator","version":2,"presets":[]}')).toThrow();
  });

  it('壊れたプリセットは読み飛ばす', () => {
    const json = JSON.stringify({
      app: 'fiction-noun-generator',
      version: 1,
      presets: [{ name: '' }, 1, { name: ' X ', settings: { reverse: 'kana' } }],
    });
    const presets = parseImport(json);
    expect(presets).toHaveLength(1);
    expect(presets[0].name).toBe('X');
    expect(presets[0].settings.reverse).toBe('kana');
  });

  it('normalizePresets は壊れた保存データでも空配列', () => {
    expect(normalizePresets('nope')).toEqual([]);
    expect(normalizePresets([a])).toEqual([a]);
  });
});

describe('履歴', () => {
  const d = defaultSettings();

  it('先頭に追加し、同じ入力・出力・設定は追加しない', () => {
    let h: HistoryEntry[] = [];
    h = addHistory(h, 'さくら', 'サクラ', d);
    h = addHistory(h, 'さくら', 'サクラ', defaultSettings());
    expect(h).toHaveLength(1);
    h = addHistory(h, 'かな', 'カナ', d);
    expect(h.map((e) => e.output)).toEqual(['カナ', 'サクラ']);
  });

  it('同じものが間に挟まっていても、追加せず先頭に移して日時を更新する', () => {
    let h: HistoryEntry[] = [];
    h = addHistory(h, 'あ', 'ア', d, new Date('2026-01-01T00:00:00Z'));
    const id = h[0].id;
    h = addHistory(h, 'い', 'イ', d, new Date('2026-01-02T00:00:00Z'));
    h = addHistory(h, 'あ', 'ア', d, new Date('2026-01-03T00:00:00Z'));
    expect(h.map((e) => e.output)).toEqual(['ア', 'イ']);
    expect(h[0].id).toBe(id);
    expect(h[0].createdAt).toBe('2026-01-03T00:00:00.000Z');
  });

  it('設定が違えば同じ入力・出力でも追加する', () => {
    const other = defaultSettings();
    other.reverse = 'kana';
    const h = addHistory(addHistory([], 'ト', 'ト', d), 'ト', 'ト', other);
    expect(h).toHaveLength(2);
  });

  it('設定を一緒に記録する（後から元の設定を変えても影響しない）', () => {
    const s = customSettings();
    const [entry] = addHistory([], 'さくら', 'ルカサ', s);
    s.vowelMap.a = 'u';
    expect(entry.settings).toEqual(customSettings());
  });

  it('空の入力は追加しない', () => {
    expect(addHistory([], '', '', d)).toEqual([]);
  });

  it(`最大 ${HISTORY_LIMIT} 件`, () => {
    let h: HistoryEntry[] = [];
    for (let i = 0; i < HISTORY_LIMIT + 5; i += 1) h = addHistory(h, `${i}`, `${i}`, d);
    expect(h).toHaveLength(HISTORY_LIMIT);
    expect(h[0].input).toBe(`${HISTORY_LIMIT + 4}`);
  });

  it('保存時は設定を省略形にし、読み込みで元に戻る', () => {
    const h = addHistory([], 'さくら', 'ルカサ', customSettings());
    const stored = JSON.parse(JSON.stringify(serializeHistory(h)));
    expect(stored[0].settings.vowelMap).toEqual({ a: 'i' });
    expect(normalizeHistory(stored)).toEqual(h);
  });

  it('設定を記録していない古い履歴は settings が null', () => {
    const old = [{ id: '1', input: 'か', output: 'カ', createdAt: '2026-01-01T00:00:00Z' }];
    expect(normalizeHistory(old)[0].settings).toBeNull();
  });
});

describe('履歴のグループ', () => {
  it('同じ設定をまとめ、いちばん新しい履歴の順に並べる', () => {
    const custom = customSettings();
    let h: HistoryEntry[] = [];
    h = addHistory(h, 'あ', 'ア', defaultSettings());
    h = addHistory(h, 'い', 'イ', custom);
    h = addHistory(h, 'う', 'ウ', defaultSettings());
    h = [...h, { id: 'old', input: 'え', output: 'エ', settings: null, createdAt: '2025-01-01T00:00:00Z' }];
    const groups = groupHistory(h);
    expect(groups.map((g) => g.entries.map((e) => e.output))).toEqual([['ウ', 'ア'], ['イ'], ['エ']]);
    expect(groups[1].settings).toEqual(custom);
    expect(groups[2].key).toBeNull();
  });
});

describe('設定の要約', () => {
  it('初期値', () => {
    const summary = summarizeSettings(defaultSettings());
    expect(summary.options).toEqual(['反転なし']);
    expect(formatSummary(summary)).toBe('反転なし ｜ マッピング変更なし');
  });

  it('変更あり', () => {
    const summary = summarizeSettings(customSettings());
    expect(summary.options).toEqual(['ローマ字反転', '母音移動', '末尾ー保持']);
    expect(summary.vowelChanges).toEqual([['a', 'i']]);
    expect(summary.consonantChanges).toEqual([['k', 'ky']]);
    expect(formatSummary(summary)).toBe('ローマ字反転・母音移動・末尾ー保持 ｜ 母音 1 / 子音 1 変更');
  });

  it('母音移動はローマ字反転のときだけ表示する', () => {
    const s = customSettings();
    s.reverse = 'kana';
    expect(summarizeSettings(s).options).toEqual(['かな反転', '末尾ー保持']);
  });
});
