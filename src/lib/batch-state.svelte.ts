// 一括変換ダイアログの状態（SPEC §6.8）

import { checkFileSize, decodeText, isTextFile, type TextEncodingName } from './batch';
import { showToast } from './ui/toast-state.svelte';

export interface BatchFile {
  name: string;
  encoding: TextEncodingName;
  text: string;
}

export const batch = $state({
  open: false,
  step: 'input' as 'input' | 'result',
  /** ファイルから開いたときのファイル。貼り付けから開いたときは null */
  file: null as BatchFile | null,
  pasteText: '',
  footer: true,
  /** 結果をコピーかダウンロードしたか。していなければ閉じる前に確認する */
  saved: false,
});

function reset() {
  batch.step = 'input';
  batch.file = null;
  batch.pasteText = '';
  batch.footer = true;
  batch.saved = false;
}

export function openPaste(): void {
  reset();
  batch.open = true;
}

/** ファイルを読んで確認の段階で開く。読めないときは通知して開かない */
export async function openWithFile(file: File): Promise<void> {
  if (!isTextFile(file.name, file.type)) {
    showToast('テキストファイルではありません', 'error');
    return;
  }
  const size = checkFileSize(file.size);
  if (!size.ok) {
    showToast(size.message, 'error');
    return;
  }
  let decoded: ReturnType<typeof decodeText>;
  try {
    decoded = decodeText(new Uint8Array(await file.arrayBuffer()));
  } catch {
    showToast('ファイルを読み込めませんでした', 'error');
    return;
  }
  reset();
  batch.file = { name: file.name, ...decoded };
  batch.open = true;
}
