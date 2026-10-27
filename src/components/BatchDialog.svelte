<script lang="ts">
  // 一括変換ダイアログと、画面全体へのファイルのドロップ（SPEC §6.8）
  import type { AppState } from '../app-state.svelte';
  import { buildBatchOutput, checkLineCount, convertLines, downloadFileName, splitLines } from '../lib/batch';
  import { batch, openWithFile } from '../lib/batch-state.svelte';
  import { copyText, downloadText } from '../lib/clipboard';
  import {
    OUTPUT_FORMATS,
    OUTPUT_FORMAT_LABELS,
    buildFooter,
    settingsLine,
  } from '../lib/settings/output-format';
  import Button from '../lib/ui/Button.svelte';
  import Dialog from '../lib/ui/Dialog.svelte';
  import Icon from '../lib/ui/Icon.svelte';
  import Select from '../lib/ui/Select.svelte';
  import Switch from '../lib/ui/Switch.svelte';
  import { showToast } from '../lib/ui/toast-state.svelte';

  let { app }: { app: AppState } = $props();

  const formatOptions = OUTPUT_FORMATS.map((value) => ({ value, label: OUTPUT_FORMAT_LABELS[value] }));
  const MIME = { output: 'text/plain', arrow: 'text/plain', tsv: 'text/tab-separated-values', csv: 'text/csv' };

  const lines = $derived(splitLines(batch.file?.text ?? batch.pasteText));
  const pairs = $derived(batch.step === 'result' ? convertLines(lines, app.settings) : []);
  const output = $derived(
    buildBatchOutput(pairs, app.outputFormat, batch.footer ? buildFooter(app.settings, location.href) : null),
  );

  function startConvert() {
    const check = checkLineCount(lines.length);
    if (!check.ok) {
      showToast(check.message, 'error');
      return;
    }
    batch.step = 'result';
  }

  /** 結果をコピーもダウンロードもしていなければ、閉じる前に確認する */
  function confirmClose(): boolean {
    if (batch.step !== 'result' || batch.saved) return true;
    return confirm('変換結果はまだコピーもダウンロードもしていません。閉じると結果は消えます。閉じますか？');
  }

  function close() {
    if (confirmClose()) batch.open = false;
  }

  async function copyResult() {
    if (await copyText(output, `${pairs.length} 行をコピーしました`)) batch.saved = true;
  }

  function downloadResult() {
    downloadText(
      downloadFileName(batch.file?.name ?? null, app.outputFormat),
      output,
      `${MIME[app.outputFormat]};charset=utf-8`,
    );
    batch.saved = true;
  }

  // 画面全体をドロップ先にする。ドロップ位置を外してブラウザがファイルを開いてしまわないように
  let dragDepth = $state(0);

  const hasFiles = (e: DragEvent) => e.dataTransfer?.types.includes('Files') ?? false;

  function onDragEnter(e: DragEvent) {
    if (!hasFiles(e)) return;
    e.preventDefault();
    dragDepth += 1;
  }

  function onDragOver(e: DragEvent) {
    if (!hasFiles(e)) return;
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
  }

  function onDragLeave(e: DragEvent) {
    if (!hasFiles(e)) return;
    dragDepth = Math.max(0, dragDepth - 1);
  }

  function onDrop(e: DragEvent) {
    if (!hasFiles(e)) return;
    e.preventDefault();
    dragDepth = 0;
    const files = [...(e.dataTransfer?.files ?? [])];
    if (document.querySelector('dialog[open]')) {
      showToast('開いているダイアログを閉じてからドロップしてください', 'error');
      return;
    }
    if (files.length !== 1) {
      showToast('ファイルは 1 つずつドロップしてください', 'error');
      return;
    }
    openWithFile(files[0]);
  }
</script>

<svelte:window ondragenter={onDragEnter} ondragover={onDragOver} ondragleave={onDragLeave} ondrop={onDrop} />

