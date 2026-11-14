import {
  Box,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import {
  ALWAYS_ENFORCED_APPROVAL_CHECKS,
  DEFAULT_MAX_CONSECUTIVE_DAYS,
} from "../../../configs/admin/setting";
import type { ApprovalRule } from "../../../models/admin/setting";
import { getPrimaryApprovalRule } from "../../../utils/admin/setting";

type ApprovalRulesListProps = {
  rules: ApprovalRule[];
  onApprovalRuleLimitsChange: (
    ruleId: string,
    update: Partial<
      Pick<ApprovalRule, "min_notice_days" | "max_consecutive_days">
    >,
  ) => void;
};

const rowSx = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 2,
  py: 1.75,
  borderBottom: "1px solid",
  borderColor: "divider",
} as const;

const ApprovalRulesList = ({
  rules,
  onApprovalRuleLimitsChange,
}: ApprovalRulesListProps) => {
  const primaryRule = getPrimaryApprovalRule(rules);
  const minNoticeDays = primaryRule?.min_notice_days ?? 0;
  const maxConsecutiveDays = primaryRule?.max_consecutive_days;
  const noticeEnabled = minNoticeDays > 0;
  const consecutiveEnabled = maxConsecutiveDays != null;

  return (
    <Paper variant="outlined" sx={{ p: 2.5 }}>
      <Typography variant="h2" sx={{ mb: 0.5 }}>
        승인 규칙
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        {primaryRule
          ? `${primaryRule.rule_name} · 신청 기한과 연속 한도를 설정합니다.`
          : "활성화된 승인 규칙이 없습니다."}
      </Typography>

      <Stack>
        {ALWAYS_ENFORCED_APPROVAL_CHECKS.map((check) => (
          <Box key={check.title} sx={rowSx}>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700, mb: 0.25 }}>
                {check.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {check.description}
              </Typography>
            </Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ flexShrink: 0, fontWeight: 600 }}
            >
              항상 적용
            </Typography>
          </Box>
        ))}

        <Box sx={rowSx}>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700, mb: 0.25 }}>
              신청 기한 충족
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {noticeEnabled
                ? `최소 ${minNoticeDays}일 이전에 신청`
                : "사전 신청 일수 제한을 적용합니다."}
            </Typography>
          </Box>
          <Stack
            direction="row"
            spacing={1.25}
            sx={{ alignItems: "center", flexShrink: 0 }}
          >
            <TextField
              type="number"
              size="small"
              value={noticeEnabled ? minNoticeDays : 1}
              disabled={!primaryRule || !noticeEnabled}
              onChange={(e) => {
                if (!primaryRule) return;
                const next = Math.max(1, Number(e.target.value) || 1);
                onApprovalRuleLimitsChange(primaryRule.id, {
                  min_notice_days: next,
                });
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
            <Switch
              checked={noticeEnabled}
              disabled={!primaryRule}
              onChange={(e) => {
                if (!primaryRule) return;
                onApprovalRuleLimitsChange(primaryRule.id, {
                  min_notice_days: e.target.checked ? Math.max(1, minNoticeDays || 1) : 0,
                });
              }}
              slotProps={{
                input: { "aria-label": "신청 기한 적용" },
              }}
            />
          </Stack>
        </Box>

        <Box sx={{ ...rowSx, borderBottom: 0 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700, mb: 0.25 }}>
              연속 사용 한도 이하
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {consecutiveEnabled
                ? `한도 ${maxConsecutiveDays}일을 넘으면 신청할 수 없습니다.`
                : "한 번에 신청할 수 있는 최대 연속 일수를 제한합니다."}
            </Typography>
          </Box>
          <Stack
            direction="row"
            spacing={1.25}
            sx={{ alignItems: "center", flexShrink: 0 }}
          >
            <TextField
              type="number"
              size="small"
              value={
                consecutiveEnabled
                  ? maxConsecutiveDays
                  : DEFAULT_MAX_CONSECUTIVE_DAYS
              }
              disabled={!primaryRule || !consecutiveEnabled}
              onChange={(e) => {
                if (!primaryRule) return;
                const next = Math.max(1, Number(e.target.value) || 1);
                onApprovalRuleLimitsChange(primaryRule.id, {
                  max_consecutive_days: next,
                });
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
            <Switch
              checked={consecutiveEnabled}
              disabled={!primaryRule}
              onChange={(e) => {
                if (!primaryRule) return;
                onApprovalRuleLimitsChange(primaryRule.id, {
                  max_consecutive_days: e.target.checked
                    ? maxConsecutiveDays ?? DEFAULT_MAX_CONSECUTIVE_DAYS
                    : null,
                });
              }}
              slotProps={{
                input: { "aria-label": "연속 사용 한도 적용" },
              }}
            />
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
};

export default ApprovalRulesList;
