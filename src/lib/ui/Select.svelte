<script lang="ts" module>
  export interface SelectOption<V extends string> {
    value: V;
    label: string;
  }

  export interface SelectGroup<V extends string> {
    label: string;
    options: SelectOption<V>[];
  }
</script>

<script lang="ts" generics="T extends string">
  interface Props {
    value: T;
    /** グループなしの選択肢 */
    options?: SelectOption<T>[];
    /** optgroup で分けた選択肢 */
    groups?: SelectGroup<T>[];
    label?: string;
    ariaLabel?: string;
    size?: 'medium' | 'small';
    disabled?: boolean;
    onchange?: (value: T) => void;
  }

  let {
    value = $bindable(),
    options = [],
    groups = [],
    label,
    ariaLabel,
    size = 'medium',
    disabled = false,
    onchange,
  }: Props = $props();

  const id = $props.id();
</script>

<div class="field">
  {#if label}<label for={id}>{label}</label>{/if}
  <span class="control {size}" class:disabled>
    <select
      {id}
      bind:value
      {disabled}
      aria-label={ariaLabel}
      onchange={() => onchange?.(value)}
    >
      {#each options as option (option.value)}
        <option value={option.value}>{option.label}</option>
      {/each}
      {#each groups as group (group.label)}
        <optgroup label={group.label}>
          {#each group.options as option (option.value)}
            <option value={option.value}>{option.label}</option>
          {/each}
        </optgroup>
      {/each}
    </select>
    <svg class="chevron" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M2.15 4.65a.5.5 0 0 1 .7 0L6 7.79l3.15-3.14a.5.5 0 1 1 .7.7l-3.5 3.5a.5.5 0 0 1-.7 0l-3.5-3.5a.5.5 0 0 1 0-.7Z" />
    </svg>
  </span>
</div>

<style>
  .field {
    display: flex;
    flex-direction: column;
    gap: var(--spacingVerticalXXS);
    min-width: 0;
  }

  label {
    font-size: var(--fontSizeBase300);
    line-height: var(--lineHeightBase300);
    color: var(--colorNeutralForeground1);
  }

  .control {
    position: relative;
    display: block;
  }

  select {
    width: 100%;
    min-height: 32px;
    padding: 0 calc(var(--spacingHorizontalM) + 16px) 0 var(--spacingHorizontalM);
    appearance: none;
    background: var(--colorNeutralBackground1);
    border: var(--strokeWidthThin) solid var(--colorNeutralStroke1);
    border-bottom-color: var(--colorNeutralStrokeAccessible);
    border-radius: var(--borderRadiusMedium);
    color: var(--colorNeutralForeground1);
    font-size: var(--fontSizeBase300);
    cursor: pointer;
  }

  select:hover {
    border-color: var(--colorNeutralStroke1Hover);
    border-bottom-color: var(--colorNeutralStrokeAccessibleHover);
  }

  select:focus-visible {
    outline: none;
    border-bottom-color: var(--colorCompoundBrandStroke);
    box-shadow: inset 0 calc(-1 * var(--strokeWidthThin)) 0 var(--colorCompoundBrandStroke);
  }

  option,
  optgroup {
    background: var(--colorNeutralBackground1);
    color: var(--colorNeutralForeground1);
  }

  .small select {
    min-height: 24px;
    padding: 0 calc(var(--spacingHorizontalS) + 14px) 0 var(--spacingHorizontalS);
    font-size: var(--fontSizeBase200);
  }

  .chevron {
    position: absolute;
    top: 50%;
    right: var(--spacingHorizontalS);
    width: 12px;
    height: 12px;
    transform: translateY(-50%);
    fill: var(--colorNeutralForeground3);
    pointer-events: none;
  }

  .disabled select {
    background: var(--colorTransparentBackground);
    border-color: var(--colorNeutralStrokeDisabled);
    color: var(--colorNeutralForegroundDisabled);
    cursor: not-allowed;
  }

  .disabled .chevron {
    fill: var(--colorNeutralForegroundDisabled);
  }
</style>
