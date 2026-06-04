import { useQuery } from '@tanstack/react-query';
import { ownService } from '../services/own.service';

export function useProfile() {
  return useQuery({
    queryKey: ['own-profile'],
    queryFn: () => ownService.getProfile(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useHasRole(role: string): boolean | undefined {
  const { data, isLoading } = useProfile();
  if (isLoading || !data) return undefined;
  return data.roles?.some((r) => r.role === role) ?? false;
}
