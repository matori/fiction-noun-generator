<script lang="ts">
  import type { AppState } from '../app-state.svelte';
  import type { ReverseMode, TrailingChoonMode } from '../lib/core';
  import Card from '../lib/ui/Card.svelte';
  import RadioGroup from '../lib/ui/RadioGroup.svelte';
  import Switch from '../lib/ui/Switch.svelte';

  let { app }: { app: AppState } = $props();

  const reverseOptions: { value: ReverseMode; label: string; description: string }[] = [
    { value: 'none', label: 'なし', description: '反転しない' },
    { value: 'kana', label: 'かなで反転', description: 'キャット → トッキャ' },
    { value: 'romaji', label: 'ローマ字で反転', description: 'sakura → arukas' },
  ];

  const choonOptions: { value: TrailingChoonMode; label: string }[] = [
    { value: 'keep', label: '末尾に保持' },
    { value: 'remove', label: '削除' },
  ];
</script>

<Card title="オプション">
  <RadioGroup legend="文字列の反転" options={reverseOptions} bind:value={app.settings.reverse} />

  <Switch
    label="先頭の母音を末尾へ移す"
    description="ローマ字反転で、元は子音と組んでいた母音が先頭に来たとき（arukas → rukasa）"
    disabled={app.settings.reverse !== 'romaji'}
    bind:checked={app.settings.moveLeadingVowel}
  />

  <RadioGroup
    legend="末尾の長音（ー）"
    layout="horizontal"
    options={choonOptions}
    disabled={app.settings.reverse === 'none'}
    bind:value={app.settings.trailingChoon}
  />
</Card>
