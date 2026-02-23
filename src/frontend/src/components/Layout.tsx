import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { BookOpen, LogOut, LayoutDashboard, ListChecks, FolderOpen } from 'lucide-react';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useNavigate, useRouterState } from '@tanstack/react-router';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { clear, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: userProfile } = useGetCallerUserProfile();
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-background to-sage/5">
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-terracotta/20">
                  <BookOpen className="w-5 h-5 text-terracotta" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Tracky</h1>
                  {userProfile && <p className="text-xs text-muted-foreground">{userProfile.email}</p>}
                </div>
              </div>

              {identity && (
                <nav className="hidden md:flex items-center gap-2">
                  <Button
                    variant={currentPath === '/dashboard' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => navigate({ to: '/dashboard' })}
                    className="gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Button>
                  <Button
                    variant={currentPath === '/subjects' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => navigate({ to: '/subjects' })}
                    className="gap-2"
                  >
                    <FolderOpen className="w-4 h-4" />
                    Subjects
                  </Button>
                  <Button
                    variant={currentPath === '/syllabus' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => navigate({ to: '/syllabus' })}
                    className="gap-2"
                  >
                    <ListChecks className="w-4 h-4" />
                    Syllabus Tracker
                  </Button>
                </nav>
              )}
            </div>

            {identity && (
              <Button onClick={handleLogout} variant="outline" size="sm" className="gap-2">
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            )}
          </div>

          {identity && (
            <nav className="md:hidden flex items-center gap-2 mt-4">
              <Button
                variant={currentPath === '/dashboard' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => navigate({ to: '/dashboard' })}
                className="gap-2 flex-1"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Button>
              <Button
                variant={currentPath === '/subjects' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => navigate({ to: '/subjects' })}
                className="gap-2 flex-1"
              >
                <FolderOpen className="w-4 h-4" />
                Subjects
              </Button>
              <Button
                variant={currentPath === '/syllabus' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => navigate({ to: '/syllabus' })}
                className="gap-2 flex-1"
              >
                <ListChecks className="w-4 h-4" />
                Syllabus
              </Button>
            </nav>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">{children}</main>

      <footer className="border-t border-border/40 bg-background/50 mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              © {new Date().getFullYear()} Tracky. Built with ❤️ using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                  window.location.hostname
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-terracotta hover:underline"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
