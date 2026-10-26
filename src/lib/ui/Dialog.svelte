<script lang="ts">
  import type { Snippet } from 'svelte';
  import Button from './Button.svelte';
  import Icon from './Icon.svelte';

  interface Props {
    open: boolean;
    title: string;
    /** false なら閉じるボタン・Esc・背景クリックで閉じない（ボタンで選ばせる） */
    dismissible?: boolean;
    /** 最大幅（px）。画面が狭いときは画面幅に合わせる */
    maxWidth?: number;
    children: Snippet;
    footer?: Snippet;
  }

  let { open = $bindable(), title, dismissible = true, maxWidth = 600, children, footer }: Props =
    $props();

  let dialog: HTMLDialogElement;
  const titleId = $props.id();

  $effect(() => {
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  });
</script>

<dialog
  bind:this={dialog}
  style:--dialog-max-width="{maxWidth}px"
  aria-labelledby={titleId}
  onclose={() => {
    // dismissible でないとき、ブラウザが Esc の連打などで閉じても開き直す
    if (!dismissible && open) dialog.showModal();
    else open = false;
  }}
  oncancel={(e) => {
    if (!dismissible) e.preventDefault();
  }}
  onclick={(e) => {
    if (dismissible && e.target === dialog) open = false;
  }}
>
  <div class="surface">
    <header>
      <h2 id={titleId}>{title}</h2>
      {#if dismissible}
        <Button appearance="subtle" aria-label="閉じる" onclick={() => (open = false)}>
          <Icon name="dismiss" />
        </Button>
      {/if}
    </header>
    <div class="body">
      {@render children()}
    </div>
    {#if footer}
      <footer>{@render footer()}</footer>
    {/if}
  </div>
</dialog>

<style>
  dialog {
    width: min(var(--dialog-max-width), calc(100vw - 2 * var(--spacingHorizontalL)));
    max-height: calc(100vh - 2 * var(--spacingVerticalXXXL));
    padding: 0;
    border: var(--strokeWidthThin) solid var(--colorTransparentStroke);
    border-radius: var(--borderRadiusXLarge);
    background: var(--colorNeutralBackground1);
    color: var(--colorNeutralForeground1);
    box-shadow: var(--shadow64);
  }

  dialog::backdrop {
    background: var(--colorBackgroundOverlay);
  }

  .surface {
    display: flex;
    flex-direction: column;
    gap: var(--spacingVerticalS);
    padding: var(--spacingVerticalXXL) var(--spacingHorizontalXXL);
  }

  header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--spacingHorizontalS);
    padding-bottom: var(--spacingVerticalM);
    margin-bottom: var(--spacingVerticalS);
    border-bottom: var(--strokeWidthThick) solid var(--colorNeutralStroke2);
  }

  h2 {
    font-size: var(--fontSizeBase500);
    line-height: var(--lineHeightBase500);
    font-weight: var(--fontWeightSemibold);
  }

  .body {
    overflow-y: auto;
  }

  footer {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: var(--spacingHorizontalS);
    margin-top: var(--spacingVerticalM);
  }
</style>
