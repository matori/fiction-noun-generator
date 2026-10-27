<script lang="ts">
  // 一括変換の入口（SPEC §6.8）。中身はダイアログで扱う
  import { openPaste, openWithFile } from '../lib/batch-state.svelte';
  import Button from '../lib/ui/Button.svelte';
  import Card from '../lib/ui/Card.svelte';

  let fileInput: HTMLInputElement;
</script>

<Card title="一括変換">
  {#snippet actions()}
    <Button icon="folder_open" onclick={() => fileInput.click()}>ファイルを選ぶ</Button>
    <Button icon="clipboard_paste" onclick={openPaste}>テキストを貼り付けて変換</Button>
  {/snippet}
  <p class="hint">
    テキストファイルや貼り付けたテキストを、現在の設定で 1 行ずつ変換します。画面のどこにでもファイルをドロップできます。ファイルはこのブラウザの中で読むだけで、どこにも送信しません。
  </p>
  <input
    bind:this={fileInput}
    class="visually-hidden"
    type="file"
    accept=".txt,.text,.csv,.tsv,.md,text/*"
    tabindex="-1"
    onchange={(e) => {
      const file = e.currentTarget.files?.[0];
      if (file) openWithFile(file);
      e.currentTarget.value = '';
    }}
  />
</Card>

<style>
  .hint {
    color: var(--colorNeutralForeground3);
    font-size: var(--fontSizeBase200);
    line-height: var(--lineHeightBase200);
  }
</style>
