import { describe, expect, it } from 'vitest';
import { identityConsonantMap, identityVowelMap } from './mapping';
import { convert } from './pipeline';
import type { ConsonantMap, ConversionOptions, VowelMap } from './types';

function options(
  overrides: Partial<Omit<ConversionOptions, 'vowelMap' | 'consonantMap'>> & {
    vowelMap?: Partial<VowelMap>;
    consonantMap?: Partial<ConsonantMap>;
  } = {},
): ConversionOptions {
  const { vowelMap, consonantMap, ...rest } = overrides;
  return {
    reverse: 'none',
    moveLeadingVowel: false,
    trailingChoon: 'keep',
    ...rest,
    vowelMap: { ...identityVowelMap(), ...vowelMap },
    consonantMap: { ...identityConsonantMap(), ...consonantMap },
  };
}

const romajiReverse = { reverse: 'romaji' } as const;
const kanaReverse = { reverse: 'kana' } as const;

// SPEC §9
describe('SPEC §9 テストケース', () => {
  const cases: Array<[string, ConversionOptions, string]> = [
    ['さくら', options(), 'サクラ'],
    ['カ', options({ vowelMap: { a: 'i' }, consonantMap: { k: 's' } }), 'シ'],
    ['サクラ', options(romajiReverse), 'アルカs'],
    ['サクラ', options({ ...romajiReverse, moveLeadingVowel: true }), 'ルカサ'],
    ['キャク', options(romajiReverse), 'ウカky'],
    ['キャット', options(kanaReverse), 'トッキャ'],
    ['コーヒー', options({ ...kanaReverse, trailingChoon: 'remove' }), 'ヒーコ'],
    ['コーヒー', options({ ...kanaReverse, trailingChoon: 'keep' }), 'ヒーコー'],
    [
      'コーヒー',
      options({ ...romajiReverse, moveLeadingVowel: true, trailingChoon: 'keep' }),
      'hーオキー',
    ],
    ['ストレイ・キャット', options(kanaReverse), 'イレトス・トッキャ'],
    ['アサ', options({ ...romajiReverse, moveLeadingVowel: true }), 'サア'],
    ['サア', options({ ...romajiReverse, moveLeadingVowel: true }), 'アアs'],
    ['ァ', options({ vowelMap: { a: 'i' } }), 'ィ'],
    ['カァ', options(romajiReverse), 'アァk'],
    ['カァ', options({ ...romajiReverse, moveLeadingVowel: true }), 'ァカ'],
    ['アャ', options({ vowelMap: { a: 'o' } }), 'オョ'],
    ['アャ', options({ vowelMap: { a: 'i' } }), 'イィ'],
    ['ヵ', options(), 'カ'],
  ];

  it.each(cases)('%s → %s', (input, opts, expected) => {
    expect(convert(input, opts).output).toBe(expected);
  });
});

describe('途中経過', () => {
  it('反転なしでは reversed が null', () => {
    const result = convert('さくら', options({ vowelMap: { a: 'i' }, consonantMap: { k: 's', r: 'm' } }));
    expect(result.romaji.text).toBe('sakura');
    expect(result.reversed).toBeNull();
    expect(result.substituted.text).toBe('sisumi');
    expect(result.output).toBe('シスミ');
  });

  it('ー ッ ン はかなのまま表示する', () => {
    const { romaji } = convert('キャットーン', options());
    expect(romaji.text).toBe('kyaッtoーン');
    expect(romaji.tokens).toEqual([
      { kind: 'romaji', text: 'kya' },
      { kind: 'special', text: 'ッ' },
      { kind: 'romaji', text: 'to' },
      { kind: 'special', text: 'ー' },
      { kind: 'special', text: 'ン' },
    ]);
  });

  it('小書きマーカーと区切り文字は別のトークン', () => {
    expect(convert('アャ・カ', options()).romaji.tokens).toEqual([
      { kind: 'romaji', text: 'a' },
      { kind: 'marker', text: 'xy' },
      { kind: 'romaji', text: 'a' },
      { kind: 'separator', text: '・' },
      { kind: 'romaji', text: 'ka' },
    ]);
  });

  it('反転後の表示には保持した末尾ーを含む', () => {
    const result = convert('コーヒー', options({ ...romajiReverse, moveLeadingVowel: true }));
    expect(result.romaji.text).toBe('koーhiー');
    expect(result.reversed?.text).toBe('hーokiー');
  });

  it('区切り文字は各段階にそのまま残る', () => {
    const result = convert('かな 漢字カナ', options(kanaReverse));
    expect(result.romaji.text).toBe('kana 漢字kana');
    expect(result.reversed?.text).toBe('naka 漢字naka');
    expect(result.output).toBe('ナカ 漢字ナカ');
  });
});

