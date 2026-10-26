import { describe, expect, it } from 'vitest';
import {
  consonantsOf,
  identityConsonantMap,
  identityVowelMap,
  shiftVowels,
  shufflePermutation,
  shuffleConsonants,
  shuffleWithDuplicates,
} from './mapping';
import { CONSONANT_GROUPS, CONSONANTS, VOWELS } from './types';

/** 決まった値を順に返す乱数 */
function sequence(...values: number[]) {
  let i = 0;
  return () => values[i++ % values.length];
}

describe('初期値', () => {
  it('子音プールは 39 種', () => {
    expect(CONSONANTS).toHaveLength(39);
    expect(new Set(CONSONANTS).size).toBe(39);
  });

  it('変化なし', () => {
    expect(identityVowelMap()).toEqual({ a: 'a', i: 'i', u: 'u', e: 'e', o: 'o' });
    expect(identityConsonantMap().ky).toBe('ky');
  });
});

describe('shiftVowels', () => {
  it('a→i→u→e→o→a の順に進める', () => {
    expect(shiftVowels(identityVowelMap(), 1)).toEqual({ a: 'i', i: 'u', u: 'e', e: 'o', o: 'a' });
  });

  it('逆方向', () => {
    expect(shiftVowels(identityVowelMap(), -1)).toEqual({ a: 'o', i: 'a', u: 'i', e: 'u', o: 'e' });
  });

  it('現在の行き先に作用する', () => {
    const map = { a: 'i', i: 'i', u: 'u', e: 'e', o: 'o' } as const;
    expect(shiftVowels(map, 1).a).toBe('u');
  });
});

describe('shufflePermutation', () => {
  it('重複のない順列になる', () => {
    for (let n = 0; n < 20; n += 1) {
      const map = shufflePermutation(CONSONANTS);
      expect(new Set(Object.values(map)).size).toBe(CONSONANTS.length);
    }
  });

  it('乱数を固定すると結果も固定', () => {
    expect(shufflePermutation(VOWELS, sequence(0))).toEqual(
      shufflePermutation(VOWELS, sequence(0)),
    );
  });
});

describe('shuffleWithDuplicates', () => {
  it('重複を許す', () => {
    expect(shuffleWithDuplicates(VOWELS, sequence(0))).toEqual({
      a: 'a', i: 'a', u: 'a', e: 'a', o: 'a',
    });
  });
});

describe('グループを指定した子音のシャッフル', () => {
  it('consonantsOf はグループの並び順で返す', () => {
    expect(consonantsOf(['extended', 'basic'])).toEqual([
      ...CONSONANT_GROUPS.basic,
      ...CONSONANT_GROUPS.extended,
    ]);
    expect(consonantsOf([])).toEqual([]);
  });

  it('対象外の子音は今の設定のまま、行き先は対象のグループの中だけ', () => {
    const current = { ...identityConsonantMap(), f: 'k' as const, ky: 'th' as const };
    const basicAndYouon = new Set<string>(consonantsOf(['basic', 'youon']));
    for (const withDuplicates of [false, true]) {
      const map = shuffleConsonants(current, ['basic', 'youon'], withDuplicates);
      for (const c of CONSONANT_GROUPS.extended) expect(map[c]).toBe(current[c]);
      for (const c of basicAndYouon) expect(basicAndYouon.has(map[c as keyof typeof map])).toBe(true);
    }
  });

  it('重複なしなら対象の中で順列になる', () => {
    const map = shuffleConsonants(identityConsonantMap(), ['basic'], false);
    expect(new Set(CONSONANT_GROUPS.basic.map((c) => map[c])).size).toBe(CONSONANT_GROUPS.basic.length);
  });

  it('対象がなければ何も変えない', () => {
    const current = identityConsonantMap();
    expect(shuffleConsonants(current, [], false)).toEqual(current);
  });
});
