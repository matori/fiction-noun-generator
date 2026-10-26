<script lang="ts">
  import { toastState } from './toast-state.svelte';
</script>

<div class="region" role="status" aria-live="polite">
  {#if toastState.message}
    {#key toastState.id}
      <div class="toast {toastState.intent}">{toastState.message}</div>
    {/key}
  {/if}
</div>

<style>
  .region {
    position: fixed;
    left: 50%;
    bottom: var(--spacingVerticalXXL);
    transform: translateX(-50%);
    z-index: 10;
    pointer-events: none;
  }

  .toast {
    padding: var(--spacingVerticalM) var(--spacingHorizontalL);
    border-left: var(--strokeWidthThickest) solid var(--colorStatusSuccessForeground1);
    border-radius: var(--borderRadiusMedium);
    background: var(--colorNeutralBackground1);
    color: var(--colorNeutralForeground1);
    box-shadow: var(--shadow16);
    font-weight: var(--fontWeightSemibold);
    white-space: nowrap;
    animation: enter var(--durationNormal) var(--curveDecelerateMid);
  }

  .error {
    border-left-color: var(--colorStatusDangerForeground1);
  }

  @keyframes enter {
    from {
      opacity: 0;
      transform: translateY(var(--spacingVerticalM));
    }
  }
</style>
