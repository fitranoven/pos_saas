import { useQuery } from '@tanstack/react-query';
import { fetchDashboard } from '../lib/api';

/** React Query data layer for the dashboard report. */
export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => (await fetchDashboard()).data,
  });
}
