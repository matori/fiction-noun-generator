// ⑦ 置換（SPEC §1⑦）

import type { ConsonantMap, RomajiUnit, VowelMap } from './types';

/** 母音・子音だけを置き換える。マーカーと `ー` `ッ` `ン` はそのまま */
export function substitute(
  units: readonly RomajiUnit[],
  vowelMap: VowelMap,
  consonantMap: ConsonantMap,
): RomajiUnit[] {
  return units.map((unit) => {
    if (unit.kind === 'vowel') return { ...unit, value: vowelMap[unit.value] };
    if (unit.kind === 'consonant') return { ...unit, value: consonantMap[unit.value] };
    return unit;
  });
}