describe('かな → ローマ字', () => {
  it.each([
    ['しちつふじ', 'sitituhuzi'],
    ['ぢづを', 'diduwo'],
    ['しゃちゃじゃ', 'syatyazya'],
    ['ファフィフェフォ', 'fafifefo'],
    ['ティディトゥドゥ', 'thidhitwudwu'],
    ['ヴァヴヴュ', 'vavuvyu'],
    ['ツァクァグァスィ', 'tsaqwagwaswi'],
    ['ウィウェイェ', 'whiwheye'],
    ['フゥ', 'huxu'],
  ])('%s → %s', (input, romaji) => {
    expect(convert(input, options()).romaji.text).toBe(romaji);
  });
});

describe('無変換で元に戻る', () => {
  it.each(['サクラ', 'キャット', 'ティラミス', 'ヴァイオリン', 'ツァーリ', 'シェフ', 'ジョー', 'ヂャヅ', 'ヲ'])(
    '%s',
    (input) => {
      expect(convert(input, options()).output).toBe(input);
    },
  );
});

describe('置換', () => {
  it('子音プール内なら拗音・拡張にも置き換えられる', () => {
    expect(convert('カ', options({ consonantMap: { k: 'ky' } })).output).toBe('キャ');
    expect(convert('キャ', options({ consonantMap: { ky: 'm' } })).output).toBe('マ');
    expect(convert('タ', options({ consonantMap: { t: 'th' }, vowelMap: { a: 'i' } })).output).toBe(
      'ティ',
    );
  });

  it('正規綴りにない組み合わせは別綴りで戻す', () => {
    expect(convert('カ', options({ consonantMap: { k: 'y' }, vowelMap: { a: 'i' } })).output).toBe('イ');
    expect(convert('カ', options({ consonantMap: { k: 'w' }, vowelMap: { a: 'i' } })).output).toBe(
      'ウィ',
    );
    expect(convert('サ', options({ consonantMap: { s: 'ts' }, vowelMap: { a: 'u' } })).output).toBe(
      'ツ',
    );
    expect(convert('ハ', options({ consonantMap: { h: 'f' }, vowelMap: { a: 'u' } })).output).toBe(
      'フ',
    );
  });

  it('ー ッ ン は置換しない', () => {
    expect(convert('カッター', options({ vowelMap: { a: 'o' } })).output).toBe('コットー');
    expect(convert('アン', options({ vowelMap: { a: 'e' } })).output).toBe('エン');
  });
});

describe('反転', () => {
  it('末尾ーは反転なしのときは処理しない', () => {
    expect(convert('コーヒー', options({ trailingChoon: 'remove' })).output).toBe('コーヒー');
  });

  it('連続する末尾ーはすべて対象', () => {
    expect(convert('アーー', options({ ...kanaReverse, trailingChoon: 'remove' })).output).toBe('ア');
    expect(convert('カキーー', options({ ...kanaReverse, trailingChoon: 'keep' })).output).toBe('キカーー');
  });

  it('かな反転では ー ッ ン が独立して動く', () => {
    expect(convert('コーヒ', options(kanaReverse)).output).toBe('ヒーコ');
    expect(convert('ホンダ', options(kanaReverse)).output).toBe('ダンホ');
  });

  it('先頭母音の移動はかな反転では効かない', () => {
    expect(convert('サクラ', options({ ...kanaReverse, moveLeadingVowel: true })).output).toBe('ラクサ');
  });

  it('反転後に置換する', () => {
    // サクラ → arukas → (a→o, k→t) → orutos
    const result = convert('サクラ', options({ ...romajiReverse, vowelMap: { a: 'o' }, consonantMap: { k: 't' } }));
    expect(result.reversed?.text).toBe('arukas');
    expect(result.substituted.text).toBe('orutos');
    expect(result.output).toBe('オルトs');
  });
});

describe('入力', () => {
  it('空文字', () => {
    expect(convert('', options()).output).toBe('');
  });

  it('かながない入力はそのまま', () => {
    expect(convert('漢字 abc', options()).output).toBe('漢字 abc');
  });

  it('ひらがなもカタカナで出力する', () => {
    expect(convert('ゔぁ', options()).output).toBe('ヴァ');
  });
});
