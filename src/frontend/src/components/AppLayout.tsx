import { Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useUserProfile';
import LoginButton from './LoginButton';
import ProfileSetupDialog from './ProfileSetupDialog';

export default function AppLayout() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-muted-foreground">
            {isAuthenticated && userProfile ? (
              <span>Logged in as <strong>{userProfile.name}</strong></span>
            ) : isAuthenticated ? (
              <span>Setting up profile...</span>
            ) : (
              <span>Not logged in</span>
            )}
          </div>
          <LoginButton />
        </div>
        <Outlet />
      </div>
      <footer className="fixed bottom-0 left-0 right-0 py-4 text-center text-sm text-muted-foreground bg-background/80 backdrop-blur-sm border-t">
        © 2026. Built with love using{' '}
        <a href="https://caffeine.ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          caffeine.ai
        </a>
      </footer>
      <ProfileSetupDialog open={showProfileSetup} />
    </div>
  );
}
