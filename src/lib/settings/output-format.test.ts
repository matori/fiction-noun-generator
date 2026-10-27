import { describe, expect, it } from 'vitest';
import {
  buildFooter,
  formatPair,
  formatPairs,
  normalizeOutputFormat,
  settingsLine,
  withFooter,
} from './output-format';
import { defaultSettings } from './settings';
import { parseShareQuery } from './share';

const pair = { input: 'おだ・のぶなが', output: 'アピ・ラミェリニィ' };

function exampleSettings() {
  const s = defaultSettings();
  s.vowelMap = { a: 'i', i: 'u', u: 'e', e: 'o', o: 'a' };
  s.consonantMap.d = 'p';
  s.consonantMap.n = 'r';
  return s;
}

describe('formatPair', () => {
  it('形式ごとの 1 行', () => {
    expect(formatPair(pair, 'output')).toBe('アピ・ラミェリニィ');
    expect(formatPair(pair, 'arrow')).toBe('おだ・のぶなが → アピ・ラミェリニィ');
    expect(formatPair(pair, 'tsv')).toBe('おだ・のぶなが\tアピ・ラミェリニィ');
    expect(formatPair(pair, 'csv')).toBe('おだ・のぶなが,アピ・ラミェリニィ');
  });

  it('CSV はコンマ・引用符・前後の空白を含む値を " で囲む', () => {
    expect(formatPair({ input: 'あ,い', output: 'ア"イ' }, 'csv')).toBe('"あ,い","ア""イ"');
    expect(formatPair({ input: ' あ', output: 'ア' }, 'csv')).toBe('" あ",ア');
  });

  it('TSV の値の中のタブは空白にする', () => {
    expect(formatPair({ input: 'あ\tい', output: 'ア' }, 'tsv')).toBe('あ い\tア');
  });

  it('空行は空行のまま', () => {
    expect(formatPair({ input: '', output: '' }, 'arrow')).toBe('');
    expect(formatPair({ input: '', output: '' }, 'csv')).toBe('');
  });

  it('複数行', () => {
    expect(formatPairs([pair, { input: 'さくら', output: 'シケリ' }], 'arrow')).toBe(
      'おだ・のぶなが → アピ・ラミェリニィ\nさくら → シケリ',
    );
  });
});

describe('フッター', () => {
  it('設定の要約は変更したマッピングだけ', () => {
    expect(settingsLine(defaultSettings())).toBe('反転なし ｜ マッピング変更なし');
    expect(settingsLine(exampleSettings())).toBe(
      '反転なし ｜ 母音 a→i i→u u→e e→o o→a ｜ 子音 n→r d→p',
    );
  });

  it('共有 URL には設定だけが入る', () => {
    const footer = buildFooter(exampleSettings(), 'https://example.com/app/?x=1');
    const [rule, settings, url] = footer.split('\n');
    expect(rule).toBe('----');
    expect(settings).toBe('設定: 反転なし ｜ 母音 a→i i→u u→e e→o o→a ｜ 子音 n→r d→p');
    const shared = new URL(url.replace('共有URL: ', ''));
    expect(shared.pathname).toBe('/app/');
    expect(parseShareQuery(shared.search)).toEqual({ settings: exampleSettings(), text: null });
  });

  it('withFooter は空行を 1 つ挟む', () => {
    expect(withFooter('本文', '----')).toBe('本文\n\n----');
    expect(withFooter('本文', null)).toBe('本文');
  });
});

describe('normalizeOutputFormat', () => {
  it('不正な値は「変換後のみ」', () => {
    expect(normalizeOutputFormat('csv')).toBe('csv');
    expect(normalizeOutputFormat('xml')).toBe('output');
    expect(normalizeOutputFormat(null)).toBe('output');
  });
});
