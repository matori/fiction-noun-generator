import { showToast } from './ui/toast-state.svelte';

export async function copyText(text: string, message = 'コピーしました'): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    showToast(message);
    return true;
  } catch {
    showToast('コピーできませんでした', 'error');
    return false;
  }
}

export function downloadJson(filename: string, data: unknown): void {
  downloadText(filename, JSON.stringify(data, null, 2), 'application/json');
}

export function downloadText(filename: string, text: string, type = 'text/plain;charset=utf-8'): void {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
