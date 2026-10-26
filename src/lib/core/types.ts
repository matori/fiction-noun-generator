export const VOWELS = ['a', 'i', 'u', 'e', 'o'] as const;
export type Vowel = (typeof VOWELS)[number];

/** 子音プール（SPEC §2.4）。基本・拗音・拡張を同じプールで扱う */
export const CONSONANT_GROUPS = {
  basic: ['k', 's', 't', 'n', 'h', 'm', 'y', 'r', 'w', 'g', 'z', 'd', 'b', 'p'],
  youon: ['ky', 'sy', 'ty', 'ny', 'hy', 'my', 'ry', 'gy', 'zy', 'dy', 'by', 'py'],
  extended: ['f', 'fy', 'v', 'vy', 'ts', 'th', 'dh', 'tw', 'dw', 'qw', 'gw', 'sw', 'wh'],
} as const;

export type ConsonantGroup = keyof typeof CONSONANT_GROUPS;
export type Consonant = (typeof CONSONANT_GROUPS)[ConsonantGroup][number];

export const CONSONANTS: readonly Consonant[] = [
  ...CONSONANT_GROUPS.basic,
  ...CONSONANT_GROUPS.youon,
  ...CONSONANT_GROUPS.extended,
];

/** 単独の小書き文字を表すマーカー（SPEC §1②）。子音プールには含めない */
export type SmallMarker = 'x' | 'xy';

export type VowelMap = Record<Vowel, Vowel>;
export type ConsonantMap = Record<Consonant, Consonant>;

export type ReverseMode = 'none' | 'kana' | 'romaji';
export type TrailingChoonMode = 'remove' | 'keep';

export interface ConversionOptions {
  vowelMap: VowelMap;
  consonantMap: ConsonantMap;
  reverse: ReverseMode;
  /** ローマ字反転のときだけ有効 */
  moveLeadingVowel: boolean;
  /** 反転ありのときだけ有効 */
  trailingChoon: TrailingChoonMode;
}

/** ② かなの単位。`ー` `ッ` `ン` は独立した単位 */
export type KanaUnit =
  | { kind: 'mora'; kana: string; onset: Consonant | SmallMarker | null; vowel: Vowel }
  | { kind: 'sokuon' }
  | { kind: 'hatsuon' }
  | { kind: 'choon' };

/** ⑤ ローマ字の単位。子音は複数文字でも 1 単位 */
export type RomajiUnit =
  | { kind: 'consonant'; value: Consonant }
  | { kind: 'marker'; value: SmallMarker }
  /** attached: 元が子音（またはマーカー）と組んでいたか。先頭母音移動で使う */
  | { kind: 'vowel'; value: Vowel; attached: boolean }
  | { kind: 'sokuon' }
  | { kind: 'hatsuon' }
  | { kind: 'choon' };
