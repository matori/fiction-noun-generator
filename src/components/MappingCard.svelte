<script lang="ts">
  import type { AppState } from '../app-state.svelte';
  import {
    CONSONANT_GROUPS,
    CONSONANTS,
    VOWELS,
    identityConsonantMap,
    identityVowelMap,
    shiftVowels,
    shufflePermutation,
    shuffleWithDuplicates,
    type Consonant,
    type ConsonantGroup,
    type Vowel,
  } from '../lib/core';
  import Button from '../lib/ui/Button.svelte';
  import Card from '../lib/ui/Card.svelte';
  import Select from '../lib/ui/Select.svelte';

  let { app }: { app: AppState } = $props();

  const GROUP_LABELS: Record<ConsonantGroup, string> = {
    basic: '基本',
    youon: '拗音',
    extended: '拡張',
  };

  const groupEntries = Object.entries(CONSONANT_GROUPS) as [ConsonantGroup, readonly Consonant[]][];

  const vowelOptions = VOWELS.map((v) => ({ value: v, label: v }));
  const consonantGroups = groupEntries.map(([group, consonants]) => ({
    label: GROUP_LABELS[group],
    options: consonants.map((c) => ({ value: c, label: c })),
  }));

  const vowelChanged = $derived(VOWELS.some((v) => app.settings.vowelMap[v] !== v));
  const consonantChanged = $derived(CONSONANTS.some((c) => app.settings.consonantMap[c] !== c));
</script>

<Card title="マッピング" description="ローマ字の母音・子音をそれぞれ何に置き換えるか。重複も選べます。">
  <section aria-labelledby="vowel-heading">
    <div class="heading">
      <h3 id="vowel-heading">母音</h3>
      <div class="tools">
        <Button size="small" icon="arrow_left" title="行き先を a→i→u→e→o の逆向きに 1 つずらす" onclick={() => (app.settings.vowelMap = shiftVowels(app.settings.vowelMap, -1))}>1 つ戻す</Button>
        <Button size="small" icon="arrow_right" title="行き先を a→i→u→e→o の向きに 1 つずらす" onclick={() => (app.settings.vowelMap = shiftVowels(app.settings.vowelMap, 1))}>1 つ進める</Button>
        <Button size="small" icon="arrow_shuffle" onclick={() => (app.settings.vowelMap = shufflePermutation(VOWELS))}>シャッフル</Button>
        <Button size="small" icon="arrow_shuffle" onclick={() => (app.settings.vowelMap = shuffleWithDuplicates(VOWELS))}>シャッフル（重複あり）</Button>
        <Button size="small" appearance="subtle" icon="arrow_counterclockwise" disabled={!vowelChanged} onclick={() => (app.settings.vowelMap = identityVowelMap())}>リセット</Button>
      </div>
    </div>
    <div class="grid vowels">
      {#each VOWELS as vowel (vowel)}
        {@render vowelPair(vowel)}
      {/each}
    </div>
  </section>

  <section aria-labelledby="consonant-heading">
    <div class="heading">
      <h3 id="consonant-heading">子音</h3>
      <div class="tools">
        <Button size="small" icon="arrow_shuffle" onclick={() => (app.settings.consonantMap = shufflePermutation(CONSONANTS))}>シャッフル</Button>
        <Button size="small" icon="arrow_shuffle" onclick={() => (app.settings.consonantMap = shuffleWithDuplicates(CONSONANTS))}>シャッフル（重複あり）</Button>
        <Button size="small" appearance="subtle" icon="arrow_counterclockwise" disabled={!consonantChanged} onclick={() => (app.settings.consonantMap = identityConsonantMap())}>リセット</Button>
      </div>
    </div>
    {#each groupEntries as [group, consonants] (group)}
      <h4>{GROUP_LABELS[group]}</h4>
      <div class="grid">
        {#each consonants as consonant (consonant)}
          {@render consonantPair(consonant)}
        {/each}
      </div>
    {/each}
  </section>
</Card>

{#snippet vowelPair(vowel: Vowel)}
  <div class="pair" class:changed={app.settings.vowelMap[vowel] !== vowel}>
    <span class="from">{vowel}</span>
    <span class="arrow" aria-hidden="true">→</span>
    <Select size="small" ariaLabel="{vowel} の置き換え先" options={vowelOptions} bind:value={app.settings.vowelMap[vowel]} />
  </div>
{/snippet}

{#snippet consonantPair(consonant: Consonant)}
  <div class="pair" class:changed={app.settings.consonantMap[consonant] !== consonant}>
    <span class="from">{consonant}</span>
    <span class="arrow" aria-hidden="true">→</span>
    <Select size="small" ariaLabel="{consonant} の置き換え先" groups={consonantGroups} bind:value={app.settings.consonantMap[consonant]} />
  </div>
{/snippet}

<style>
  section {
    display: flex;
    flex-direction: column;
    gap: var(--spacingVerticalS);
  }

  section + section {
    padding-top: var(--spacingVerticalM);
    border-top: var(--strokeWidthThin) solid var(--colorNeutralStroke2);
  }

  .heading {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacingVerticalS) var(--spacingHorizontalM);
  }

  h3 {
    font-size: var(--fontSizeBase300);
    font-weight: var(--fontWeightSemibold);
  }

  h4 {
    margin: var(--spacingVerticalXS) 0 0;
    color: var(--colorNeutralForeground3);
    font-size: var(--fontSizeBase200);
    font-weight: var(--fontWeightRegular);
  }

  .tools {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacingHorizontalXS);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(112px, 1fr));
    gap: var(--spacingVerticalXS) var(--spacingHorizontalS);
  }

  .pair {
    display: grid;
    grid-template-columns: 2.2em auto 1fr;
    align-items: center;
    gap: var(--spacingHorizontalXS);
    padding: var(--spacingVerticalXXS) var(--spacingHorizontalXS);
    border-radius: var(--borderRadiusMedium);
  }

  .pair.changed {
    background: var(--colorBrandBackground2);
  }

  .from {
    font-family: var(--fontFamilyMonospace);
    font-weight: var(--fontWeightSemibold);
    text-align: right;
  }

  .changed .from {
    color: var(--colorBrandForeground2);
  }

  .arrow {
    color: var(--colorNeutralForeground3);
  }
</style>
