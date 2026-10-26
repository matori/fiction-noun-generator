// OGP 画像と apple-touch-icon を作る（SPEC §7）。
// 一度作った PNG を public/ に置いてコミットする。デザインを変えたら作り直す。
//   npm run images
//
// 日本語の文字は Windows に入っている游ゴシックで描く。

import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = (path) => fileURLToPath(new URL(`../${path}`, import.meta.url));

const BRAND = '#0f6cbd';
const BRAND_DARK = '#0a4f8c';
const DEEP = '#0a2e4a';

const FONT_FILES = ['C:/Windows/Fonts/YuGothB.ttc', 'C:/Windows/Fonts/YuGothM.ttc'];
const FONT_FAMILY = 'Yu Gothic';

// 背景に並べる変換例。アプリの変換処理（src/lib/core）で実際に変換する。
// 設定: 母音を 1 つ進め、子音を d→p・n→r・b→my・g→ny
const EXAMPLE_INPUTS = [
  'おだ・のぶなが', 'とくがわ・いえやす', 'とよとみ・ひでよし', 'さかもと・りょうま',
  'みやもと・むさし', 'たけだ・しんげん', 'うえすぎ・けんしん', 'だて・まさむね',
  'さなだ・ゆきむら', 'あけち・みつひで', 'きょうと', 'ほっかいどう', 'おおさか',
  'ふじさん', 'さくら', 'つばき', 'かぐや', 'すずめ',
];
const TAGLINE = '日本語テキストから架空っぽいテキストを生成';
const TITLE_LINES = ['創作名詞', 'ジェネレーター'];

/** アプリのアイコン（32×32 の SVG）の中身を取り出す */
function iconInner({ rounded }) {
  const svg = readFileSync(root('src/assets/app-icon.svg'), 'utf8');
  const inner = svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  return rounded ? inner : inner.replace(/ rx="7"/, '');
}

function render(svg, width) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
    font: { fontFiles: FONT_FILES, loadSystemFonts: false, defaultFontFamily: FONT_FAMILY },
  });
  return resvg.render().asPng();
}

async function convertExamples() {
  const server = await createServer({
    configFile: false,
    appType: 'custom',
    logLevel: 'error',
    server: { middlewareMode: true, hmr: false, ws: false },
    optimizeDeps: { noDiscovery: true, include: [] },
  });
  try {
    const core = await server.ssrLoadModule('/src/lib/core/index.ts');
    const options = {
      vowelMap: core.shiftVowels(core.identityVowelMap(), 1),
      consonantMap: { ...core.identityConsonantMap(), d: 'p', n: 'r', b: 'my', g: 'ny' },
      reverse: 'none',
      moveLeadingVowel: false,
      trailingChoon: 'keep',
    };
    return EXAMPLE_INPUTS.map((input) => ({ input, output: core.convert(input, options).output }));
  } finally {
    await server.close();
  }
}

/** 背景：変換例を薄い文字で斜めに敷き詰める */
function backgroundExamples(examples, W, H) {
  const size = 26;
  const rowHeight = 50;
  const rows = [];
  for (let r = 0, y = -120; y < H + 160; r += 1, y += rowHeight) {
    // 行ごとに例の並びと左端をずらして、同じ並びが縦にそろわないようにする
    const shifted = [...examples.slice((r * 5) % examples.length), ...examples.slice(0, (r * 5) % examples.length)];
    const spans = [...shifted, ...shifted]
      .map(
        ({ input, output }) =>
          `<tspan fill-opacity="0.12">${input} → </tspan><tspan fill-opacity="0.22" font-weight="700">${output}</tspan><tspan>　　　</tspan>`,
      )
      .join('');
    rows.push(`<text x="${-400 - (r % 3) * 180}" y="${y}" font-size="${size}" font-family="${FONT_FAMILY}" fill="#ffffff">${spans}</text>`);
  }
  return `<g transform="rotate(-8 ${W / 2} ${H / 2})">${rows.join('')}</g>`;
}

function ogpSvg(examples) {
  const W = 1200;
  const H = 630;
  const panel = { w: 760, h: 300 };
  panel.x = (W - panel.w) / 2;
  panel.y = (H - panel.h) / 2;
  const icon = 132;
  const iconX = panel.x + 64;
  const iconY = panel.y + 48;
  const titleX = iconX + icon + 36;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${BRAND}"/>
      <stop offset="1" stop-color="${BRAND_DARK}"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="20" flood-color="${DEEP}" flood-opacity="0.45"/>
    </filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>

  <!-- 背景：薄い文字の変換例 -->
  ${backgroundExamples(examples, W, H)}

  <!-- 中央：ロゴ、アプリ名、概要 -->
  <rect x="${panel.x}" y="${panel.y}" width="${panel.w}" height="${panel.h}" rx="28" fill="${BRAND}" filter="url(#shadow)"/>
  <rect x="${iconX - 5}" y="${iconY - 5}" width="${icon + 10}" height="${icon + 10}" rx="${(icon + 10) * 0.22}" fill="#ffffff" fill-opacity="0.9"/>
  <svg x="${iconX}" y="${iconY}" width="${icon}" height="${icon}" viewBox="0 0 32 32">${iconInner({ rounded: true })}</svg>
  <text font-size="64" font-weight="700" font-family="${FONT_FAMILY}" fill="#ffffff">
    <tspan x="${titleX}" y="${iconY + 56}">${TITLE_LINES[0]}</tspan>
    <tspan x="${titleX}" y="${iconY + 56 + 76}">${TITLE_LINES[1]}</tspan>
  </text>
  <text x="${W / 2}" y="${panel.y + panel.h - 44}" font-size="32" font-weight="500" text-anchor="middle" font-family="${FONT_FAMILY}" fill="#ffffff" fill-opacity="0.9">${TAGLINE}</text>
</svg>`;
}

/** iOS が角を丸めるので、角丸なしの全面青のアイコンにする */
function appleTouchIconSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">${iconInner({ rounded: false })}</svg>`;
}

const examples = await convertExamples();
writeFileSync(root('public/ogp.png'), render(ogpSvg(examples), 1200));
writeFileSync(root('public/apple-touch-icon.png'), render(appleTouchIconSvg(), 180));
console.log('public/ogp.png, public/apple-touch-icon.png を書き出しました');
