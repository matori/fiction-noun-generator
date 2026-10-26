// マッピングの初期値と操作（SPEC §3）

import { CONSONANTS, VOWELS, type ConsonantMap, type VowelMap } from './types';

/** 0 以上 1 未満を返す乱数関数。テストでは固定値を渡す */
export type Random = () => number;

function identity<K extends string>(keys: readonly K[]): Record<K, K> {
  return Object.fromEntries(keys.map((k) => [k, k])) as Record<K, K>;
}

export function identityVowelMap(): VowelMap {
  return identity(VOWELS);
}

export function identityConsonantMap(): ConsonantMap {
  return identity(CONSONANTS);
}

/** 重複なしシャッフル（順列）。Fisher–Yates */
export function shufflePermutation<K extends string>(
  keys: readonly K[],
  random: Random = Math.random,
): Record<K, K> {
  const values = [...keys];
  for (let i = values.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }
  return Object.fromEntries(keys.map((k, i) => [k, values[i]])) as Record<K, K>;
}

/** 重複ありシャッフル。各キーに独立して行き先を選ぶ */
export function shuffleWithDuplicates<K extends string>(
  keys: readonly K[],
  random: Random = Math.random,
): Record<K, K> {
  return Object.fromEntries(
    keys.map((k) => [k, keys[Math.floor(random() * keys.length)]]),
  ) as Record<K, K>;
}

/** 現在の行き先を a→i→u→e→o→a の順に step だけずらす（-1 で逆方向） */
export function shiftVowels(map: VowelMap, step: 1 | -1): VowelMap {
  const n = VOWELS.length;
  return Object.fromEntries(
    VOWELS.map((v) => [v, VOWELS[(VOWELS.indexOf(map[v]) + step + n) % n]]),
  ) as VowelMap;
}
