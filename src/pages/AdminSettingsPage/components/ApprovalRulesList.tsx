import { useState } from "react";
import {
  Box,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { AUTO_APPROVAL_CONDITIONS } from "../../../configs/admin/setting";
import type { ApprovalRule } from "../../../models/admin/setting";
import { getPrimaryApprovalRule } from "../../../utils/admin/setting";

type ApprovalRulesListProps = {
  rules: ApprovalRule[];
  onMaxConsecutiveDaysChange: (ruleId: string, days: number) => void;
};

const INITIAL_CONDITION_STATE = Object.fromEntries(
  AUTO_APPROVAL_CONDITIONS.map((condition) => [condition.id, true])
) as Record<string, boolean>;

const ApprovalRulesList = ({
  rules,
  onMaxConsecutiveDaysChange,
}: ApprovalRulesListProps) => {
  const primaryRule = getPrimaryApprovalRule(rules);
  const maxConsecutiveDays = primaryRule?.max_consecutive_days ?? 3;
  const minNoticeDays = primaryRule?.min_notice_days ?? 0;
  const [enabledById, setEnabledById] = useState(INITIAL_CONDITION_STATE);

  return (
    <Paper variant="outlined" sx={{ p: 2.5 }}>
      <Typography variant="h2" sx={{ mb: 1 }}>
        자동 승인 조건
      </Typography>

      <Stack>
        {AUTO_APPROVAL_CONDITIONS.map((condition) => {
          const description =
            condition.id === "notice_deadline"
              ? minNoticeDays > 0
                ? `최소 ${minNoticeDays}일 이전에 신청`
                : condition.description
              : condition.description;

          const isConsecutive = condition.id === "consecutive_limit";

          return (
            <Box
              key={condition.id}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                py: 1.75,
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 700, mb: 0.25 }}>
                  {condition.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {description}
                </Typography>
              </Box>

              <Stack
                direction="row"
                spacing={1.25}
                sx={{ alignItems: "center", flexShrink: 0 }}
              >
                {isConsecutive ? (
                  <>
                    <TextField
                      type="number"
                      size="small"
                      value={maxConsecutiveDays}
                      disabled={!primaryRule || !enabledById[condition.id]}
                      onChange={(e) => {
                        if (!primaryRule) return;
                        const next = Math.max(1, Number(e.target.value) || 1);
                        onMaxConsecutiveDaysChange(primaryRule.id, next);
                      }}
                      slotProps={{
                        htmlInput: {
                          min: 1,
                          style: { textAlign: "center" },
                        },
                      }}
                      sx={{
                        width: 64,
                        "& .MuiOutlinedInput-root": {
                          bgcolor: "background.paper",
                        },
                      }}
                    />
                    <Typography color="text.secondary">일</Typography>
                  </>
                ) : null}
                <Switch
                  checked={Boolean(enabledById[condition.id])}
                  onChange={(e) =>
                    setEnabledById((prev) => ({
                      ...prev,
                      [condition.id]: e.target.checked,
                    }))
                  }
                  slotProps={{
                    input: { "aria-label": `${condition.title} 적용` },
                  }}
                />
              </Stack>
            </Box>
          );
        })}
      </Stack>
    </Paper>
  );
};

export default ApprovalRulesList;
