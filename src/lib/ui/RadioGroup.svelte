<script lang="ts" generics="T extends string">
  interface Props {
    value: T;
    options: { value: T; label: string; description?: string }[];
    legend: string;
    disabled?: boolean;
    layout?: 'vertical' | 'horizontal';
  }

  let { value = $bindable(), options, legend, disabled = false, layout = 'vertical' }: Props =
    $props();

  const name = $props.id();
</script>

<fieldset class={layout} {disabled}>
  <legend>{legend}</legend>
  <div class="options">
    {#each options as option (option.value)}
      <label class="radio">
        <input type="radio" {name} value={option.value} bind:group={value} />
        <span class="indicator" aria-hidden="true"></span>
        <span class="text">
          {option.label}
          {#if option.description}<small>{option.description}</small>{/if}
        </span>
      </label>
    {/each}
  </div>
</fieldset>

<style>
  fieldset {
    margin: 0;
    padding: 0;
    border: 0;
    min-width: 0;
  }

  legend {
    padding: 0;
    margin-bottom: var(--spacingVerticalXS);
    font-weight: var(--fontWeightSemibold);
  }

  .options {
    display: flex;
    flex-direction: column;
  }

  .horizontal .options {
    flex-direction: row;
    flex-wrap: wrap;
    column-gap: var(--spacingHorizontalM);
  }

  .radio {
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
    width: 16px;
    height: 16px;
    margin: 0;
  }

  .indicator {
    flex: none;
    position: relative;
    width: 16px;
    height: 16px;
    margin-top: 2px;
    border: var(--strokeWidthThin) solid var(--colorNeutralStrokeAccessible);
    border-radius: var(--borderRadiusCircular);
    background: var(--colorNeutralBackground1);
  }

  .radio:hover .indicator {
    border-color: var(--colorNeutralStrokeAccessibleHover);
  }

  input:checked + .indicator {
    border-color: var(--colorCompoundBrandStroke);
  }

  input:checked + .indicator::after {
    content: '';
    position: absolute;
    inset: 2px;
    border-radius: var(--borderRadiusCircular);
    background: var(--colorCompoundBrandForeground1);
  }

  input:focus-visible + .indicator {
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

  fieldset:disabled .radio {
    color: var(--colorNeutralForegroundDisabled);
    cursor: not-allowed;
  }

  fieldset:disabled .indicator,
  fieldset:disabled input:checked + .indicator {
    border-color: var(--colorNeutralStrokeDisabled);
  }

  fieldset:disabled input:checked + .indicator::after {
    background: var(--colorNeutralForegroundDisabled);
  }

  fieldset:disabled small,
  fieldset:disabled legend {
    color: var(--colorNeutralForegroundDisabled);
  }
</style>
