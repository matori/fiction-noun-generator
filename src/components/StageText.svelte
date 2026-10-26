<script lang="ts">
  // 途中経過のローマ字を表示する（SPEC §6.4）
  import type { Stage } from '../lib/core';

  let { stage }: { stage: Stage } = $props();
</script>

<code>
  {#each stage.tokens as token, i (i)}
    <span class={token.kind}>{token.text}</span>
  {:else}
    —
  {/each}
</code>

<style>
  code {
    overflow-wrap: anywhere;
    font-size: var(--fontSizeBase400);
    line-height: var(--lineHeightBase400);
  }

  /* ー ッ ン：置換されないがそのまま残る文字。かなのまま目立たせる */
  .special {
    display: inline-block;
    margin: 0 var(--spacingHorizontalXXS);
    padding: 0 var(--spacingHorizontalXXS);
    border: var(--strokeWidthThin) solid var(--colorBrandStroke2);
    border-radius: var(--borderRadiusSmall);
    color: var(--colorBrandForeground1);
    font-family: var(--fontFamilyBase);
    font-weight: var(--fontWeightSemibold);
    line-height: var(--lineHeightBase300);
  }

  /* 置換の対象でない文字（区切り文字、小書きマーカー） */
  .separator,
  .marker {
    color: var(--colorNeutralForeground4);
  }
</style>
