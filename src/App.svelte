<script lang="ts">
  import { AppState } from './app-state.svelte';
  import appIcon from './assets/app-icon.svg';
  import BatchCard from './components/BatchCard.svelte';
  import BatchDialog from './components/BatchDialog.svelte';
  import ConverterCard from './components/ConverterCard.svelte';
  import HelpContent from './components/HelpContent.svelte';
  import HistoryCard from './components/HistoryCard.svelte';
  import MappingCard from './components/MappingCard.svelte';
  import OptionsCard from './components/OptionsCard.svelte';
  import PresetsCard from './components/PresetsCard.svelte';
  import RestoreDialog from './components/RestoreDialog.svelte';
  import SaveStatus from './components/SaveStatus.svelte';
  import type { ThemeMode } from './lib/theme/theme';
  import Button from './lib/ui/Button.svelte';
  import Icon from './lib/ui/Icon.svelte';
  import type { IconName } from './lib/ui/icons';
  import Dialog from './lib/ui/Dialog.svelte';
  import Select from './lib/ui/Select.svelte';
  import Toast from './lib/ui/Toast.svelte';

  const app = new AppState();

  let helpOpen = $state(false);

  const THEME_ICONS: Record<ThemeMode, IconName> = {
    system: 'desktop',
    light: 'weather_sunny',
    dark: 'weather_moon',
  };

  const themeOptions: { value: ThemeMode; label: string }[] = [
    { value: 'system', label: 'システム' },
    { value: 'light', label: 'ライト' },
    { value: 'dark', label: 'ダーク' },
  ];
</script>

<header class="app-header">
  <div class="inner">
    <h1><img class="app-icon" src={appIcon} alt="" width="24" height="24" />創作名詞ジェネレーター</h1>
    <div class="header-actions">
      <SaveStatus {app} />
      <Button appearance="subtle" icon="question_circle" onclick={() => (helpOpen = true)}>使い方</Button>
      <div class="theme">
        <Icon name={THEME_ICONS[app.themeMode]} />
        <Select ariaLabel="テーマ" options={themeOptions} bind:value={app.themeMode} />
      </div>
    </div>
  </div>
</header>

<main>
  <div class="converter"><ConverterCard {app} /></div>
  <div class="batch"><BatchCard /></div>
  <div class="side">
    <div class="options"><OptionsCard {app} /></div>
    <div class="presets"><PresetsCard {app} /></div>
  </div>
  <div class="mapping"><MappingCard {app} /></div>
  <div class="history"><HistoryCard {app} /></div>
</main>

<Dialog bind:open={helpOpen} title="使い方" maxWidth={860}>
  <HelpContent />
</Dialog>

<BatchDialog {app} />

<RestoreDialog {app} />

<Toast />

<style>
  .app-header {
    position: sticky;
    top: 0;
    z-index: 5;
    background: var(--colorNeutralBackground1);
    border-bottom: var(--strokeWidthThin) solid var(--colorNeutralStroke2);
  }

  .inner,
  main {
    max-width: 1200px;
    margin: 0 auto;
    padding-left: var(--spacingHorizontalL);
    padding-right: var(--spacingHorizontalL);
  }

  .inner {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacingHorizontalM);
    min-height: 48px;
    padding-top: var(--spacingVerticalS);
    padding-bottom: var(--spacingVerticalS);
  }

  h1 {
    display: flex;
    align-items: center;
    gap: var(--spacingHorizontalS);
    white-space: nowrap;
    font-size: var(--fontSizeBase500);
    line-height: var(--lineHeightBase500);
    font-weight: var(--fontWeightSemibold);
  }

  .header-actions {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: flex-end;
    gap: var(--spacingHorizontalS);
  }

  .theme {
    display: flex;
    align-items: center;
    gap: var(--spacingHorizontalXS);
    width: 144px;
    color: var(--colorNeutralForeground2);
  }

  .theme > :global(.field) {
    flex: 1;
  }

  main {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--spacingVerticalL);
    padding-top: var(--spacingVerticalXL);
    padding-bottom: var(--spacingVerticalXXXL);
  }

  /* 狭い画面では 入力 → オプション → マッピング → 保存・共有 → 履歴 の順に並べる */
  .side {
    display: contents;
  }

  .converter {
    order: 1;
  }

  .batch {
    order: 2;
  }

  .options {
    order: 2;
  }

  .mapping {
    order: 3;
  }

  .presets {
    order: 4;
  }

  .history {
    order: 5;
  }

  @media (min-width: 960px) {
    .side {
      display: flex;
      flex-direction: column;
      gap: var(--spacingVerticalL);
    }

    main {
      grid-template-columns: minmax(0, 3fr) minmax(320px, 2fr);
      grid-template-areas:
        'converter converter'
        'batch batch'
        'mapping side'
        'history history';
      align-items: start;
    }

    .converter {
      grid-area: converter;
    }

    .batch {
      grid-area: batch;
    }

    .mapping {
      grid-area: mapping;
    }

    .side {
      grid-area: side;
    }

    .history {
      grid-area: history;
    }
  }

  @media (max-width: 480px) {
    h1 {
      font-size: var(--fontSizeBase400);
      line-height: var(--lineHeightBase400);
    }

    .theme {
      width: 128px;
    }
  }
</style>
