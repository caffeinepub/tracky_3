import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet, Navigate } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProfileSetupPage from './pages/ProfileSetupPage';
import SyllabusTrackerPage from './pages/SyllabusTrackerPage';
import SubjectsPage from './pages/SubjectsPage';
import Layout from './components/Layout';
import { useGetCallerUserProfile } from './hooks/useQueries';

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  if (isInitializing || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!identity) {
    return <Navigate to="/login" />;
  }

  // Show profile setup if user is authenticated but has no profile
  if (isFetched && userProfile === null) {
    return <Navigate to="/setup-profile" />;
  }

  return <>{children}</>;
}

// Root layout component
function RootLayout() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  if (isAuthenticated) {
    return (
      <Layout>
        <Outlet />
      </Layout>
    );
  }

  return <Outlet />;
}

// Index redirect component
function IndexRedirect() {
  const { identity, isInitializing } = useInternetIdentity();

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (identity) {
    return <Navigate to="/dashboard" />;
  }

  return <Navigate to="/login" />;
}

// Protected dashboard component
function ProtectedDashboard() {
  return (
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  );
}

// Protected syllabus tracker component
function ProtectedSyllabusTracker() {
  return (
    <ProtectedRoute>
      <SyllabusTrackerPage />
    </ProtectedRoute>
  );
}

// Protected subjects component
function ProtectedSubjects() {
  return (
    <ProtectedRoute>
      <SubjectsPage />
    </ProtectedRoute>
  );
}

// Root route with layout
const rootRoute = createRootRoute({
  component: RootLayout,
});

// Define routes
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

const setupProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/setup-profile',
  component: ProfileSetupPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: ProtectedDashboard,
});

const syllabusRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/syllabus',
  component: ProtectedSyllabusTracker,
});

const subjectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/subjects',
  component: ProtectedSubjects,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: IndexRedirect,
});

// Create router
const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  setupProfileRoute,
  dashboardRoute,
  syllabusRoute,
  subjectsRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
