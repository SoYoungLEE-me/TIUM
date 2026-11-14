import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import { useSearchParams } from "react-router";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import AdminSectionHeader from "../../common/components/Admin/AdminSectionHeader";
import PaginationBar from "../../common/components/pagenation";
import { ConfirmModal } from "../../common/components/modal";
import AssistantMessage from "../../common/chatbot/components/AssistantMessage";
import UserMessage from "../../common/chatbot/components/UserMessage";
import Scroll from "../../common/scroll/scroll";
import { toast } from "../../common/components/toast";
import {
  closeInquiry,
  deleteInquiry,
  getInquiryMessages,
  getInquiryThread,
  listAdminInquiryThreads,
  markInquiryRead,
  sendInquiryMessage,
  subscribeInquiryMessages,
  subscribeInquiryThreads,
  type InquiryMessage,
  type InquiryThread,
} from "../../apis/inquiries";
import { queryKeys } from "../../hooks/apis/queryKeys";
import { ApiRequestError } from "../../models/apis/common";
import InquiryTabBar, { type InquiryTabItem } from "./components/InquiryTabBar";

const LIST_TAB = "list";
const PAGE_SIZE = 10;

const AdminInquiriesPage = () => {
  const [params, setParams] = useSearchParams();
  const tabParam = params.get("tab") ?? LIST_TAB;
  const [openTabIds, setOpenTabIds] = useState<string[]>(() =>
    tabParam !== LIST_TAB ? [tabParam] : [],
  );
  const activeTab = tabParam;
  const [page, setPage] = useState(1);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const queryClient = useQueryClient();
  const messagesBottomRef = useRef<HTMLDivElement | null>(null);

  const setActiveTab = (id: string) => {
    setParams(id === LIST_TAB ? {} : { tab: id });
  };

  /** 알림 등에서 ?tab=threadId 로 진입 시 탭 목록에 반영 */
  useEffect(() => {
    if (tabParam === LIST_TAB) return;
    setOpenTabIds((prev) =>
      prev.includes(tabParam) ? prev : [...prev, tabParam],
    );
  }, [tabParam]);

  const openThreadTab = (threadId: string) => {
    setOpenTabIds((prev) =>
      prev.includes(threadId) ? prev : [...prev, threadId],
    );
    setActiveTab(threadId);
  };

  const closeTab = (threadId: string) => {
    setOpenTabIds((prev) => prev.filter((id) => id !== threadId));
    if (activeTab === threadId) {
      setActiveTab(LIST_TAB);
    }
  };

  const listQuery = useQuery({
    queryKey: [...queryKeys.inquiryThreads("admin"), page, PAGE_SIZE],
    queryFn: () => listAdminInquiryThreads({ page, pageSize: PAGE_SIZE }),
  });

  const threads = useMemo(
    () => listQuery.data?.data ?? [],
    [listQuery.data?.data],
  );
  const total = listQuery.data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const openThreadsQuery = useQuery({
    queryKey: ["inquiryOpenTabs", openTabIds],
    queryFn: async () => {
      const rows = await Promise.all(
        openTabIds.map((id) => getInquiryThread(id)),
      );
      return rows.filter(Boolean) as InquiryThread[];
    },
    enabled: openTabIds.length > 0,
  });

  const openThreads = useMemo(
    () => openThreadsQuery.data ?? [],
    [openThreadsQuery.data],
  );

  const threadMeta = useMemo(() => {
    const map = new Map<string, InquiryThread>();
    for (const t of threads) map.set(t.id, t);
    for (const t of openThreads) map.set(t.id, t);
    return map;
  }, [threads, openThreads]);

  const tabs: InquiryTabItem[] = useMemo(() => {
    const items: InquiryTabItem[] = [
      { id: LIST_TAB, label: "문의 목록", closable: false },
    ];
    for (const id of openTabIds) {
      const t = threadMeta.get(id);
      const name = t?.employees?.full_name ?? "문의";
      items.push({
        id,
        label: t?.status === "closed" ? `${name} (종료)` : name,
        closable: true,
      });
    }
    return items;
  }, [openTabIds, threadMeta]);

  const activeThreadId = activeTab === LIST_TAB ? null : activeTab;
  const activeThread = activeThreadId
    ? (threadMeta.get(activeThreadId) ?? null)
    : null;

  const messagesQuery = useQuery({
    queryKey: queryKeys.inquiryMessages(activeThreadId ?? ""),
    queryFn: async () => {
      const msgs = await getInquiryMessages(activeThreadId!);
      await markInquiryRead(activeThreadId!, "hr_admin");
      void queryClient.invalidateQueries({
        queryKey: queryKeys.inquiryUnread("admin"),
      });
      return msgs;
    },
    enabled: Boolean(activeThreadId),
  });

  /** 열린 문의 탭 메시지 Realtime */
  useEffect(() => {
    if (!activeThreadId) return;
    return subscribeInquiryMessages(activeThreadId, (message) => {
      queryClient.setQueryData<InquiryMessage[]>(
        queryKeys.inquiryMessages(activeThreadId),
        (prev) => {
          const list = prev ?? [];
          if (list.some((m) => m.id === message.id)) return list;
          return [...list, message];
        },
      );
      void queryClient.invalidateQueries({
        queryKey: queryKeys.inquiryThreads("admin"),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.inquiryUnread("admin"),
      });
      void queryClient.invalidateQueries({
        queryKey: [...queryKeys.inquiryThreads("admin"), "open-count"],
      });
    });
  }, [activeThreadId, queryClient]);

  /** 문의 목록 Realtime */
  useEffect(() => {
    return subscribeInquiryThreads(() => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.inquiryThreads("admin"),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.inquiryUnread("admin"),
      });
      void queryClient.invalidateQueries({
        queryKey: [...queryKeys.inquiryThreads("admin"), "open-count"],
      });
    });
  }, [queryClient]);

  const invalidateAll = () => {
    void queryClient.invalidateQueries({
      queryKey: queryKeys.inquiryThreads("admin"),
    });
    void queryClient.invalidateQueries({ queryKey: ["inquiryOpenTabs"] });
    if (activeThreadId) {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.inquiryMessages(activeThreadId),
      });
    }
  };

  const sendMutation = useMutation({
    mutationFn: () =>
      sendInquiryMessage({
        threadId: activeThreadId!,
        body: draft,
        channel: "admin",
      }),
    onSuccess: () => {
      setDraft("");
      invalidateAll();
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiRequestError
          ? err.message
          : "메시지를 보내지 못했습니다.",
      );
    },
  });

  const closeMutation = useMutation({
    mutationFn: () => closeInquiry(activeThreadId!),
    onSuccess: () => {
      toast.success("문의가 종료되었습니다.");
      invalidateAll();
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiRequestError ? err.message : "종료에 실패했습니다.",
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (threadId: string) => deleteInquiry(threadId),
    onSuccess: (_data, threadId) => {
      toast.success("문의가 삭제되었습니다.");
      closeTab(threadId);
      invalidateAll();
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiRequestError ? err.message : "삭제에 실패했습니다.",
      );
    },
  });

  const isClosed = activeThread?.status === "closed";
  const messageCount = messagesQuery.data?.length ?? 0;

  /** 채팅방 진입·메시지 갱신 시 맨 아래(최신)부터 보이기 */
  useEffect(() => {
    if (!activeThreadId || messageCount === 0) return;
    const id = window.requestAnimationFrame(() => {
      messagesBottomRef.current?.scrollIntoView({ behavior: "auto" });
    });
    return () => window.cancelAnimationFrame(id);
  }, [activeThreadId, messageCount, messagesQuery.dataUpdatedAt]);

  return (
    <Box
      sx={{
        maxWidth: 1100,
        mx: "auto",
        py: 2,
        height: "100%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ flexShrink: 0 }}>
        <AdminSectionHeader
          title="문의함"
          description="직원 문의를 확인하고 답변합니다."
        />
      </Box>

      <Paper
        variant="outlined"
        sx={{
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          flex: 1,
          minHeight: 0,
          height: "calc(100dvh - 200px)",
        }}
      >
        <Box sx={{ px: 2, pt: 1.5, flexShrink: 0 }}>
          <Typography variant="h2" sx={{ mb: 0.5 }}>
            문의
          </Typography>
        </Box>

        <Box sx={{ flexShrink: 0 }}>
          <InquiryTabBar
            tabs={tabs}
            activeId={activeTab}
            onChange={setActiveTab}
            onCloseTab={closeTab}
          />
        </Box>

        {activeTab === LIST_TAB ? (
          <>
            <Scroll sx={{ flex: 1, minHeight: 0 }}>
              {threads.length === 0 ? (
                <Typography color="text.secondary" sx={{ p: 3 }}>
                  문의가 없습니다.
                </Typography>
              ) : (
                <Stack spacing={0} sx={{ divideY: 1 }}>
                  {threads.map((thread) => (
                    <Box
                      key={thread.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        px: 2,
                        py: 1.5,
                        borderBottom: 1,
                        borderColor: "divider",
                        cursor: "pointer",
                        "&:hover": { bgcolor: "action.hover" },
                      }}
                      onClick={() => openThreadTab(thread.id)}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{ alignItems: "center", mb: 0.25 }}
                        >
                          <Typography sx={{ fontWeight: 700 }} noWrap>
                            {thread.employees?.full_name ?? "직원"}
                          </Typography>
                          <Chip
                            size="small"
                            label={
                              thread.status === "closed"
                                ? "종료"
                                : thread.status === "draft" ||
                                    !thread.has_user_message
                                  ? "임시 저장"
                                  : "진행 중"
                            }
                            color={
                              thread.status === "closed"
                                ? "default"
                                : thread.status === "draft" ||
                                    !thread.has_user_message
                                  ? "warning"
                                  : "primary"
                            }
                          />
                          {thread.unread_admin > 0 ? (
                            <Chip
                              size="small"
                              color="error"
                              label={`미읽음 ${thread.unread_admin}`}
                            />
                          ) : null}
                        </Stack>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {thread.subject} ·{" "}
                          {new Date(thread.last_message_at).toLocaleString(
                            "ko-KR",
                          )}
                        </Typography>
                      </Box>
                      {thread.status === "closed" ||
                      thread.status === "draft" ||
                      !thread.has_user_message ? (
                        <IconButton
                          aria-label="문의 삭제"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTargetId(thread.id);
                          }}
                        >
                          <DeleteOutlineRoundedIcon />
                        </IconButton>
                      ) : null}
                    </Box>
                  ))}
                </Stack>
              )}
            </Scroll>
            <PaginationBar
              note={`총 ${total}건`}
              page={Math.min(page, pageCount)}
              pageCount={pageCount}
              onPageChange={setPage}
            />
            <ConfirmModal
              open={Boolean(deleteTargetId)}
              title="대화 삭제"
              message="대화를 삭제하시겠습니까?"
              confirmLabel="예"
              cancelLabel="아니오"
              confirmColor="error"
              onCancel={() => setDeleteTargetId(null)}
              onConfirm={() => {
                if (!deleteTargetId) return;
                const id = deleteTargetId;
                setDeleteTargetId(null);
                deleteMutation.mutate(id);
              }}
            />
          </>
        ) : (
          <>
            <Box
              sx={{
                px: 2.5,
                py: 1.5,
                borderBottom: 1,
                borderColor: "divider",
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexShrink: 0,
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 700 }} noWrap>
                  {activeThread?.employees?.full_name ?? "직원"} ·{" "}
                  {activeThread?.subject ?? "문의"}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {activeThread?.employees?.email}
                </Typography>
              </Box>
              {!isClosed ? (
                <Button
                  variant="outlined"
                  color="inherit"
                  disabled={closeMutation.isPending}
                  onClick={() => closeMutation.mutate()}
                >
                  문의 종료
                </Button>
              ) : (
                <Chip size="small" label="종료됨" />
              )}
            </Box>

            <Scroll
              sx={{
                flex: 1,
                minHeight: 0,
                px: 2,
                py: 2,
                display: "flex",
                flexDirection: "column",
                gap: 2,
                bgcolor: "background.default",
              }}
            >
              {(messagesQuery.data ?? []).map((m) => {
                // 문의함 채팅방: admin 채널=오른쪽, 그 외(챗봇·시스템)=왼쪽
                if (m.channel === "admin") {
                  return <UserMessage key={m.id} text={m.body} />;
                }
                return <AssistantMessage key={m.id} message={m.body} />;
              })}
              <div ref={messagesBottomRef} />
            </Scroll>

            <Box
              sx={{
                p: 2,
                borderTop: 1,
                borderColor: "divider",
                display: "flex",
                gap: 1,
                flexShrink: 0,
              }}
            >
              <TextField
                size="small"
                fullWidth
                placeholder={
                  isClosed ? "종료된 문의입니다" : "답변을 입력하세요"
                }
                value={draft}
                disabled={isClosed || sendMutation.isPending}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (draft.trim() && !isClosed) sendMutation.mutate();
                  }
                }}
              />
              <Button
                variant="contained"
                disabled={!draft.trim() || isClosed || sendMutation.isPending}
                onClick={() => sendMutation.mutate()}
              >
                전송
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default AdminInquiriesPage;