{#if dragDepth > 0}
  <div class="drop-overlay" aria-hidden="true">
    <div class="drop-target">
      <Icon name="arrow_upload" />
      ドロップすると、現在の設定で 1 行ずつ変換します
    </div>
  </div>
{/if}

<Dialog bind:open={batch.open} title="一括変換" maxWidth={860} beforeClose={confirmClose}>
  {#if batch.step === 'input'}
    {#if batch.file}
      <dl class="file">
        <dt>ファイル</dt>
        <dd>{batch.file.name}</dd>
        <dt>行数</dt>
        <dd>{lines.length.toLocaleString()} 行</dd>
        <dt>文字コード</dt>
        <dd>{batch.file.encoding}</dd>
      </dl>
      <p class="question">現在の設定でこのファイルの中身を変換しますか？</p>
    {:else}
      <label class="field">
        <span>変換するテキスト（1 行に 1 つ）</span>
        <textarea bind:value={batch.pasteText} rows="10" placeholder="おだ・のぶなが&#10;とくがわ・いえやす" spellcheck="false"></textarea>
      </label>
      <p class="question">現在の設定で 1 行ずつ変換します（{lines.length.toLocaleString()} 行）。</p>
    {/if}
    <p class="settings">設定: {settingsLine(app.settings)}</p>
  {:else}
    <div class="toolbar">
      <div class="format">
        <Select label="出力形式" options={formatOptions} bind:value={app.outputFormat} />
      </div>
      <Switch label="フッターを付ける" description="設定の要約と共有 URL" bind:checked={batch.footer} />
    </div>
    <label class="field">
      <span>{pairs.length.toLocaleString()} 行を変換しました</span>
      <textarea readonly rows="14" value={output}></textarea>
    </label>
  {/if}

  {#snippet footer()}
    {#if batch.step === 'input'}
      <Button appearance="subtle" icon="dismiss" onclick={close}>キャンセル</Button>
      <Button appearance="primary" icon="arrow_right" disabled={lines.length === 0} onclick={startConvert}>変換する</Button>
    {:else}
      <Button appearance="subtle" icon="dismiss" onclick={close}>閉じる</Button>
      <Button icon="arrow_download" onclick={downloadResult}>ダウンロード</Button>
      <Button appearance="primary" icon="copy" onclick={copyResult}>コピー</Button>
    {/if}
  {/snippet}
</Dialog>

<style>
  .drop-overlay {
    position: fixed;
    inset: 0;
    z-index: 30;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--spacingVerticalXXXL) var(--spacingHorizontalXXXL);
    background: var(--colorBackgroundOverlay);
    pointer-events: none;
  }

  .drop-target {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacingHorizontalS);
    width: 100%;
    height: 100%;
    border: var(--strokeWidthThickest) dashed var(--colorNeutralForegroundOnBrand);
    border-radius: var(--borderRadiusXLarge);
    color: var(--colorNeutralForegroundOnBrand);
    font-size: var(--fontSizeBase500);
    font-weight: var(--fontWeightSemibold);
    text-align: center;
  }

  .file {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: var(--spacingVerticalS) var(--spacingHorizontalL);
    margin: 0 0 var(--spacingVerticalM);
    padding: var(--spacingVerticalM) var(--spacingHorizontalL);
    border-radius: var(--borderRadiusMedium);
    background: var(--colorNeutralBackground3);
  }

  dt {
    color: var(--colorNeutralForeground3);
    font-size: var(--fontSizeBase200);
  }

  dd {
    margin: 0;
    overflow-wrap: anywhere;
  }

  .question {
    margin-top: var(--spacingVerticalS);
    font-weight: var(--fontWeightSemibold);
  }

  .settings {
    margin-top: var(--spacingVerticalXS);
    color: var(--colorNeutralForeground3);
    font-size: var(--fontSizeBase200);
    overflow-wrap: anywhere;
  }

  .toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: var(--spacingVerticalS) var(--spacingHorizontalXL);
    margin-bottom: var(--spacingVerticalM);
  }

  .format {
    width: 200px;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: var(--spacingVerticalXXS);
  }

  .field > span {
    font-weight: var(--fontWeightSemibold);
  }

  textarea {
    width: 100%;
    padding: var(--spacingVerticalS) var(--spacingHorizontalM);
    border: var(--strokeWidthThin) solid var(--colorNeutralStroke1);
    border-bottom-color: var(--colorNeutralStrokeAccessible);
    border-radius: var(--borderRadiusMedium);
    background: var(--colorNeutralBackground1);
    color: var(--colorNeutralForeground1);
    font-size: var(--fontSizeBase300);
    line-height: var(--lineHeightBase300);
    resize: vertical;
  }

  textarea:focus-visible {
    outline: none;
    border-bottom-color: var(--colorCompoundBrandStroke);
    box-shadow: inset 0 calc(-1 * var(--strokeWidthThin)) 0 var(--colorCompoundBrandStroke);
  }

  textarea[readonly] {
    background: var(--colorNeutralBackground3);
  }
</style>
