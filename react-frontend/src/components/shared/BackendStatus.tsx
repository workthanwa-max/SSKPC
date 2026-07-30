import { useQuery } from '@tanstack/react-query';
import { Activity, AlertTriangle } from 'lucide-react';
import { apiClient } from '../../services/api/apiClient';

interface HealthResponse {
  status: string;
  database: string;
}

export function BackendStatus() {
  const { data, isLoading, isError } = useQuery<HealthResponse>({
    queryKey: ['backend-health'],
    queryFn: async () => {
      const response = await apiClient.get('/health');
      return response.data;
    },
    refetchInterval: 10000, // Poll every 10 seconds
    retry: 2,
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground shadow-sm">
        <div className="size-2 animate-pulse rounded-full bg-muted-foreground" />
        Checking connection...
      </div>
    );
  }

  if (isError || data?.status !== 'OK') {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-1.5 text-sm font-medium text-destructive shadow-sm">
        <AlertTriangle className="size-4" strokeWidth={2} />
        Connection Lost
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary shadow-sm">
      <Activity className="size-4" strokeWidth={2} />
      System Online
    </div>
  );
}
