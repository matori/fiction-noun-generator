import { describe, expect, it } from 'vitest';
import { normalizeDraft, resolveStartup, serializeDraft, type Draft } from './draft';
import { defaultSettings } from './settings';

function custom() {
  const s = defaultSettings();
  s.vowelMap.a = 'o';
  s.reverse = 'kana';
  return s;
}

const draft: Draft = { input: 'さくら', settings: custom(), savedAt: '2026-01-01T00:00:00.000Z' };
const noShare = { settings: null, text: null };

describe('前回の作業の保存', () => {
  it('設定を省略形で保存し、読み込みで元に戻る', () => {
    const stored = JSON.parse(JSON.stringify(serializeDraft(draft)));
    expect(stored.settings.vowelMap).toEqual({ a: 'o' });
    expect(normalizeDraft(stored)).toEqual(draft);
  });

  it('壊れたデータは null', () => {
    expect(normalizeDraft(null)).toBeNull();
    expect(normalizeDraft({ input: 1, savedAt: 'x' })).toBeNull();
  });
});

describe('起動時の状態（SPEC §5.6）', () => {
  it('入力のある前回の作業はダイアログで確認する', () => {
    expect(resolveStartup(noShare, draft, null)).toEqual({
      input: '',
      settings: defaultSettings(),
      pendingRestore: draft,
    });
  });

  it('入力が空なら設定だけ黙って復元する', () => {
    const state = resolveStartup(noShare, { ...draft, input: '' }, null);
    expect(state.settings).toEqual(custom());
    expect(state.pendingRestore).toBeNull();
  });

  it('前回の作業がなければ初期状態', () => {
    expect(resolveStartup(noShare, null, null)).toEqual({
      input: '',
      settings: defaultSettings(),
      pendingRestore: null,
    });
  });

  it('旧版の設定だけのデータを引き継ぐ', () => {
    expect(resolveStartup(noShare, null, { reverse: 'romaji' }).settings.reverse).toBe('romaji');
  });

  it('共有 URL があればダイアログを出さずに URL を使う', () => {
    const shared = { settings: defaultSettings(), text: 'かな' };
    expect(resolveStartup(shared, draft, null)).toEqual({
      input: 'かな',
      settings: defaultSettings(),
      pendingRestore: null,
    });
  });

  it('共有 URL が入力だけなら、設定は前回の作業から', () => {
    const state = resolveStartup({ settings: null, text: 'かな' }, draft, null);
    expect(state.input).toBe('かな');
    expect(state.settings).toEqual(custom());
  });
});
