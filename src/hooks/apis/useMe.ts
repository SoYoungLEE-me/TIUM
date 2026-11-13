import { useQuery } from "@tanstack/react-query";
import { getMe } from "../../apis/me";
import { queryKeys } from "./queryKeys";

export const useMe = () =>
  useQuery({
    queryKey: queryKeys.me,
    queryFn: getMe,
  });
