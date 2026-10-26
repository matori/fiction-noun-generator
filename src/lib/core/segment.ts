// ① 区切り分割（SPEC §1①）

export type Part = { type: 'word'; text: string } | { type: 'separator'; text: string };

const HIRAGANA_TO_KATAKANA = 0x60;

/** ひらがな（ぁ〜ゖ）、カタカナ（ァ〜ヶ）、`ー` をかな文字とする */
export function isKanaChar(ch: string): boolean {
  const code = ch.codePointAt(0)!;
  return (
    (code >= 0x3041 && code <= 0x3096) ||
    (code >= 0x30a1 && code <= 0x30f6) ||
    code === 0x30fc
  );
}

const NORMALIZE: Readonly<Record<string, string>> = { 'ヵ': 'カ', 'ヶ': 'ケ', 'ヮ': 'ワ' };

/** ひらがなをカタカナにし、`ヵ` `ヶ` `ヮ` を通常の文字にする */
export function normalizeKana(text: string): string {
  return [...text]
    .map((ch) => {
      const code = ch.codePointAt(0)!;
      const kata =
        code >= 0x3041 && code <= 0x3096 ? String.fromCodePoint(code + HIRAGANA_TO_KATAKANA) : ch;
      return NORMALIZE[kata] ?? kata;
    })
    .join('');
}

/** 連続するかな文字を 1 語とし、それ以外を区切り文字として分ける */
export function splitParts(input: string): Part[] {
  const parts: Part[] = [];
  for (const ch of input) {
    const type = isKanaChar(ch) ? 'word' : 'separator';
    const last = parts.at(-1);
    if (last?.type === type) last.text += ch;
    else parts.push({ type, text: ch });
  }
  return parts;
}
