// Tiny global toast store: call toast() from anywhere (components, contexts);
// <Toaster /> renders them.
let toasts = [];
let nextId = 1;
const listeners = new Set();
const MAX_VISIBLE = 4;

const publish = () => listeners.forEach((listener) => listener());

export function toast(options) {
  const id = nextId++;
  toasts = [...toasts, { id, duration: 5000, variant: "default", ...options }].slice(
    -MAX_VISIBLE,
  );
  publish();
  return id;
}

export function dismissToast(id) {
  toasts = toasts.filter((t) => t.id !== id);
  publish();
}

export const subscribeToasts = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const getToasts = () => toasts;
