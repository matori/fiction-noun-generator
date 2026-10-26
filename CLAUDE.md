# CLAUDE.md

かな → ローマ字 → 子音・母音置換 → カタカナ で架空の名詞を作る単一ページの Web アプリ。

## 最重要

- **仕様の正は [docs/SPEC.md](docs/SPEC.md)**。変換の挙動を変えるときは、先に SPEC.md を更新し、ユーザーに確認してから実装する。
- 実装中に仕様にない境界ケースが出たら、勝手に決めずにユーザーに聞く。暫定で決める場合は SPEC.md §10 に〔暫定〕として書く。
- ユーザーとのやり取り・ドキュメントは日本語。

## 技術構成

- Vite + Svelte 5（runes）+ TypeScript。SvelteKit は使わない。
- テストは Vitest。
- デザインは Fluent 2。`@fluentui/tokens` を **`1.0.0-alpha.24` に固定**（`^` を付けない）して使い、コンポーネントは自作する。`@fluentui/web-components` やその他の UI ライブラリは入れない。
- パッケージマネージャは npm。開発環境は Windows。

## コマンド

```bash
npm run dev      # 開発サーバー
npm test         # Vitest
npm run check    # svelte-check（型チェック）
npm run build    # 本番ビルド
npm run images   # OGP 画像と apple-touch-icon を作り直す（Windows の游ゴシックを使う）
```

## ディレクトリ

```
src/
  lib/
    core/        # 変換ロジック。純粋な TS。Svelte・DOM・localStorage に依存しない
      types.ts          # 型、子音プール
      romaji-table.ts   # かな⇔ローマ字表（SPEC §2）
      segment.ts        # ① 区切り分割
      units.ts          # ② かな→単位列、⑤ ローマ字単位列
      reverse.ts        # ③⑥ 末尾ー・先頭母音移動
      substitute.ts     # ⑦ 置換
      to-kana.ts        # ⑨ カタカナ化
      pipeline.ts       # 全体（途中経過も返す）
      mapping.ts        # シャッフル・一字ずらし
    settings/    # Settings 型、localStorage、プリセット、JSON 入出力、URL 共有、履歴（純粋関数＋テスト）
    theme/       # トークン → CSS 変数（<style> を注入）、テーマ切替
    ui/          # Fluent 2 風の自作コンポーネント（Button, Card, Select, RadioGroup, Switch, TextField, Dialog, Toast）
    clipboard.ts # コピー、JSON ダウンロード
  components/    # 画面の各カード（変換、オプション、マッピング、保存・共有、履歴、使い方）、復元ダイアログ、保存状態
  app-state.svelte.ts  # 画面全体の状態、前回の作業の自動保存と起動時の復元（SPEC §5.6）
  App.svelte     # レイアウト
  app.css        # 全体の基本スタイル
scripts/generate-images.mjs  # OGP 画像・apple-touch-icon の生成
public/          # favicon.svg、ogp.png、apple-touch-icon.png
docs/SPEC.md
```

- メタ情報・OGP は `index.html` に静的に書く（SPEC §7.1）。`og:url`・`og:image`・`canonical` は絶対 URL。

## テーマとスタイル

- `src/lib/theme/theme.ts` が `webLightTheme` / `webDarkTheme` の全トークンを `--トークン名` の CSS 変数として `:root` に流し込む（例: `var(--colorNeutralBackground1)`）。
- `data-theme` 属性がなければ OS 設定に追従し、`light` / `dark` で手動切替。
- 使える変数名は `@fluentui/tokens` のトークン名そのもの。存在しない名前を使わないこと。
- アイコンは Fluent System Icons（`@fluentui/svg-icons`、`1.1.344` に固定）。使うものだけを `src/lib/ui/icons.ts` で `?raw` 取り込みして登録し、`<Icon>` か `<Button icon="...">` で使う。通常は Regular、状態表示は Filled。サイズはボタンに合わせて 20px（medium）／16px（small）。
- ボタンは必ずラベルとアイコンを併用する。アイコンだけのボタンはダイアログの閉じるボタンのみ。
- 動作確認は `.claude/launch.json` の `dev` で開発サーバーを起動する。

## 実装ルール

- `core/` は副作用なしの関数だけにする。乱数を使う関数（シャッフル）は乱数関数を引数で受け取り、テストで固定できるようにする。
- パイプラインは最終結果だけでなく、各段階の途中経過（ローマ字表示など）も返す。UI はそれを表示するだけにする。
- `ー` `ッ` `ン` は独立した単位として扱い、置換しない（SPEC §1②）。前後の音節にくっつけない。
- 母音単位には「元が子音と組んでいたか」を持たせる（先頭母音移動で使う）。
- SPEC §9 のテストケースは必ずテストにする。仕様を追加・変更したらテストケースも足す。
- localStorage の読み書きは必ず try/catch で囲み、失敗しても動き続けるようにする。キーは `fng:` で始める（SPEC §5.2）。
- 色・余白・角丸・影はトークン由来の CSS 変数だけを使い、値を直書きしない。ライト／ダーク両方で確認する。
- UI の文言は日本語。識別子は英語。
- 変換ルールを変えたら、README の「変換ルール」節とアプリ内の「使い方」もそろえる（SPEC §6.3）。
