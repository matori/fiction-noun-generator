import { describe, expect, it } from 'vitest';
import {
  identityConsonantMap,
  identityVowelMap,
  shiftVowels,
  shufflePermutation,
  shuffleWithDuplicates,
} from './mapping';
import { CONSONANTS, VOWELS } from './types';

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
