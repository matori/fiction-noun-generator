<script lang="ts">
  // 起動時に前回の作業を復元するか確認する（SPEC §5.6）
  import type { AppState } from '../app-state.svelte';
  import { convert } from '../lib/core';
  import { formatSummary, summarizeSettings } from '../lib/settings/summary';
  import Button from '../lib/ui/Button.svelte';
  import Dialog from '../lib/ui/Dialog.svelte';

  let { app }: { app: AppState } = $props();

  const draft = $derived(app.pendingRestore);
  let open = $derived(draft !== null);

  const dateFormat = new Intl.DateTimeFormat('ja-JP', { dateStyle: 'short', timeStyle: 'short' });
</script>

<Dialog bind:open title="前回の作業を復元しますか？" dismissible={false}>
  {#if draft}
    <p class="lead">{dateFormat.format(new Date(draft.savedAt))} に自動保存された作業があります。</p>
    <dl>
      <dt>入力</dt>
      <dd>{draft.input}</dd>
      <dt>出力</dt>
      <dd class="output">{convert(draft.input, draft.settings).output}</dd>
      <dt>設定</dt>
      <dd>{formatSummary(summarizeSettings(draft.settings))}</dd>
    </dl>
  {/if}

  {#snippet footer()}
    <Button appearance="subtle" icon="new" onclick={() => app.resolveRestore('fresh')}>最初から</Button>
    <Button icon="options" onclick={() => app.resolveRestore('settings')}>設定だけ復元</Button>
    <!-- Enter で「最初から」を選んでしまわないよう、初期フォーカスは「すべて復元」 -->
    <!-- svelte-ignore a11y_autofocus -->
    <Button appearance="primary" icon="arrow_undo" autofocus onclick={() => app.resolveRestore('all')}>すべて復元</Button>
  {/snippet}
</Dialog>

<style>
  .lead {
    margin-bottom: var(--spacingVerticalM);
    color: var(--colorNeutralForeground2);
  }

  dl {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: var(--spacingVerticalS) var(--spacingHorizontalL);
    margin: 0;
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

  .output {
    color: var(--colorBrandForeground2);
    font-size: var(--fontSizeBase400);
    font-weight: var(--fontWeightSemibold);
  }
</style>
