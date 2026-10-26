// ② かな → 単位列、⑤ ローマ字単位列（SPEC §1②⑤）

import { KANA_TABLE, SMALL_KANA } from './romaji-table';
import type { KanaUnit, RomajiUnit } from './types';

/** 正規化済みのカタカナ 1 語を最長一致で単位に分ける */
export function parseKana(word: string): KanaUnit[] {
  const chars = [...word];
  const units: KanaUnit[] = [];
  let i = 0;
  while (i < chars.length) {
    const pair = chars[i] + (chars[i + 1] ?? '');
    const digraph = chars[i + 1] ? KANA_TABLE.get(pair) : undefined;
    if (digraph) {
      units.push({ kind: 'mora', kana: pair, ...digraph });
      i += 2;
      continue;
    }
    const ch = chars[i];
    i += 1;
    if (ch === 'ー') units.push({ kind: 'choon' });
    else if (ch === 'ッ') units.push({ kind: 'sokuon' });
    else if (ch === 'ン') units.push({ kind: 'hatsuon' });
    else {
      const small = SMALL_KANA.get(ch);
      if (small) {
        units.push({ kind: 'mora', kana: ch, onset: small.marker, vowel: small.vowel });
        continue;
      }
      const syllable = KANA_TABLE.get(ch);
      if (!syllable) throw new Error(`未対応のかな: ${ch}`);
      units.push({ kind: 'mora', kana: ch, ...syllable });
    }
  }
  return units;
}

export function toRomajiUnits(units: readonly KanaUnit[]): RomajiUnit[] {
  return units.flatMap((unit): RomajiUnit[] => {
    if (unit.kind !== 'mora') return [unit];
    if (unit.onset === null) return [{ kind: 'vowel', value: unit.vowel, attached: false }];
    const onset: RomajiUnit =
      unit.onset === 'x' || unit.onset === 'xy'
        ? { kind: 'marker', value: unit.onset }
        : { kind: 'consonant', value: unit.onset };
    return [onset, { kind: 'vowel', value: unit.vowel, attached: true }];
  });
}

/**
 * 途中経過の表示用トークン。
 * - romaji: 置換の対象（子音・母音）
 * - special: `ー` `ッ` `ン`。かなのまま表示する
 * - marker: 小書きマーカー `x` `xy`（置換しない）
 * - separator: 区切り文字
 */
export interface DisplayToken {
  kind: 'romaji' | 'special' | 'marker' | 'separator';
  text: string;
}

const SPECIAL_KANA = { choon: 'ー', sokuon: 'ッ', hatsuon: 'ン' } as const;

/** 同じ種類が続くトークンはまとめる */
export function pushToken(tokens: DisplayToken[], token: DisplayToken): void {
  const last = tokens.at(-1);
  if (last && last.kind === token.kind && token.kind !== 'special') last.text += token.text;
  else tokens.push({ ...token });
}

export function toDisplayTokens(units: readonly RomajiUnit[]): DisplayToken[] {
  const tokens: DisplayToken[] = [];
  for (const unit of units) {
    if (unit.kind === 'consonant' || unit.kind === 'vowel') {
      pushToken(tokens, { kind: 'romaji', text: unit.value });
    } else if (unit.kind === 'marker') {
      pushToken(tokens, { kind: 'marker', text: unit.value });
    } else {
      pushToken(tokens, { kind: 'special', text: SPECIAL_KANA[unit.kind] });
    }
  }
  return tokens;
}
