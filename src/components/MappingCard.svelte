<script lang="ts">
  import type { AppState } from '../app-state.svelte';
  import {
    CONSONANT_EXAMPLES,
    CONSONANT_GROUPS,
    CONSONANTS,
    VOWELS,
    identityConsonantMap,
    identityVowelMap,
    shiftVowels,
    shuffleConsonants,
    shufflePermutation,
    shuffleWithDuplicates,
    type Consonant,
    type ConsonantGroup,
    type Vowel,
    consonantKanaList,
  } from '../lib/core';
  import Button from '../lib/ui/Button.svelte';
  import Card from '../lib/ui/Card.svelte';
  import Checkbox from '../lib/ui/Checkbox.svelte';
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
    options: consonants.map((c) => ({ value: c, label: `${c} ${CONSONANT_EXAMPLES[c]}` })),
  }));

  const vowelChanged = $derived(VOWELS.some((v) => app.settings.vowelMap[v] !== v));
  const consonantChanged = $derived(CONSONANTS.some((c) => app.settings.consonantMap[c] !== c));

  function toggleShuffleGroup(group: ConsonantGroup, on: boolean) {
    app.shuffleGroups = on
      ? [...app.shuffleGroups, group]
      : app.shuffleGroups.filter((g) => g !== group);
  }

  function shuffle(withDuplicates: boolean) {
    app.settings.consonantMap = shuffleConsonants(app.settings.consonantMap, app.shuffleGroups, withDuplicates);
  }
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
        <fieldset class="scope">
          <legend>対象</legend>
          {#each groupEntries as [group] (group)}
            <Checkbox
              size="small"
              label={GROUP_LABELS[group]}
              bind:checked={() => app.shuffleGroups.includes(group), (on) => toggleShuffleGroup(group, on)}
            />
          {/each}
        </fieldset>
        <Button size="small" icon="arrow_shuffle" disabled={app.shuffleGroups.length === 0} title="対象のグループの中だけで入れ替える" onclick={() => shuffle(false)}>シャッフル</Button>
        <Button size="small" icon="arrow_shuffle" disabled={app.shuffleGroups.length === 0} title="対象のグループの中だけで入れ替える" onclick={() => shuffle(true)}>シャッフル（重複あり）</Button>
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
  {@const tipId = `consonant-tip-${consonant}`}
  <div class="pair consonant" class:changed={app.settings.consonantMap[consonant] !== consonant}>
    <span class="from">{consonant}</span>
    <span class="example" aria-hidden="true">{CONSONANT_EXAMPLES[consonant]}</span>
    <span class="arrow" aria-hidden="true">→</span>
    <Select
      size="small"
      ariaLabel="{consonant} の置き換え先"
      describedBy={tipId}
      groups={consonantGroups}
      bind:value={app.settings.consonantMap[consonant]}
    />
    <!-- マウスを乗せる・セレクトにフォーカスすると、その子音のかなを全部出す -->
    <span class="tip" role="tooltip" id={tipId}>
      <span class="tip-consonant">{consonant}</span>
      <span>{consonantKanaList(consonant).join(' ')}</span>
    </span>
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
    align-items: center;
    gap: var(--spacingHorizontalXS);
  }

  .scope {
    display: flex;
    align-items: center;
    gap: var(--spacingHorizontalS);
    margin: 0 var(--spacingHorizontalS) 0 0;
    padding: 0;
    border: 0;
  }

  .scope legend {
    float: left;
    padding: 0;
    margin-right: var(--spacingHorizontalXS);
    color: var(--colorNeutralForeground3);
    font-size: var(--fontSizeBase200);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(112px, 1fr));
    gap: var(--spacingVerticalXS) var(--spacingHorizontalS);
  }

  .grid:has(.consonant) {
    grid-template-columns: repeat(auto-fill, minmax(176px, 1fr));
  }

  .pair {
    display: grid;
    grid-template-columns: 2.2em auto 1fr;
    align-items: center;
    gap: var(--spacingHorizontalXS);
    padding: var(--spacingVerticalXXS) var(--spacingHorizontalXS);
    border-radius: var(--borderRadiusMedium);
  }

  .pair.consonant {
    position: relative;
    grid-template-columns: 2.2em 2.4em auto 1fr;
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

  .example {
    color: var(--colorNeutralForeground3);
    font-size: var(--fontSizeBase200);
    white-space: nowrap;
  }

  .arrow {
    color: var(--colorNeutralForeground3);
  }

  .tip {
    position: absolute;
    bottom: calc(100% + var(--spacingVerticalXXS));
    left: 0;
    z-index: 2;
    display: flex;
    gap: var(--spacingHorizontalS);
    padding: var(--spacingVerticalXS) var(--spacingHorizontalS);
    border: var(--strokeWidthThin) solid var(--colorTransparentStroke);
    border-radius: var(--borderRadiusMedium);
    background: var(--colorNeutralBackground1);
    color: var(--colorNeutralForeground1);
    box-shadow: var(--shadow16);
    font-size: var(--fontSizeBase300);
    white-space: nowrap;
    pointer-events: none;
    visibility: hidden;
    opacity: 0;
    transition: opacity var(--durationFaster) var(--curveEasyEase);
  }

  .tip-consonant {
    font-family: var(--fontFamilyMonospace);
    font-weight: var(--fontWeightSemibold);
    color: var(--colorBrandForeground1);
  }

  .pair.consonant:hover .tip,
  .pair.consonant:focus-within .tip {
    visibility: visible;
    opacity: 1;
  }
</style>
