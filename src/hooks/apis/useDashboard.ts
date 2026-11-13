import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "../../apis/dashboard";
import { queryKeys } from "./queryKeys";

export const useDashboard = () =>
  useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: getDashboard,
  });
