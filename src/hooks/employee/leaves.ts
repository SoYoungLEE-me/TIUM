import { useMemo, useState } from "react";
import { LEAVE_FILTERS } from "../../configs/employee/leaves";
import leavesMock from "../../mocks/employee/leaves.json";
import type { LeaveFilter, LeavesData } from "../../models/employee/leaves";
import {
  countByLeaveFilter,
  matchesLeaveFilter,
  sortByCreatedDesc,
} from "../../utils/employee/leaves";

// TODO: Supabase 연결 후 leave_balances · leave_requests 조회로 교체
const data = leavesMock as LeavesData;

export const useEmployeeLeaves = () => {
  const [filter, setFilter] = useState<LeaveFilter>("all");

  const sortedRequests = useMemo(() => sortByCreatedDesc(data.requests), []);

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
    balance: data.balance,
    filter,
    filterOptions,
    requests: filteredRequests,
    changeFilter: setFilter,
  };
};
