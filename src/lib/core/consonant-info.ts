// 子音が表すかなの表示用データ（SPEC §3.3）

import { KANA_TABLE } from './romaji-table';
import { VOWELS, type Consonant } from './types';

/** 子音の隣とセレクトの選択肢に出す代表の 1 音。なるべく見慣れた音を選ぶ */
export const CONSONANT_EXAMPLES: Readonly<Record<Consonant, string>> = {
  k: 'カ', s: 'サ', t: 'タ', n: 'ナ', h: 'ハ', m: 'マ', y: 'ヤ', r: 'ラ', w: 'ワ',
  g: 'ガ', z: 'ザ', d: 'ダ', b: 'バ', p: 'パ',
  ky: 'キャ', sy: 'シャ', ty: 'チャ', ny: 'ニャ', hy: 'ヒャ', my: 'ミャ', ry: 'リャ',
  gy: 'ギャ', zy: 'ジャ', dy: 'ヂャ', by: 'ビャ', py: 'ピャ',
  f: 'ファ', fy: 'フュ', v: 'ヴァ', vy: 'ヴュ', ts: 'ツァ', th: 'ティ', dh: 'ディ',
  tw: 'トゥ', dw: 'ドゥ', qw: 'クァ', gw: 'グァ', sw: 'スィ', wh: 'ウィ',
};

/** その子音を使うかなの一覧（ア段〜オ段の順）。ツールチップ用 */
export function consonantKanaList(consonant: Consonant): string[] {
  return [...KANA_TABLE]
    .filter(([, syllable]) => syllable.onset === consonant)
    .sort(([, a], [, b]) => VOWELS.indexOf(a.vowel) - VOWELS.indexOf(b.vowel))
    .map(([kana]) => kana);
}
