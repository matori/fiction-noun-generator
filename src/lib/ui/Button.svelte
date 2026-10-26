<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import Icon from './Icon.svelte';
  import type { IconName } from './icons';

  interface Props extends HTMLButtonAttributes {
    appearance?: 'secondary' | 'primary' | 'subtle';
    size?: 'medium' | 'small';
    /** ラベルの前に出すアイコン。サイズはボタンに合わせる（medium 20px、small 16px） */
    icon?: IconName;
    children: Snippet;
  }

  let { appearance = 'secondary', size = 'medium', type = 'button', icon, children, ...rest }: Props =
    $props();
</script>

<button class="button {appearance} {size}" {type} {...rest}>
  {#if icon}<Icon name={icon} size={size === 'small' ? 16 : 20} />{/if}
  {@render children()}
</button>

<style>
  .button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacingHorizontalSNudge);
    min-height: 32px;
    min-width: 32px;
    padding: 0 var(--spacingHorizontalM);
    border: var(--strokeWidthThin) solid var(--colorNeutralStroke1);
    border-radius: var(--borderRadiusMedium);
    background: var(--colorNeutralBackground1);
    color: var(--colorNeutralForeground1);
    font-size: var(--fontSizeBase300);
    line-height: var(--lineHeightBase300);
    font-weight: var(--fontWeightSemibold);
    white-space: nowrap;
    cursor: pointer;
    transition:
      background var(--durationFaster) var(--curveEasyEase),
      border-color var(--durationFaster) var(--curveEasyEase);
  }

  .button:hover {
    background: var(--colorNeutralBackground1Hover);
    border-color: var(--colorNeutralStroke1Hover);
  }

  .button:active {
    background: var(--colorNeutralBackground1Pressed);
    border-color: var(--colorNeutralStroke1Pressed);
  }

  .small {
    gap: var(--spacingHorizontalXS);
    min-height: 24px;
    min-width: 24px;
    padding: 0 var(--spacingHorizontalS);
    font-size: var(--fontSizeBase200);
    line-height: var(--lineHeightBase200);
    font-weight: var(--fontWeightRegular);
  }

  .primary {
    background: var(--colorBrandBackground);
    border-color: var(--colorTransparentStroke);
    color: var(--colorNeutralForegroundOnBrand);
  }

  .primary:hover {
    background: var(--colorBrandBackgroundHover);
    border-color: var(--colorTransparentStroke);
  }

  .primary:active {
    background: var(--colorBrandBackgroundPressed);
    border-color: var(--colorTransparentStroke);
  }

  .subtle {
    background: var(--colorSubtleBackground);
    border-color: var(--colorTransparentStroke);
    color: var(--colorNeutralForeground2);
  }

  .subtle:hover {
    background: var(--colorSubtleBackgroundHover);
    border-color: var(--colorTransparentStroke);
    color: var(--colorNeutralForeground2Hover);
  }

  .subtle:active {
    background: var(--colorSubtleBackgroundPressed);
  }

  .button:disabled {
    background: var(--colorNeutralBackgroundDisabled);
    border-color: var(--colorNeutralStrokeDisabled);
    color: var(--colorNeutralForegroundDisabled);
    cursor: not-allowed;
  }

  .subtle:disabled {
    background: var(--colorTransparentBackground);
    border-color: var(--colorTransparentStroke);
  }
</style>
