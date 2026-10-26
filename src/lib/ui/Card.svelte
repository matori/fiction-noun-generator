<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    title?: string;
    description?: string;
    actions?: Snippet;
    children: Snippet;
  }

  let { title, description, actions, children }: Props = $props();
</script>

<section class="card">
  {#if title || actions}
    <header>
      <div>
        {#if title}<h2>{title}</h2>{/if}
        {#if description}<p>{description}</p>{/if}
      </div>
      {#if actions}<div class="actions">{@render actions()}</div>{/if}
    </header>
  {/if}
  {@render children()}
</section>

<style>
  .card {
    display: flex;
    flex-direction: column;
    gap: var(--spacingVerticalM);
    min-width: 0;
    padding: var(--spacingVerticalL) var(--spacingHorizontalL);
    background: var(--colorNeutralBackground1);
    border: var(--strokeWidthThin) solid var(--colorTransparentStroke);
    border-radius: var(--borderRadiusXLarge);
    box-shadow: var(--shadow4);
  }

  header {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--spacingVerticalS) var(--spacingHorizontalM);
    padding-bottom: var(--spacingVerticalM);
    border-bottom: var(--strokeWidthThick) solid var(--colorNeutralStroke2);
  }

  h2 {
    font-size: var(--fontSizeBase400);
    line-height: var(--lineHeightBase400);
    font-weight: var(--fontWeightSemibold);
  }

  p {
    margin-top: var(--spacingVerticalXXS);
    color: var(--colorNeutralForeground3);
    font-size: var(--fontSizeBase200);
    line-height: var(--lineHeightBase200);
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacingHorizontalS);
  }
</style>
