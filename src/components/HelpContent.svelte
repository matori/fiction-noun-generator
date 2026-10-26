<!-- 使い方（SPEC §6.3）。README の「変換ルール」節と内容をそろえる -->

<div class="help">
  <section>
    <h3>変換の流れ</h3>
    <ol>
      <li>入力したかなを訓令式ベースのローマ字に分解します（し = si、ち = ti、つ = tu、ふ = hu）。</li>
      <li>オプションで、かなの段階かローマ字の段階で並びを反転します。</li>
      <li>マッピングに従って、母音は母音同士、子音は子音同士で置き換えます。</li>
      <li>カタカナに戻します。戻せない部分は英字のまま出力します（例: <code>アルカs</code>）。</li>
    </ol>
  </section>

  <section>
    <h3>文字ごとの扱い</h3>
    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>文字</th><th>入れ替え</th><th>反転</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>通常の音節（カ、キャ、ティ など）</td>
            <td>子音・母音とも入れ替える</td>
            <td>1 音節として動く（ローマ字反転では子音と母音に分かれる）</td>
          </tr>
          <tr><td>ー ッ ン</td><td>入れ替えない</td><td>独立して動く</td></tr>
          <tr>
            <td>単独の小書き文字 ァィゥェォャュョ</td>
            <td>母音だけ入れ替え、小書きのまま残る</td>
            <td>独立して動く</td>
          </tr>
          <tr><td>ヵ ヶ ヮ</td><td colspan="2">通常の カ ケ ワ として扱う</td></tr>
        </tbody>
      </table>
    </div>
    <p>
      かな以外の文字（漢字・英数字・空白・記号）は区切り文字です。区切りごとに変換し、区切り文字はそのまま残ります。
      例: 「ストレイ・キャット」は「ストレイ」と「キャット」を別々に変換します。
    </p>
  </section>

  <section>
    <h3>オプション</h3>
    <dl>
      <dt>末尾の長音（ー）</dt>
      <dd>反転すると末尾の ー が先頭に来てしまうため、「削除」か「末尾に保持」を選べます。</dd>
      <dt>先頭の母音を末尾へ移す</dt>
      <dd>
        ローマ字反転で先頭に来た母音が、元は子音と組んでいた場合に末尾へ移します（sakura → arukas → rukasa）。
        末尾の ー を保持しているときは、その ー の前に置きます。
      </dd>
    </dl>
  </section>

  <section>
    <h3>保存について</h3>
    <ul>
      <li>
        入力と設定はこのブラウザに自動で保存されます（ヘッダーの「保存済み」）。次に開いたときに、前回の作業を復元するか確認します。
      </li>
      <li>
        自動保存されるのは最新の状態だけです。残しておきたい設定は「設定の保存・共有」でプリセットに名前を付けて保存してください。
      </li>
      <li>
        履歴に残っている名詞の設定は、履歴の「設定を復元」で画面に戻せます。戻したあとにプリセットとして保存することもできます。
      </li>
    </ul>
  </section>

  <section>
    <h3>途中経過の表記</h3>
    <p>
      ローマ字の途中経過では、ー ッ ン をかなのまま枠で囲んで表示します（例: kyaッto）。
      区切り文字や小書きの印（x、xy）など、置き換えの対象でない部分は薄く表示します。
    </p>
  </section>
</div>

<style>
  /* 読む量が多いので、本文はほかの画面より 1 段階大きくする */
  .help {
    display: flex;
    flex-direction: column;
    gap: var(--spacingVerticalXXL);
    font-size: var(--fontSizeBase400);
    line-height: var(--lineHeightBase400);
  }

  section {
    display: flex;
    flex-direction: column;
    gap: var(--spacingVerticalS);
  }

  h3 {
    font-size: var(--fontSizeBase500);
    line-height: var(--lineHeightBase500);
    font-weight: var(--fontWeightSemibold);
  }

  ol,
  ul,
  dl,
  dd {
    margin: 0;
  }

  ol,
  ul {
    padding-left: var(--spacingHorizontalXL);
  }

  dt {
    font-weight: var(--fontWeightSemibold);
  }

  dd + dt {
    margin-top: var(--spacingVerticalS);
  }

  .table-wrap {
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--fontSizeBase300);
    line-height: var(--lineHeightBase300);
  }

  th,
  td {
    padding: var(--spacingVerticalS) var(--spacingHorizontalS);
    border-bottom: var(--strokeWidthThin) solid var(--colorNeutralStroke2);
    text-align: left;
    vertical-align: top;
  }

  th {
    color: var(--colorNeutralForeground3);
    font-weight: var(--fontWeightSemibold);
  }

  code {
    padding: 0 var(--spacingHorizontalXXS);
    border-radius: var(--borderRadiusSmall);
    background: var(--colorNeutralBackground3);
  }
</style>
