import { useQuery } from "@tanstack/react-query";

interface AdminStatus {
  isAdmin: boolean;
}

export function useAdmin() {
  const { data: adminStatus, isLoading } = useQuery<AdminStatus>({
    queryKey: ["/api/admin/status"],
    retry: false,
  });

  return {
    isAdmin: adminStatus?.isAdmin || false,
    isLoading,
  };
}