
import { useCallback, useEffect, useState } from "react";
import { getEmployeeProfile } from "../../apis/employee/profile";
import type { EmployeeProfile } from "../../models/employee/profile";

export const useEmployeeProfile = () => {
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getEmployeeProfile();
      setProfile(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load employee profile."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
  };
};
