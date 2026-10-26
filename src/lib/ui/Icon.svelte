<script lang="ts">
  // Fluent System Icons を文字色（currentColor）で表示する。装飾用なので読み上げない
  import { ICONS, type IconName } from './icons';

  interface Props {
    name: IconName;
    size?: 16 | 20;
  }

  let { name, size = 20 }: Props = $props();
</script>

<span class="icon" style:--icon-size="{size}px" aria-hidden="true">
  {@html ICONS[name][size]}
</span>

<style>
  .icon {
    display: inline-flex;
    flex: none;
    width: var(--icon-size);
    height: var(--icon-size);
  }

  .icon :global(svg) {
    width: 100%;
    height: 100%;
    fill: currentColor;
  }
</style>
