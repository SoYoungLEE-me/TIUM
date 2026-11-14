import { Alert, Box, Stack } from "@mui/material";
import AdminSectionHeader from "../../common/components/Admin/AdminSectionHeader";
import {
  ADMIN_SETTINGS_DESCRIPTION,
  ADMIN_SETTINGS_MAX_WIDTH,
  ADMIN_SETTINGS_TITLE,
} from "../../configs/admin/setting";
import { useAdminSettings } from "../../hooks/admin/useSetting";
import ApprovalRulesList from "./components/ApprovalRulesList";
import CompanySettingsForm from "./components/CompanySettingsForm";
import LeaveTypesList from "./components/LeaveTypesList";
import SettingsActionBar from "./components/SettingsActionBar";

const AdminSettingsPage = () => {
  const {
    settings,
    draft,
    dirty,
    error,
    updateDraft,
    resetDraft,
    saveCompanySettings,
    updateApprovalRuleLimitsForRule,
    toggleLeaveType,
  } = useAdminSettings();

  return (
    <Box
      sx={{
        maxWidth: ADMIN_SETTINGS_MAX_WIDTH,
        mx: "auto",
        py: 2,
        pb: { xs: 12, md: 2 },
        // 데스크톱에서 액션 바가 페이지 하단에 붙도록 최소 높이 확보
        minHeight: { md: "calc(100vh - 120px)" },
        display: "flex",
        flexDirection: "column",
      }}
    >
      <AdminSectionHeader
        title={ADMIN_SETTINGS_TITLE}
        description={ADMIN_SETTINGS_DESCRIPTION}
      />

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}

      <Stack spacing={2.5} sx={{ mb: { md: 3 } }}>
        <CompanySettingsForm draft={draft} onChange={updateDraft} />
        <ApprovalRulesList
          rules={settings.approval_rules}
          onApprovalRuleLimitsChange={updateApprovalRuleLimitsForRule}
        />
        <LeaveTypesList
          types={settings.leave_types}
          onToggle={toggleLeaveType}
        />
      </Stack>

      <SettingsActionBar
        dirty={dirty}
        onCancel={resetDraft}
        onSave={saveCompanySettings}
      />
    </Box>
  );
};

export default AdminSettingsPage;
