<script lang="ts">
  import type { AppState } from '../app-state.svelte';
  import { copyText, downloadJson } from '../lib/clipboard';
  import {
    buildExport,
    createPreset,
    parseImport,
    removePreset,
    renamePreset,
    uniqueName,
    upsertPreset,
  } from '../lib/settings/presets';
  import type { Preset } from '../lib/settings/settings';
  import { buildShareUrl } from '../lib/settings/share';
  import Button from '../lib/ui/Button.svelte';
  import Card from '../lib/ui/Card.svelte';
  import TextField from '../lib/ui/TextField.svelte';
  import { showToast } from '../lib/ui/toast-state.svelte';

  let { app }: { app: AppState } = $props();

  let name = $state('');
  let fileInput: HTMLInputElement;

  function save() {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (app.presets.some((p) => p.name === trimmed) && !confirm(`「${trimmed}」を上書きしますか？`)) return;
    app.presets = upsertPreset(app.presets, createPreset(trimmed, $state.snapshot(app.settings)));
    name = '';
    showToast(`「${trimmed}」を保存しました`);
  }

  function load(preset: Preset) {
    app.applySettings(preset.settings);
    showToast(`「${preset.name}」を読み込みました`);
  }

  function rename(preset: Preset) {
    const to = prompt('新しい名前', preset.name)?.trim();
    if (!to || to === preset.name) return;
    if (app.presets.some((p) => p.name === to)) {
      showToast(`「${to}」はすでにあります`, 'error');
      return;
    }
    app.presets = renamePreset(app.presets, preset.name, to);
  }

  function remove(preset: Preset) {
    if (!confirm(`「${preset.name}」を削除しますか？`)) return;
    app.presets = removePreset(app.presets, preset.name);
  }

  function exportCurrent() {
    downloadJson('fng-settings.json', buildExport([createPreset('現在の設定', $state.snapshot(app.settings))]));
  }

  function exportAll() {
    downloadJson('fng-presets.json', buildExport($state.snapshot(app.presets)));
  }

  async function importFile(file: File) {
    let imported: Preset[];
    try {
      imported = parseImport(await file.text());
    } catch (error) {
      showToast((error as Error).message, 'error');
      return;
    }
    let presets = app.presets;
    for (const preset of imported) {
      const exists = presets.some((p) => p.name === preset.name);
      const overwrite =
        exists && confirm(`「${preset.name}」はすでにあります。上書きしますか？\n（キャンセルで別名として追加）`);
      const name = exists && !overwrite ? uniqueName(presets, preset.name) : preset.name;
      presets = upsertPreset(presets, { ...preset, name });
    }
    app.presets = presets;
    showToast(`${imported.length} 件のプリセットを読み込みました`);
  }

  function share() {
    const url = buildShareUrl(location.href, $state.snapshot(app.settings), app.input);
    copyText(url, '共有用の URL をコピーしました');
  }

  const dateFormat = new Intl.DateTimeFormat('ja-JP', { dateStyle: 'short', timeStyle: 'short' });
</script>

<Card title="設定の保存・共有" description="自動保存は最新の状態だけです。残したい設定は名前を付けて保存してください。">
  {#snippet actions()}
    <Button appearance="primary" icon="share" onclick={share}>共有 URL をコピー</Button>
  {/snippet}

  <form
    class="save"
    onsubmit={(e) => {
      e.preventDefault();
      save();
    }}
  >
    <TextField bind:value={name} label="プリセット名" placeholder="例: 北方の地名" />
    <Button type="submit" icon="save" disabled={!name.trim()}>保存</Button>
  </form>

  {#if app.presets.length > 0}
    <ul class="presets">
      {#each app.presets as preset (preset.name)}
        <li>
          <div class="meta">
            <span class="name">{preset.name}</span>
            <small>{dateFormat.format(new Date(preset.updatedAt))}</small>
          </div>
          <div class="row-actions">
            <Button size="small" icon="folder_open" onclick={() => load(preset)}>読み込む</Button>
            <Button size="small" appearance="subtle" icon="rename" onclick={() => rename(preset)}>名前変更</Button>
            <Button size="small" appearance="subtle" icon="delete" onclick={() => remove(preset)}>削除</Button>
          </div>
        </li>
      {/each}
    </ul>
  {:else}
    <p class="empty">保存したプリセットはまだありません。</p>
  {/if}

  <div class="transfer">
    <Button size="small" icon="arrow_download" onclick={exportCurrent}>現在の設定をエクスポート</Button>
    <Button size="small" icon="arrow_download" disabled={app.presets.length === 0} onclick={exportAll}>すべてエクスポート</Button>
    <Button size="small" icon="arrow_upload" onclick={() => fileInput.click()}>インポート</Button>
    <input
      bind:this={fileInput}
      class="visually-hidden"
      type="file"
      accept="application/json,.json"
      tabindex="-1"
      onchange={(e) => {
        const file = e.currentTarget.files?.[0];
        if (file) importFile(file);
        e.currentTarget.value = '';
      }}
    />
  </div>
</Card>

<style>
  .save {
    display: flex;
    align-items: flex-end;
    gap: var(--spacingHorizontalS);
  }

  .save > :global(:first-child) {
    flex: 1;
  }

  .presets {
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .presets li {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacingVerticalXS) var(--spacingHorizontalS);
    padding: var(--spacingVerticalS) 0;
    border-bottom: var(--strokeWidthThin) solid var(--colorNeutralStroke2);
  }

  .meta {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .name {
    overflow-wrap: anywhere;
    font-weight: var(--fontWeightSemibold);
  }

  small,
  .empty {
    color: var(--colorNeutralForeground3);
    font-size: var(--fontSizeBase200);
    line-height: var(--lineHeightBase200);
  }

  .row-actions,
  .transfer {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacingHorizontalXS);
  }
</style>
