import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "./authStore";

export const AuthBootstrap = ({ children }: { children: ReactNode }) => {
  const initAuth = useAuthStore((s) => s.initAuth);

  useEffect(() => {
    const unsubscribe = initAuth();
    return unsubscribe;
  }, [initAuth]);

  return children;
};
