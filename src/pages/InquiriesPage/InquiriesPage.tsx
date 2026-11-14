import {
  Box,
  Button,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import AdminSectionHeader from "../../common/components/Admin/AdminSectionHeader";
import { listMyInquiryThreads } from "../../apis/inquiries";
import { queryKeys } from "../../hooks/apis/queryKeys";

/**
 * 직원 문의 목록. 상세 대화는 챗봇 패널의 문의 모드를 권장하며,
 * 여기서는 스레드 요약과 FAB 유도.
 */
const InquiriesPage = () => {
  const threadsQuery = useQuery({
    queryKey: queryKeys.inquiryThreads("employee"),
    queryFn: () => listMyInquiryThreads({ page: 1, pageSize: 50 }),
  });

  const threads = threadsQuery.data?.data ?? [];

  const handleNew = () => {
    window.dispatchEvent(
      new CustomEvent("open-chatbot-inquiry", {
        detail: { startNew: true },
      }),
    );
  };

  return (
    <Box sx={{ maxWidth: 720, mx: "auto", py: 2 }}>
      <AdminSectionHeader
        title="문의"
        description="관리자에게 남긴 문의와 답변을 확인합니다. 우측 하단 HR 도우미에서도 문의할 수 있어요."
        action={
          <Button variant="contained" onClick={handleNew}>
            새 문의
          </Button>
        }
      />

      <Paper variant="outlined">
        {threads.length === 0 ? (
          <Typography color="text.secondary" sx={{ p: 3 }}>
            문의 내역이 없습니다.
          </Typography>
        ) : (
          <List>
            {threads.map((thread) => (
              <ListItemButton
                key={thread.id}
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent("open-chatbot-inquiry", {
                      detail: { threadId: thread.id },
                    }),
                  )
                }
              >
                <ListItemText
                  primary={thread.subject}
                  secondary={new Date(thread.last_message_at).toLocaleString(
                    "ko-KR",
                  )}
                />
                {thread.unread_employee > 0 ? (
                  <Box
                    sx={{
                      minWidth: 22,
                      height: 22,
                      borderRadius: 999,
                      bgcolor: "error.main",
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {thread.unread_employee}
                  </Box>
                ) : null}
              </ListItemButton>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default InquiriesPage;
