import {
  useToastStore,
  type ToastSeverity,
} from "../../../stores/toastStore";

const show = (
  message: string,
  severity: ToastSeverity,
  duration?: number
) => {
  useToastStore.getState().push(message, severity, duration);
};

/** 전역 Toast API — 에러 / 주의 / 성공 / 안내 */
export const toast = {
  success: (message: string, duration?: number) =>
    show(message, "success", duration),
  error: (message: string, duration?: number) =>
    show(message, "error", duration),
  warning: (message: string, duration?: number) =>
    show(message, "warning", duration),
  info: (message: string, duration?: number) =>
    show(message, "info", duration),
};
