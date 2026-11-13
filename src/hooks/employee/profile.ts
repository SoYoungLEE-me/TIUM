
import { useCallback, useEffect, useState } from "react";
import { getEmployeeProfile } from "../../apis/employee/profile";
import type { EmployeeProfile } from "../../models/employee/profile";

// 현재 로그인한 직원의 프로필과 로딩 및 오류 상태를 관리하는 Hook
export const useEmployeeProfile = () => {
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 로그인한 직원의 프로필 정보를 다시 조회하는 함수
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getEmployeeProfile();
      setProfile(data);
    } catch (err) {

      // 프로필 조회 실패 시 오류 메시지 저장
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load employee profile."
      );
    } finally {
      // 조회 성공 여부와 관계없이 로딩 상태 종료
      setLoading(false);
    }
  }, []);

  // 컴포넌트가 처음 렌더링될 때 직원 프로필 조회
  useEffect(() => {
    let isActive = true;

    // API 응답을 비동기적으로 처리하여 상태 업데이트
    getEmployeeProfile()
      .then((data) => {
        if (isActive) {
          setProfile(data);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (isActive) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load employee profile."
          );
        }
      })
      .finally(() => {
        if (isActive) {
          setLoading(false);
        }
      });

    // 컴포넌트가 사라지면 이후 상태 업데이트 방지
    return () => {
      isActive = false;
    };
  }, []);

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
  };
};
