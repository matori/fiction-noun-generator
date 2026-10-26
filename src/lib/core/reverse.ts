// ③④⑥ 末尾ー・反転・先頭母音移動（SPEC §1③④⑥）

import type { RomajiUnit } from './types';

/** 末尾に連続する `ー` を取り外し、残りと取り外した数を返す */
export function splitTrailingChoon<T extends { kind: string }>(
  units: readonly T[],
): { body: T[]; trailing: number } {
  let end = units.length;
  while (end > 0 && units[end - 1].kind === 'choon') end -= 1;
  return { body: units.slice(0, end), trailing: units.length - end };
}

/** 先頭が「元は子音と組んでいた母音」なら末尾へ移す */
export function moveLeadingVowel(units: readonly RomajiUnit[]): RomajiUnit[] {
  const [first, ...rest] = units;
  if (first?.kind === 'vowel' && first.attached) return [...rest, first];
  return [...units];
}
