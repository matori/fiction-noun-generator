<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';

  interface Props extends Omit<HTMLInputAttributes, 'size' | 'value'> {
    value: string;
    label?: string;
    hint?: string;
    size?: 'medium' | 'large';
  }

  let { value = $bindable(), label, hint, size = 'medium', ...rest }: Props = $props();

  const id = $props.id();
</script>

<div class="field">
  {#if label}<label for={id}>{label}</label>{/if}
  <span class="control {size}">
    <input {id} bind:value aria-describedby={hint ? `${id}-hint` : undefined} {...rest} />
  </span>
  {#if hint}<small id="{id}-hint">{hint}</small>{/if}
</div>

<style>
  .field {
    display: flex;
    flex-direction: column;
    gap: var(--spacingVerticalXXS);
    min-width: 0;
  }

  label {
    font-weight: var(--fontWeightSemibold);
  }

  .control {
    position: relative;
    display: flex;
    background: var(--colorNeutralBackground1);
    border: var(--strokeWidthThin) solid var(--colorNeutralStroke1);
    border-bottom-color: var(--colorNeutralStrokeAccessible);
    border-radius: var(--borderRadiusMedium);
    overflow: hidden;
  }

  .control:hover {
    border-color: var(--colorNeutralStroke1Hover);
    border-bottom-color: var(--colorNeutralStrokeAccessibleHover);
  }

  /* Fluent 2 のフォーカス：下線がブランド色で太くなる */
  .control::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: calc(-1 * var(--strokeWidthThin));
    height: var(--strokeWidthThick);
    background: var(--colorCompoundBrandStroke);
    transform: scaleX(0);
    transition: transform var(--durationNormal) var(--curveDecelerateMid);
  }

  .control:focus-within::after {
    transform: scaleX(1);
  }

  input {
    flex: 1;
    min-width: 0;
    min-height: 30px;
    padding: 0 var(--spacingHorizontalM);
    border: 0;
    background: var(--colorTransparentBackground);
    color: var(--colorNeutralForeground1);
    font-size: var(--fontSizeBase300);
  }

  input:focus {
    outline: none;
  }

  input::placeholder {
    color: var(--colorNeutralForeground4);
  }

  .large input {
    min-height: 38px;
    font-size: var(--fontSizeBase400);
  }

  small {
    color: var(--colorNeutralForeground3);
    font-size: var(--fontSizeBase200);
    line-height: var(--lineHeightBase200);
  }
</style>
