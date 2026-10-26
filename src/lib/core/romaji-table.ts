// かな⇔ローマ字表（SPEC §2）。
// 正規綴りは訓令式を基本とし、訓令式にない音は参照表の綴りを使う。
// https://www.chiba-kc.ac.jp/user/~iseri/siryo/romakana.html

import { VOWELS, type Consonant, type SmallMarker, type Vowel } from './types';

export interface Syllable {
  onset: Consonant | null;
  vowel: Vowel;
}

/** 1 文字の音節。'_' は該当なし（ア段〜オ段の順） */
const BASIC_ROWS: ReadonlyArray<[Consonant | null, string]> = [
  [null, 'アイウエオ'],
  ['k', 'カキクケコ'],
  ['s', 'サシスセソ'],
  ['t', 'タチツテト'],
  ['n', 'ナニヌネノ'],
  ['h', 'ハヒフヘホ'],
  ['m', 'マミムメモ'],
  ['y', 'ヤ_ユ_ヨ'],
  ['r', 'ラリルレロ'],
  ['w', 'ワヰ_ヱヲ'],
  ['g', 'ガギグゲゴ'],
  ['z', 'ザジズゼゾ'],
  ['d', 'ダヂヅデド'],
  ['b', 'バビブベボ'],
  ['p', 'パピプペポ'],
];

/** 小書き母音（ア段〜オ段の順）。拗音・外来音の 2 文字目に使う */
const SMALL_YA = 'ャィュェョ';
const SMALL_A = 'ァィゥェォ';

/** 2 文字の音節：[子音, 1 文字目, 2 文字目の候補（ア段〜オ段、'_' は該当なし）] */
const DIGRAPH_ROWS: ReadonlyArray<[Consonant, string, string]> = [
  // 拗音
  ['ky', 'キ', SMALL_YA],
  ['sy', 'シ', SMALL_YA],
  ['ty', 'チ', SMALL_YA],
  ['ny', 'ニ', SMALL_YA],
  ['hy', 'ヒ', SMALL_YA],
  ['my', 'ミ', SMALL_YA],
  ['ry', 'リ', SMALL_YA],
  ['gy', 'ギ', SMALL_YA],
  ['zy', 'ジ', SMALL_YA],
  ['dy', 'ヂ', SMALL_YA],
  ['by', 'ビ', SMALL_YA],
  ['py', 'ピ', SMALL_YA],
  // 外来音
  ['f', 'フ', 'ァィ_ェォ'],
  ['fy', 'フ', 'ャ_ュ_ョ'],
  ['v', 'ヴ', 'ァィ_ェォ'],
  ['vy', 'ヴ', 'ャ_ュ_ョ'],
  ['ts', 'ツ', 'ァィ_ェォ'],
  ['th', 'テ', SMALL_YA],
  ['dh', 'デ', SMALL_YA],
  ['tw', 'ト', SMALL_A],
  ['dw', 'ド', SMALL_A],
  ['qw', 'ク', SMALL_A],
  ['gw', 'グ', SMALL_A],
  ['sw', 'ス', SMALL_A],
  ['wh', 'ウ', 'ァィ_ェォ'],
  ['y', 'イ', '___ェ_'],
];

function buildKanaTable(): Map<string, Syllable> {
  const table = new Map<string, Syllable>();
  for (const [onset, kanas] of BASIC_ROWS) {
    [...kanas].forEach((kana, i) => {
      if (kana !== '_') table.set(kana, { onset, vowel: VOWELS[i] });
    });
  }
  table.set('ヴ', { onset: 'v', vowel: 'u' });
  for (const [onset, first, seconds] of DIGRAPH_ROWS) {
    [...seconds].forEach((second, i) => {
      if (second !== '_') table.set(first + second, { onset, vowel: VOWELS[i] });
    });
  }
  return table;
}

/** かな（カタカナ 1〜2 文字）→ 音節 */
export const KANA_TABLE: ReadonlyMap<string, Syllable> = buildKanaTable();

/** 単独の小書き文字（SPEC §1②） */
export const SMALL_KANA: ReadonlyMap<string, { marker: SmallMarker; vowel: Vowel }> = new Map([
  ['ァ', { marker: 'x', vowel: 'a' }],
  ['ィ', { marker: 'x', vowel: 'i' }],
  ['ゥ', { marker: 'x', vowel: 'u' }],
  ['ェ', { marker: 'x', vowel: 'e' }],
  ['ォ', { marker: 'x', vowel: 'o' }],
  ['ャ', { marker: 'xy', vowel: 'a' }],
  ['ュ', { marker: 'xy', vowel: 'u' }],
  ['ョ', { marker: 'xy', vowel: 'o' }],
]);

/** マーカー＋母音 → 小書き文字（SPEC §1⑨） */
export const SMALL_KANA_BY_SPELLING: ReadonlyMap<string, string> = new Map([
  ['xa', 'ァ'],
  ['xi', 'ィ'],
  ['xu', 'ゥ'],
  ['xe', 'ェ'],
  ['xo', 'ォ'],
  ['xya', 'ャ'],
  ['xyi', 'ィ'],
  ['xyu', 'ュ'],
  ['xye', 'ェ'],
  ['xyo', 'ョ'],
]);

/**
 * 参照表にある正規綴り以外の綴り（SPEC §2.3）。
 * 同じ綴りに複数のかなが対応する場合は、ここの値を優先する。
 */
const ALIASES: Readonly<Record<string, string>> = {
  // ヘボン式
  shi: 'シ', chi: 'チ', tsu: 'ツ', fu: 'フ', ji: 'ジ',
  sha: 'シャ', shu: 'シュ', she: 'シェ', sho: 'ショ',
  cha: 'チャ', chu: 'チュ', che: 'チェ', cho: 'チョ',
  ja: 'ジャ', ju: 'ジュ', je: 'ジェ', jo: 'ジョ',
  // 別綴り
  yi: 'イ', wu: 'ウ', whu: 'ウ', wi: 'ウィ', we: 'ウェ',
  ca: 'カ', cu: 'ク', co: 'コ', qu: 'ク', ci: 'シ', ce: 'セ',
  qa: 'クァ', qi: 'クィ', qe: 'クェ', qo: 'クォ',
  qyi: 'クィ', qye: 'クェ', qya: 'クャ', qyu: 'クュ', qyo: 'クョ',
  cya: 'チャ', cyi: 'チィ', cyu: 'チュ', cye: 'チェ', cyo: 'チョ',
  fwa: 'ファ', fwi: 'フィ', fwu: 'フゥ', fwe: 'フェ', fwo: 'フォ',
  fyi: 'フィ', fye: 'フェ', vyi: 'ヴィ', vye: 'ヴェ',
};

function buildReverseTable(): Map<string, string> {
  const table = new Map<string, string>();
  for (const [kana, { onset, vowel }] of KANA_TABLE) {
    const spelling = (onset ?? '') + vowel;
    if (!table.has(spelling)) table.set(spelling, kana);
  }
  for (const [spelling, kana] of Object.entries(ALIASES)) table.set(spelling, kana);
  return table;
}

/** 綴り → カタカナ（SPEC §2.3） */
export const REVERSE_TABLE: ReadonlyMap<string, string> = buildReverseTable();
