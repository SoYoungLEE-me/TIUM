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
import SettingSkeleton from "./components/SettingSkeleton";

const AdminSettingsPage = () => {
  const {
    settings,
    error,
    isLoading,
    saveCompanySettings,
    updateApprovalRuleLimitsForRule,
    toggleLeaveType,
  } = useAdminSettings();

  if (isLoading) {
    return <SettingSkeleton />;
  }

  return (
    <Box
      sx={{
        maxWidth: ADMIN_SETTINGS_MAX_WIDTH,
        mx: "auto",
        py: 2,
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

      <Stack spacing={2.5}>
        <CompanySettingsForm
          settings={settings.company_settings}
          onChange={saveCompanySettings}
        />
        <ApprovalRulesList
          rules={settings.approval_rules}
          onApprovalRuleLimitsChange={updateApprovalRuleLimitsForRule}
        />
        <LeaveTypesList
          types={settings.leave_types}
          onToggle={toggleLeaveType}
        />
      </Stack>
    </Box>
  );
};

export default AdminSettingsPage;
