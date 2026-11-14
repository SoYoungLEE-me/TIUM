import { useMemo, useState } from "react";
import { LEAVE_FILTERS } from "../../configs/employee/leaves";
import type { LeaveFilter } from "../../models/employee/leaves";
import {
  countByLeaveFilter,
  matchesLeaveFilter,
  sortByCreatedDesc,
  toLeaveHistoryItem,
} from "../../utils/employee/leaves";
import { useLeaveBalance, useMyLeaveRequests } from "../apis/useLeaves";

export const useEmployeeLeaves = () => {
  const [filter, setFilter] = useState<LeaveFilter>("all");

  const balanceQuery = useLeaveBalance();
  const requestsQuery = useMyLeaveRequests();

  const sortedRequests = useMemo(
    () => sortByCreatedDesc((requestsQuery.data ?? []).map(toLeaveHistoryItem)),
    [requestsQuery.data]
  );

  const filteredRequests = useMemo(
    () =>
      sortedRequests.filter((request) => matchesLeaveFilter(request, filter)),
    [sortedRequests, filter]
  );

  const filterOptions = useMemo(
    () =>
      LEAVE_FILTERS.map((option) => ({
        ...option,
        count: countByLeaveFilter(sortedRequests, option.value),
      })),
    [sortedRequests]
  );

  return {
    balance: balanceQuery.data ?? null,
    filter,
    filterOptions,
    requests: filteredRequests,
    isLoading: balanceQuery.isLoading || requestsQuery.isLoading,
    isError: balanceQuery.isError || requestsQuery.isError,
    changeFilter: setFilter,
  };
};
