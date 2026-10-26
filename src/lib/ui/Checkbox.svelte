<script lang="ts">
  interface Props {
    checked: boolean;
    label: string;
    size?: 'medium' | 'small';
    disabled?: boolean;
  }

  let { checked = $bindable(), label, size = 'medium', disabled = false }: Props = $props();
</script>

<label class="checkbox {size}" class:disabled>
  <input type="checkbox" bind:checked {disabled} />
  <span class="box" aria-hidden="true">
    <svg viewBox="0 0 12 12"><path d="M9.76 3.2a.75.75 0 0 1 .04 1.06l-4.25 4.5a.75.75 0 0 1-1.08.02L2.22 6.53a.75.75 0 1 1 1.06-1.06l1.7 1.7 3.72-3.93a.75.75 0 0 1 1.06-.04Z" /></svg>
  </span>
  <span class="text">{label}</span>
</label>

<style>
  .checkbox {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: var(--spacingHorizontalS);
    padding: var(--spacingVerticalXS) 0;
    cursor: pointer;
  }

  input {
    position: absolute;
    opacity: 0;
    width: 16px;
    height: 16px;
    margin: 0;
  }

  .box {
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border: var(--strokeWidthThin) solid var(--colorNeutralStrokeAccessible);
    border-radius: var(--borderRadiusSmall);
    background: var(--colorNeutralBackground1);
  }

  svg {
    width: 12px;
    height: 12px;
    fill: var(--colorNeutralForegroundInverted);
    visibility: hidden;
  }

  .checkbox:hover .box {
    border-color: var(--colorNeutralStrokeAccessibleHover);
  }

  input:checked + .box {
    background: var(--colorCompoundBrandBackground);
    border-color: var(--colorCompoundBrandBackground);
  }

  .checkbox:hover input:checked + .box {
    background: var(--colorCompoundBrandBackgroundHover);
    border-color: var(--colorCompoundBrandBackgroundHover);
  }

  input:checked + .box svg {
    visibility: visible;
  }

  input:focus-visible + .box {
    outline: var(--strokeWidthThick) solid var(--colorStrokeFocus2);
    outline-offset: var(--strokeWidthThin);
  }

  .small {
    gap: var(--spacingHorizontalXS);
    font-size: var(--fontSizeBase200);
    line-height: var(--lineHeightBase200);
  }

  .disabled {
    color: var(--colorNeutralForegroundDisabled);
    cursor: not-allowed;
  }

  .disabled .box,
  .disabled input:checked + .box {
    background: var(--colorNeutralBackground1);
    border-color: var(--colorNeutralStrokeDisabled);
  }

  .disabled svg {
    fill: var(--colorNeutralForegroundDisabled);
  }
</style>
