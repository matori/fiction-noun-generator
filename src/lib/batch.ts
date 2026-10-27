// テキストの一括変換（SPEC §6.8）。ファイルの読み取りと 1 行ごとの変換。DOM には依存しない

import { convert } from './core';
import { formatPairs, withFooter, type OutputFormat, type Pair } from './settings/output-format';
import type { Settings } from './settings/settings';

export const MAX_BYTES = 1_000_000;
export const MAX_LINES = 10_000;

const TEXT_EXTENSIONS = ['txt', 'text', 'csv', 'tsv', 'md'];

export type TextEncodingName = 'UTF-8' | 'Shift_JIS';

/** テキストのファイルとして受け付けるか（MIME タイプか拡張子で判断） */
export function isTextFile(name: string, type: string): boolean {
  if (type.startsWith('text/')) return true;
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  return name.includes('.') && TEXT_EXTENSIONS.includes(ext);
}

/** まず UTF-8 として読み、だめなら Shift_JIS として読む */
export function decodeText(bytes: Uint8Array): { text: string; encoding: TextEncodingName } {
  try {
    return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes), encoding: 'UTF-8' };
  } catch {
    return { text: new TextDecoder('shift_jis').decode(bytes), encoding: 'Shift_JIS' };
  }
}

/** 改行コード（CRLF / LF / CR）の違いと先頭の BOM を吸収して行に分ける。末尾の改行は行に数えない */
export function splitLines(text: string): string[] {
  const body = text.replace(/^﻿/, '');
  if (body === '') return [];
  const lines = body.split(/\r\n|\n|\r/);
  if (lines.at(-1) === '') lines.pop();
  return lines;
}

/** 1 行ずつ変換する。空行は空行のまま、かなのない行はそのまま */
export function convertLines(lines: readonly string[], settings: Settings): Pair[] {
  return lines.map((line) =>
    line === '' ? { input: '', output: '' } : { input: line, output: convert(line, settings).output },
  );
}

export function buildBatchOutput(pairs: readonly Pair[], format: OutputFormat, footer: string | null): string {
  return withFooter(formatPairs(pairs, format), footer);
}

/** ダウンロードのファイル名。例: names.txt → names-converted.txt（形式がタブ／コンマ区切りなら .tsv / .csv） */
export function downloadFileName(sourceName: string | null, format: OutputFormat): string {
  const ext = format === 'tsv' ? 'tsv' : format === 'csv' ? 'csv' : 'txt';
  const base = sourceName ? sourceName.replace(/\.[^.]+$/, '') : 'text';
  return `${base}-converted.${ext}`;
}

export type FileCheck = { ok: true } | { ok: false; message: string };

export function checkFileSize(bytes: number): FileCheck {
  return bytes > MAX_BYTES
    ? { ok: false, message: 'ファイルが大きすぎます（1MB まで）。' }
    : { ok: true };
}

export function checkLineCount(lines: number): FileCheck {
  return lines > MAX_LINES
    ? { ok: false, message: `行数が多すぎます（${MAX_LINES.toLocaleString()} 行まで）。` }
    : { ok: true };
}
