import { useQuery } from "@tanstack/react-query";
import { getCompanyPolicy } from "../../apis/companyPolicy";
import { queryKeys } from "./queryKeys";

export const useCompanyPolicy = () =>
  useQuery({
    queryKey: queryKeys.companyPolicy,
    queryFn: getCompanyPolicy,
  });
