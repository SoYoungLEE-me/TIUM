import { Pagination, Stack, Typography } from "@mui/material";

type PaginationBarProps = {
  note: string;
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
};

/** 테이블/목록 하단 — 안내 문구(sm+) + 페이지네이션 */
const PaginationBar = ({
  note,
  page,
  pageCount,
  onPageChange,
}: PaginationBarProps) => {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{
        px: 2.5,
        py: 1.75,
        alignItems: "center",
        justifyContent: { xs: "center", sm: "space-between" },
      }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ display: { xs: "none", sm: "block" } }}
      >
        {note}
      </Typography>
      <Pagination
        count={pageCount}
        page={page}
        onChange={(_, next) => onPageChange(next)}
        shape="rounded"
        color="primary"
        size="small"
      />
    </Stack>
  );
};

export default PaginationBar;
