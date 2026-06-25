import { useQuery } from '@tanstack/react-query';
import { ownService } from '../services/own.service';
import { hasAuthToken } from '../../../utils/auth';

export function useProfile() {
  return useQuery({
    queryKey: ['own-profile'],
    queryFn: () => ownService.getProfile(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: hasAuthToken(),
    retry: false,
  });
}

export function useHasRole(role: string): boolean | undefined {
  const { data, isLoading } = useProfile();
  if (isLoading || !data) return undefined;
  return data.roles?.some((r) => r.role === role) ?? false;
}
