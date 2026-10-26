// 画面下に短いメッセージを出す（コピー完了など）

export const toastState = $state({ message: '', intent: 'success' as 'success' | 'error', id: 0 });

let timer: ReturnType<typeof setTimeout> | undefined;

export function showToast(message: string, intent: 'success' | 'error' = 'success'): void {
  toastState.message = message;
  toastState.intent = intent;
  toastState.id += 1;
  clearTimeout(timer);
  timer = setTimeout(() => (toastState.message = ''), 2500);
}
