// 変換パイプライン全体（SPEC §1）

import { moveLeadingVowel, splitTrailingChoon } from './reverse';
import { normalizeKana, splitParts } from './segment';
import { substitute } from './substitute';
import { toKana } from './to-kana';
import type { ConversionOptions, RomajiUnit } from './types';
import { parseKana, pushToken, toDisplayTokens, toRomajiUnits, type DisplayToken } from './units';

/** 途中経過の 1 段階。text はトークンをつなげた文字列 */
export interface Stage {
  text: string;
  tokens: DisplayToken[];
}

export interface WordResult {
  type: 'word';
  source: string;
  /** 反転前のローマ字 */
  romaji: Stage;
  /** 反転後のローマ字（反転なしのときは null） */
  reversed: Stage | null;
  /** 置換後のローマ字 */
  substituted: Stage;
  output: string;
}

export interface SeparatorResult {
  type: 'separator';
  text: string;
}

export interface ConversionResult {
  parts: Array<WordResult | SeparatorResult>;
  romaji: Stage;
  reversed: Stage | null;
  substituted: Stage;
  output: string;
}

function stage(units: readonly RomajiUnit[]): Stage {
  const tokens = toDisplayTokens(units);
  return { text: tokens.map((t) => t.text).join(''), tokens };
}

function choons(count: number): RomajiUnit[] {
  return Array.from({ length: count }, () => ({ kind: 'choon' }) as const);
}

export function convertWord(word: string, options: ConversionOptions): WordResult {
  const kanaUnits = parseKana(normalizeKana(word));

  let units: RomajiUnit[];
  let keptChoon = 0;
  if (options.reverse === 'none') {
    units = toRomajiUnits(kanaUnits);
  } else {
    // ③ 末尾ー処理 → ④ かな反転 または ⑥ ローマ字反転
    const { body, trailing } = splitTrailingChoon(kanaUnits);
    if (options.trailingChoon === 'keep') keptChoon = trailing;
    if (options.reverse === 'kana') {
      units = toRomajiUnits(body.reverse());
    } else {
      units = toRomajiUnits(body).reverse();
      if (options.moveLeadingVowel) units = moveLeadingVowel(units);
    }
  }

  // ⑦ 置換 → ⑧ 末尾ー再付加 → ⑨ カタカナ化
  const substituted = [
    ...substitute(units, options.vowelMap, options.consonantMap),
    ...choons(keptChoon),
  ];

  return {
    type: 'word',
    source: word,
    romaji: stage(toRomajiUnits(kanaUnits)),
    reversed: options.reverse === 'none' ? null : stage([...units, ...choons(keptChoon)]),
    substituted: stage(substituted),
    output: toKana(substituted),
  };
}

export function convert(input: string, options: ConversionOptions): ConversionResult {
  const parts = splitParts(input).map((part) =>
    part.type === 'word' ? convertWord(part.text, options) : part,
  );

  const join = (pick: (word: WordResult) => Stage): Stage => {
    const tokens: DisplayToken[] = [];
    for (const part of parts) {
      if (part.type === 'separator') pushToken(tokens, { kind: 'separator', text: part.text });
      else for (const token of pick(part).tokens) pushToken(tokens, token);
    }
    return { text: tokens.map((t) => t.text).join(''), tokens };
  };

  return {
    parts,
    romaji: join((w) => w.romaji),
    reversed: options.reverse === 'none' ? null : join((w) => w.reversed!),
    substituted: join((w) => w.substituted),
    output: parts.map((part) => (part.type === 'word' ? part.output : part.text)).join(''),
  };
}
