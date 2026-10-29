export interface ToastNotice {
  title: string;
  text: string;
}

const listeners = new Set<(notice: ToastNotice) => void>();

export function showToast(title: string, text: string) {
  listeners.forEach((listener) => listener({ title, text }));
}

export function subscribeToasts(listener: (notice: ToastNotice) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
