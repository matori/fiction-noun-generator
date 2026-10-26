import { describe, expect, it } from 'vitest';
import { CONSONANT_EXAMPLES, consonantKanaList } from './consonant-info';
import { KANA_TABLE } from './romaji-table';
import { CONSONANTS } from './types';

describe('子音の代表の 1 音', () => {
  it.each(CONSONANTS)('%s の代表の 1 音はその子音のかな', (c) => {
    expect(KANA_TABLE.get(CONSONANT_EXAMPLES[c])?.onset).toBe(c);
  });
});

describe('consonantKanaList', () => {
  it('ア段〜オ段の順に並ぶ', () => {
    expect(consonantKanaList('k')).toEqual(['カ', 'キ', 'ク', 'ケ', 'コ']);
    expect(consonantKanaList('th')).toEqual(['テャ', 'ティ', 'テュ', 'テェ', 'テョ']);
    expect(consonantKanaList('f')).toEqual(['ファ', 'フィ', 'フェ', 'フォ']);
    expect(consonantKanaList('y')).toEqual(['ヤ', 'ユ', 'イェ', 'ヨ']);
  });

  it.each(CONSONANTS)('%s には 1 つ以上のかながある', (c) => {
    expect(consonantKanaList(c).length).toBeGreaterThan(0);
  });
});
