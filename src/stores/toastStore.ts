import { create } from "zustand";

export type ToastSeverity = "success" | "error" | "warning" | "info";

export type ToastItem = {
  id: string;
  message: string;
  severity: ToastSeverity;
  duration: number;
};

type ToastState = {
  /** 동시에 최대 1개 */
  toast: ToastItem | null;
  push: (
    message: string,
    severity: ToastSeverity,
    duration?: number
  ) => void;
  dismiss: (id?: string) => void;
};

const DEFAULT_DURATION: Record<ToastSeverity, number> = {
  success: 3500,
  info: 4000,
  warning: 4500,
  error: 5500,
};

let toastSeq = 0;

export const useToastStore = create<ToastState>((set) => ({
  toast: null,

  push: (message, severity, duration) => {
    const id = `toast-${Date.now()}-${toastSeq++}`;
    set({
      toast: {
        id,
        message,
        severity,
        duration: duration ?? DEFAULT_DURATION[severity],
      },
    });
  },

  dismiss: (id) => {
    set((state) => {
      if (!state.toast) return state;
      if (id && state.toast.id !== id) return state;
      return { toast: null };
    });
  },
}));
