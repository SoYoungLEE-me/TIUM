import { Box, Typography } from "@mui/material";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import {
  LEAVES_CHATBOT_GUIDE,
  LEAVES_TITLE,
} from "../../configs/employee/leaves";
import { useEmployeeLeaves } from "../../hooks/employee/leaves";
import LeaveBalanceCards from "./components/LeaveBalanceCards";
import LeaveRequestList from "./components/LeaveRequestList";

const LeavesPage = () => {
  const { balance, filter, filterOptions, requests, changeFilter } =
    useEmployeeLeaves();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* 헤더 */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 1.5,
        }}
      >
        <Typography variant="h1" component="h1">
          {LEAVES_TITLE}
        </Typography>
        <Box
          sx={(theme) => ({
            display: "inline-flex",
            alignItems: "center",
            gap: 1,
            px: 1.75,
            py: 1,
            borderRadius: 999,
            bgcolor: theme.palette.leave.annual.bg,
            color: theme.palette.leave.annual.fg,
          })}
        >
          <AutoAwesomeRoundedIcon sx={{ fontSize: 18 }} />
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: "inherit" }}
          >
            {LEAVES_CHATBOT_GUIDE}
          </Typography>
        </Box>
      </Box>

      <LeaveBalanceCards balance={balance} />

      <LeaveRequestList
        requests={requests}
        filter={filter}
        filterOptions={filterOptions}
        onChangeFilter={changeFilter}
      />
    </Box>
  );
};

export default LeavesPage;
