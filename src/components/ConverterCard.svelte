<script lang="ts">
  import type { AppState } from '../app-state.svelte';
  import { copyText } from '../lib/clipboard';
  import Button from '../lib/ui/Button.svelte';
  import Card from '../lib/ui/Card.svelte';
  import TextField from '../lib/ui/TextField.svelte';
  import StageText from './StageText.svelte';

  let { app }: { app: AppState } = $props();

  const result = $derived(app.result);

  const stages = $derived(
    [
      { label: 'ローマ字', value: result.romaji },
      result.reversed !== null ? { label: '反転後', value: result.reversed } : null,
      { label: '置換後', value: result.substituted },
    ].filter((stage) => stage !== null),
  );

  async function copyResult() {
    if (!result.output) return;
    if (await copyText(result.output)) app.addToHistory();
  }
</script>

<Card>
  <TextField
    bind:value={app.input}
    label="かな"
    size="large"
    placeholder="ひらがな・カタカナで入力（例: ストレイ・キャット）"
    hint="Enter で履歴に追加。かな以外の文字は区切りとして扱います。"
    autocomplete="off"
    spellcheck="false"
    onkeydown={(e) => {
      if (e.key === 'Enter' && !e.isComposing) app.addToHistory();
    }}
  />

  <div class="result" aria-live="polite">
    <span class="label">結果</span>
    <output class="output" class:empty={!result.output}>{result.output || '—'}</output>
    <div class="actions">
      <Button appearance="primary" icon="copy" disabled={!result.output} onclick={copyResult}>コピー</Button>
      <Button icon="history" disabled={!result.output} onclick={() => app.addToHistory()}>履歴に追加</Button>
    </div>
  </div>

  <ol class="stages" aria-label="途中経過">
    {#each stages as stage (stage.label)}
      <li>
        <span class="label">{stage.label}</span>
        <StageText stage={stage.value} />
      </li>
    {/each}
  </ol>
</Card>

<style>
  .result {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: end;
    gap: var(--spacingVerticalXS) var(--spacingHorizontalM);
    padding: var(--spacingVerticalL) var(--spacingHorizontalL);
    border-radius: var(--borderRadiusLarge);
    background: var(--colorBrandBackground2);
  }

  .result .label {
    grid-column: 1 / -1;
  }

  .label {
    color: var(--colorNeutralForeground3);
    font-size: var(--fontSizeBase200);
    line-height: var(--lineHeightBase200);
  }

  .output {
    min-width: 0;
    overflow-wrap: anywhere;
    color: var(--colorBrandForeground2);
    font-size: var(--fontSizeHero800);
    line-height: var(--lineHeightHero800);
    font-weight: var(--fontWeightSemibold);
  }

  .output.empty {
    color: var(--colorNeutralForegroundDisabled);
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacingHorizontalS);
  }

  @media (max-width: 480px) {
    .result {
      grid-template-columns: 1fr;
    }
  }

  .stages {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 160px), 1fr));
    gap: var(--spacingHorizontalS);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .stages li {
    display: flex;
    flex-direction: column;
    gap: var(--spacingVerticalXXS);
    min-width: 0;
    padding: var(--spacingVerticalS) var(--spacingHorizontalM);
    border: var(--strokeWidthThin) solid var(--colorNeutralStroke2);
    border-radius: var(--borderRadiusMedium);
  }
</style>
