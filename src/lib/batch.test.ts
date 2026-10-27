import { describe, expect, it } from 'vitest';
import {
  MAX_BYTES,
  MAX_LINES,
  buildBatchOutput,
  checkFileSize,
  checkLineCount,
  convertLines,
  decodeText,
  downloadFileName,
  isTextFile,
  splitLines,
} from './batch';
import { defaultSettings } from './settings/settings';

describe('isTextFile', () => {
  it('テキストの MIME タイプか拡張子なら受け付ける', () => {
    expect(isTextFile('a.bin', 'text/plain')).toBe(true);
    expect(isTextFile('names.TXT', '')).toBe(true);
    expect(isTextFile('list.csv', 'application/vnd.ms-excel')).toBe(true);
    expect(isTextFile('photo.png', 'image/png')).toBe(false);
    expect(isTextFile('txt', '')).toBe(false);
  });
});

describe('decodeText', () => {
  it('UTF-8', () => {
    expect(decodeText(new TextEncoder().encode('さくら'))).toEqual({ text: 'さくら', encoding: 'UTF-8' });
  });

  it('UTF-8 として読めなければ Shift_JIS', () => {
    const sjis = new Uint8Array([0x82, 0xb3, 0x82, 0xad, 0x82, 0xe7]);
    expect(decodeText(sjis)).toEqual({ text: 'さくら', encoding: 'Shift_JIS' });
  });
});

describe('splitLines', () => {
  it('改行コードの違いと BOM を吸収し、末尾の改行は数えない', () => {
    expect(splitLines('﻿あ\r\nい\nう\rえ\n')).toEqual(['あ', 'い', 'う', 'え']);
  });

  it('途中の空行は残す', () => {
    expect(splitLines('あ\n\nい')).toEqual(['あ', '', 'い']);
  });

  it('空のテキストは 0 行', () => {
    expect(splitLines('')).toEqual([]);
    expect(splitLines('﻿')).toEqual([]);
  });
});

describe('convertLines / buildBatchOutput', () => {
  const pairs = convertLines(['さくら', '', 'ABC', 'かな・カナ'], defaultSettings());

  it('空行は空行のまま、かなのない行はそのまま', () => {
    expect(pairs).toEqual([
      { input: 'さくら', output: 'サクラ' },
      { input: '', output: '' },
      { input: 'ABC', output: 'ABC' },
      { input: 'かな・カナ', output: 'カナ・カナ' },
    ]);
  });

  it('形式とフッター', () => {
    expect(buildBatchOutput(pairs, 'arrow', null)).toBe('さくら → サクラ\n\nABC → ABC\nかな・カナ → カナ・カナ');
    expect(buildBatchOutput(pairs.slice(0, 1), 'output', '----')).toBe('サクラ\n\n----');
  });
});

describe('downloadFileName', () => {
  it('元のファイル名に -converted を付け、形式に合わせた拡張子にする', () => {
    expect(downloadFileName('names.txt', 'output')).toBe('names-converted.txt');
    expect(downloadFileName('names.txt', 'tsv')).toBe('names-converted.tsv');
    expect(downloadFileName('list.v2.csv', 'csv')).toBe('list.v2-converted.csv');
    expect(downloadFileName(null, 'arrow')).toBe('text-converted.txt');
  });
});

describe('上限', () => {
  it('1MB・1 万行まで', () => {
    expect(checkFileSize(MAX_BYTES).ok).toBe(true);
    expect(checkFileSize(MAX_BYTES + 1).ok).toBe(false);
    expect(checkLineCount(MAX_LINES).ok).toBe(true);
    expect(checkLineCount(MAX_LINES + 1).ok).toBe(false);
  });
});
