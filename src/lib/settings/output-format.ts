// コピー・一括変換の出力形式とフッター（SPEC §6.7）

import type { Settings } from './settings';
import { buildShareUrl } from './share';
import { summarizeSettings } from './summary';

export const OUTPUT_FORMATS = ['output', 'arrow', 'tsv', 'csv'] as const;
export type OutputFormat = (typeof OUTPUT_FORMATS)[number];

export const OUTPUT_FORMAT_LABELS: Readonly<Record<OutputFormat, string>> = {
  output: '変換後のみ',
  arrow: '変換前 → 変換後',
  tsv: 'タブ区切り',
  csv: 'コンマ区切り',
};

export interface Pair {
  input: string;
  output: string;
}

/** CSV の値。コンマ・引用符・改行・前後の空白を含むときは " で囲む */
function csvField(value: string): string {
  return /[",\r\n]|^\s|\s$/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/** 1 組を 1 行にする。空行（入力が空）は空行のまま */
export function formatPair({ input, output }: Pair, format: OutputFormat): string {
  if (input === '' && output === '') return '';
  switch (format) {
    case 'output':
      return output;
    case 'arrow':
      return `${input} → ${output}`;
    case 'tsv':
      return `${input.replace(/\t/g, ' ')}\t${output.replace(/\t/g, ' ')}`;
    case 'csv':
      return `${csvField(input)},${csvField(output)}`;
  }
}

export function formatPairs(pairs: readonly Pair[], format: OutputFormat): string {
  return pairs.map((pair) => formatPair(pair, format)).join('\n');
}

/** 設定の要約 1 行。例: `反転なし ｜ 母音 a→i i→u ｜ 子音 d→p n→r` */
export function settingsLine(settings: Settings): string {
  const { options, vowelChanges, consonantChanges } = summarizeSettings(settings);
  const pairs = (changes: Array<[string, string]>) => changes.map(([from, to]) => `${from}→${to}`).join(' ');
  const parts = [options.join('・')];
  if (vowelChanges.length > 0) parts.push(`母音 ${pairs(vowelChanges)}`);
  if (consonantChanges.length > 0) parts.push(`子音 ${pairs(consonantChanges)}`);
  if (vowelChanges.length === 0 && consonantChanges.length === 0) parts.push('マッピング変更なし');
  return parts.join(' ｜ ');
}

/** フッター。共有 URL には設定だけを入れ、入力は入れない */
export function buildFooter(settings: Settings, baseUrl: string): string {
  return ['----', `設定: ${settingsLine(settings)}`, `共有URL: ${buildShareUrl(baseUrl, settings, '')}`].join('\n');
}

/** 本文とフッターを空行 1 つ挟んでつなぐ */
export function withFooter(body: string, footer: string | null): string {
  return footer === null ? body : `${body}\n\n${footer}`;
}

export function normalizeOutputFormat(value: unknown): OutputFormat {
  return OUTPUT_FORMATS.includes(value as OutputFormat) ? (value as OutputFormat) : 'output';
}
