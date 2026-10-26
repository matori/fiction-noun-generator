<script lang="ts">
  // 保存状態の表示（SPEC §6.6）
  import type { AppState } from '../app-state.svelte';
  import Icon from '../lib/ui/Icon.svelte';

  let { app }: { app: AppState } = $props();

  let open = $state(false);
  const tipId = $props.id();

  const timeFormat = new Intl.DateTimeFormat('ja-JP', { hour: 'numeric', minute: '2-digit' });

  const message = $derived(
    app.saveFailed
      ? 'このブラウザに保存できません（プライベートモードや容量不足など）。閉じると入力や設定が失われます。'
      : '入力と設定はこのブラウザに自動で保存され、次に開いたときに復元できます。保存されるのは最新の状態だけなので、残したい設定はプリセットに保存してください。',
  );
</script>

<div class="wrap">
  <button
    type="button"
    class="status"
    class:failed={app.saveFailed}
    aria-describedby={tipId}
    aria-expanded={open}
    onclick={() => (open = !open)}
    onblur={() => (open = false)}
  >
    {#if app.saveFailed}
      <Icon name="warning_filled" size={16} /> 保存できません
    {:else}
      <span class="check"><Icon name="checkmark_circle_filled" size={16} /></span> 保存済み
      {#if app.savedAt}<span class="time">{timeFormat.format(app.savedAt)}</span>{/if}
    {/if}
  </button>
  <div class="tip" class:open role="tooltip" id={tipId}>{message}</div>
</div>

<style>
  .wrap {
    position: relative;
  }

  .status {
    display: inline-flex;
    align-items: center;
    gap: var(--spacingHorizontalXS);
    min-height: 32px;
    padding: 0 var(--spacingHorizontalS);
    border: var(--strokeWidthThin) solid var(--colorTransparentStroke);
    border-radius: var(--borderRadiusMedium);
    background: var(--colorSubtleBackground);
    color: var(--colorNeutralForeground3);
    font-size: var(--fontSizeBase200);
    white-space: nowrap;
    cursor: default;
  }

  .status:hover {
    background: var(--colorSubtleBackgroundHover);
  }

  .check {
    display: inline-flex;
    color: var(--colorStatusSuccessForeground1);
  }

  .failed {
    color: var(--colorStatusWarningForeground3);
    font-weight: var(--fontWeightSemibold);
  }

  .tip {
    position: absolute;
    top: calc(100% + var(--spacingVerticalXS));
    right: 0;
    z-index: 20;
    width: max-content;
    max-width: min(280px, calc(100vw - 2 * var(--spacingHorizontalL)));
    padding: var(--spacingVerticalS) var(--spacingHorizontalM);
    border: var(--strokeWidthThin) solid var(--colorTransparentStroke);
    border-radius: var(--borderRadiusMedium);
    background: var(--colorNeutralBackground1);
    color: var(--colorNeutralForeground1);
    box-shadow: var(--shadow16);
    font-size: var(--fontSizeBase200);
    line-height: var(--lineHeightBase200);
    white-space: normal;
    visibility: hidden;
    opacity: 0;
    transition: opacity var(--durationFaster) var(--curveEasyEase);
  }

  .wrap:hover .tip,
  .status:focus-visible + .tip,
  .tip.open {
    visibility: visible;
    opacity: 1;
  }

  @media (max-width: 480px) {
    .time {
      display: none;
    }
  }
</style>
