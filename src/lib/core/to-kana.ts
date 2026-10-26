// ⑨ カタカナに戻す（SPEC §1⑨）

import { REVERSE_TABLE, SMALL_KANA_BY_SPELLING } from './romaji-table';
import type { RomajiUnit, Vowel } from './types';

const VOWEL_KANA: Readonly<Record<Vowel, string>> = { a: 'ア', i: 'イ', u: 'ウ', e: 'エ', o: 'オ' };

/** 戻せない部分（母音が続かない子音・マーカー）は英字のまま出力する */
export function toKana(units: readonly RomajiUnit[]): string {
  let out = '';
  for (let i = 0; i < units.length; i += 1) {
    const unit = units[i];
    switch (unit.kind) {
      case 'choon':
        out += 'ー';
        break;
      case 'sokuon':
        out += 'ッ';
        break;
      case 'hatsuon':
        out += 'ン';
        break;
      case 'vowel':
        out += VOWEL_KANA[unit.value];
        break;
      case 'consonant':
      case 'marker': {
        const next = units[i + 1];
        if (next?.kind !== 'vowel') {
          out += unit.value;
          break;
        }
        const spelling = unit.value + next.value;
        const table = unit.kind === 'marker' ? SMALL_KANA_BY_SPELLING : REVERSE_TABLE;
        out += table.get(spelling) ?? spelling;
        i += 1;
        break;
      }
    }
  }
  return out;
}
