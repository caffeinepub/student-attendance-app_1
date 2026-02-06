import { Outlet } from '@tanstack/react-router';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Outlet />
      </div>
      <footer className="fixed bottom-0 left-0 right-0 py-4 text-center text-sm text-muted-foreground bg-background/80 backdrop-blur-sm border-t">
        © 2026. Built with love using{' '}
        <a href="https://caffeine.ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
