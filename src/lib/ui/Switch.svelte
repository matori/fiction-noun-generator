<script lang="ts">
  interface Props {
    checked: boolean;
    label: string;
    description?: string;
    disabled?: boolean;
  }

  let { checked = $bindable(), label, description, disabled = false }: Props = $props();
</script>

<label class="switch" class:disabled>
  <input type="checkbox" role="switch" bind:checked {disabled} />
  <span class="track" aria-hidden="true"><span class="thumb"></span></span>
  <span class="text">
    {label}
    {#if description}<small>{description}</small>{/if}
  </span>
</label>

<style>
  .switch {
    position: relative;
    display: flex;
    align-items: flex-start;
    gap: var(--spacingHorizontalS);
    padding: var(--spacingVerticalXS) 0;
    cursor: pointer;
  }

  input {
    position: absolute;
    opacity: 0;
    width: 40px;
    height: 20px;
    margin: 0;
  }

  .track {
    flex: none;
    position: relative;
    width: 40px;
    height: 20px;
    border: var(--strokeWidthThin) solid var(--colorNeutralStrokeAccessible);
    border-radius: var(--borderRadiusCircular);
    background: var(--colorTransparentBackground);
    transition: background var(--durationNormal) var(--curveEasyEase);
  }

  .thumb {
    position: absolute;
    top: 50%;
    left: 3px;
    width: 12px;
    height: 12px;
    border-radius: var(--borderRadiusCircular);
    background: var(--colorNeutralStrokeAccessible);
    transform: translateY(-50%);
    transition: left var(--durationNormal) var(--curveEasyEase);
  }

  .switch:hover .track {
    border-color: var(--colorNeutralStrokeAccessibleHover);
  }

  input:checked + .track {
    background: var(--colorCompoundBrandBackground);
    border-color: var(--colorTransparentStroke);
  }

  .switch:hover input:checked + .track {
    background: var(--colorCompoundBrandBackgroundHover);
  }

  input:checked + .track .thumb {
    left: 23px;
    background: var(--colorNeutralForegroundInverted);
  }

  input:focus-visible + .track {
    outline: var(--strokeWidthThick) solid var(--colorStrokeFocus2);
    outline-offset: var(--strokeWidthThin);
  }

  .text {
    display: flex;
    flex-direction: column;
  }

  small {
    color: var(--colorNeutralForeground3);
    font-size: var(--fontSizeBase200);
    line-height: var(--lineHeightBase200);
  }

  .disabled {
    color: var(--colorNeutralForegroundDisabled);
    cursor: not-allowed;
  }

  .disabled .track,
  .disabled input:checked + .track {
    background: var(--colorTransparentBackground);
    border-color: var(--colorNeutralStrokeDisabled);
  }

  .disabled .thumb,
  .disabled input:checked + .track .thumb {
    background: var(--colorNeutralForegroundDisabled);
  }

  .disabled small {
    color: var(--colorNeutralForegroundDisabled);
  }
</style>
