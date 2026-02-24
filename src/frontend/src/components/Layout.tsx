import { useOTPAuth } from '../hooks/useOTPAuth';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { BookOpen, LogOut, LayoutDashboard, ListChecks, FolderOpen } from 'lucide-react';
import { useNavigate, useRouterState } from '@tanstack/react-router';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { clear, mobileNumber } = useOTPAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/login' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <header className="border-b border-blue-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <img 
                  src="/assets/generated/tracky-logo.dim_256x256.png" 
                  alt="Tracky Logo" 
                  className="w-10 h-10 rounded-lg"
                />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Tracky</h1>
                  {mobileNumber && <p className="text-xs text-gray-600">+91 {mobileNumber}</p>}
                </div>
              </div>

              {mobileNumber && (
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

            {mobileNumber && (
              <Button onClick={handleLogout} variant="outline" size="sm" className="gap-2">
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            )}
          </div>

          {mobileNumber && (
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

      <footer className="border-t border-blue-200 bg-white/50 mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>
              © {new Date().getFullYear()} Tracky. Built with ❤️ using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                  window.location.hostname
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
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
