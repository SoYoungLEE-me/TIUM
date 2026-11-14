import { useCallback, useEffect, useRef, useState } from "react";
import {
  Badge,
  Box,
  CircularProgress,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Popover,
  Typography,
} from "@mui/material";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import { useNavigate } from "react-router";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  countUnreadInquiries,
  listAdminInquiryThreads,
  listMyInquiryThreads,
} from "../../apis/inquiries";
import { useAdminLeaves } from "../../hooks/apis/useAdminLeaves";
import { queryKeys } from "../../hooks/apis/queryKeys";

type NotificationBellProps = {
  variant: "employee" | "admin";
};

type NotifItem = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
};

const PAGE = 15;

const NotificationBell = ({ variant }: NotificationBellProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();
  const listRef = useRef<HTMLUListElement | null>(null);

  const unreadQuery = useQuery({
    queryKey: queryKeys.inquiryUnread(variant),
    queryFn: () =>
      countUnreadInquiries(variant === "admin" ? "hr_admin" : "employee"),
    refetchInterval: 30_000,
  });

  const pendingLeavesQuery = useAdminLeaves(
    { status: "pending", page: 1, page_size: 1 },
    { enabled: variant === "admin" },
  );

  const infinite = useInfiniteQuery({
    queryKey: [...queryKeys.notifications(variant), "unread-only"],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      if (variant === "admin") {
        const page = Math.floor(pageParam / PAGE) + 1;
        const { data } = await listAdminInquiryThreads({
          page,
          pageSize: PAGE,
        });
        // 미읽음 문의만 알림에 표시
        return data.filter((t) => (t.unread_admin ?? 0) > 0);
      }
      const page = Math.floor(pageParam / PAGE) + 1;
      const { data } = await listMyInquiryThreads({
        page,
        pageSize: PAGE,
      });
      return data.filter((t) => (t.unread_employee ?? 0) > 0);
    },
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.length < PAGE) return undefined;
      return pages.length * PAGE;
    },
    enabled: open,
  });

  const pendingCount =
    variant === "admin"
      ? (pendingLeavesQuery.data?.pagination.total ??
        pendingLeavesQuery.data?.data.length ??
        0)
      : 0;
  const inquiryUnread = unreadQuery.data ?? 0;
  /** 사이드바 신청검토 + 문의함 뱃지와 동일 합산 */
  const badgeCount =
    variant === "admin" ? pendingCount + inquiryUnread : inquiryUnread;

  const items: NotifItem[] = [];
  if (variant === "admin" && pendingCount > 0 && open) {
    items.push({
      id: "pending-leaves",
      title: `연차 검토 대기 ${pendingCount}건`,
      subtitle: "신청 검토로 이동",
      href: "/admin",
    });
  }
  for (const page of infinite.data?.pages ?? []) {
    for (const thread of page) {
      const unread =
        variant === "admin"
          ? (thread.unread_admin ?? 0)
          : (thread.unread_employee ?? 0);
      items.push({
        id: thread.id,
        title:
          unread > 0 ? `${thread.subject} · 미읽음 ${unread}` : thread.subject,
        subtitle: "문의 목록으로 이동",
        href:
          variant === "admin"
            ? `/admin/inquiries?tab=${thread.id}`
            : "/inquiries",
      });
    }
  }

  const onScroll = useCallback(() => {
    const el = listRef.current;
    if (!el || !infinite.hasNextPage || infinite.isFetchingNextPage) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) {
      void infinite.fetchNextPage();
    }
  }, [infinite]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current;
    if (!el) return;
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [open, onScroll]);

  return (
    <>
      <IconButton
        aria-label="알림"
        onClick={(e) => setAnchorEl(e.currentTarget)}
      >
        <Badge badgeContent={badgeCount > 0 ? badgeCount : 0} color="error">
          <NotificationsNoneRoundedIcon />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: { width: 340, maxHeight: 420, borderRadius: "14px", mt: 1 },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography sx={{ fontWeight: 700 }}>알림</Typography>
        </Box>
        <List
          ref={listRef}
          dense
          sx={{ maxHeight: 340, overflow: "auto", py: 0 }}
        >
          {items.length === 0 && !infinite.isLoading ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ px: 2, py: 2 }}
            >
              새 알림이 없습니다.
            </Typography>
          ) : null}
          {items.map((item) => (
            <ListItemButton
              key={item.id}
              onClick={() => {
                setAnchorEl(null);
                navigate(item.href);
              }}
            >
              <ListItemText primary={item.title} secondary={item.subtitle} />
            </ListItemButton>
          ))}
          {infinite.isFetchingNextPage || infinite.isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
              <CircularProgress size={20} />
            </Box>
          ) : null}
        </List>
      </Popover>
    </>
  );
};

export default NotificationBell;
