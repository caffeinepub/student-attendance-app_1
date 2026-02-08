import { useInternetIdentity } from './useInternetIdentity';
import { useActor } from './useActor';
import { useQuery } from '@tanstack/react-query';
import { UserRole } from '../backend';

export function useAuth() {
  const { identity, loginStatus } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();

  const isAuthenticated = !!identity;

  const { data: userRole, isLoading: roleLoading } = useQuery<UserRole>({
    queryKey: ['userRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !actorFetching && isAuthenticated,
    retry: false,
  });

  const { data: isAdmin, isLoading: adminLoading } = useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching && isAuthenticated,
    retry: false,
  });

  const isAuthorized = isAuthenticated && (userRole === UserRole.user || userRole === UserRole.admin);

  return {
    isAuthenticated,
    isAuthorized,
    isAdmin: isAdmin ?? false,
    userRole,
    isLoading: actorFetching || roleLoading || adminLoading,
    loginStatus,
  };
}

export function getAuthErrorMessage(error: unknown): string {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  if (errorMessage.includes('Unauthorized')) {
    if (errorMessage.includes('Only teachers and the owner')) {
      return 'You need to be logged in as a teacher or owner to perform this action.';
    }
    if (errorMessage.includes('Only the owner')) {
      return 'Only the owner can perform this action.';
    }
    return 'You are not authorized to perform this action.';
  }
  
  return 'An error occurred. Please try again.';
}
