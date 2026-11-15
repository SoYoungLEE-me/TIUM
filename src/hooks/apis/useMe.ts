import { useQuery } from "@tanstack/react-query";
import { getMe } from "../../apis/me";
import { useAuthStore } from "../../stores/authStore";
import { queryKeys } from "./queryKeys";

export const useMe = (options?: { enabled?: boolean }) => {
  const session = useAuthStore((s) => s.session);
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: getMe,
    enabled: (options?.enabled ?? true) && Boolean(session),
  });
};
