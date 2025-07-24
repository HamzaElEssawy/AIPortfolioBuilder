import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

interface AdminStatus {
  isAdmin: boolean;
}

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const [, setLocation] = useLocation();
  
  const { data: adminStatus, isLoading } = useQuery<AdminStatus>({
    queryKey: ["/api/admin/status"],
    retry: false,
  });

  useEffect(() => {
    if (!isLoading && !adminStatus?.isAdmin) {
      setLocation("/admin/login");
    }
  }, [adminStatus?.isAdmin, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!adminStatus?.isAdmin) {
    return null;
  }

  return <>{children}</>;
}