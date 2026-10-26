// 設定の要約（履歴の表示用）

import { CONSONANTS, VOWELS, type Consonant, type Vowel } from '../core';
import type { Settings } from './settings';

export interface SettingsSummary {
  /** 例: ['ローマ字反転', '母音移動', '末尾ー保持'] */
  options: string[];
  vowelChanges: Array<[Vowel, Vowel]>;
  consonantChanges: Array<[Consonant, Consonant]>;
}

const REVERSE_LABELS = { none: '反転なし', kana: 'かな反転', romaji: 'ローマ字反転' } as const;

export function summarizeSettings(settings: Settings): SettingsSummary {
  const options: string[] = [REVERSE_LABELS[settings.reverse]];
  if (settings.reverse === 'romaji' && settings.moveLeadingVowel) options.push('母音移動');
  if (settings.reverse !== 'none') {
    options.push(settings.trailingChoon === 'keep' ? '末尾ー保持' : '末尾ー削除');
  }
  return {
    options,
    vowelChanges: VOWELS.filter((v) => settings.vowelMap[v] !== v).map((v) => [v, settings.vowelMap[v]]),
    consonantChanges: CONSONANTS.filter((c) => settings.consonantMap[c] !== c).map((c) => [
      c,
      settings.consonantMap[c],
    ]),
  };
}

/** 1 行の要約。例: `ローマ字反転・母音移動 ｜ 母音 2 / 子音 5 変更` */
export function formatSummary(summary: SettingsSummary): string {
  const v = summary.vowelChanges.length;
  const c = summary.consonantChanges.length;
  const mapping = v === 0 && c === 0 ? 'マッピング変更なし' : `母音 ${v} / 子音 ${c} 変更`;
  return `${summary.options.join('・')} ｜ ${mapping}`;
}
