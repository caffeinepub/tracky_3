import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet, Navigate } from '@tanstack/react-router';
import { useOTPAuth } from './hooks/useOTPAuth';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SyllabusTrackerPage from './pages/SyllabusTrackerPage';
import SubjectsPage from './pages/SubjectsPage';
import Layout from './components/Layout';
import { useGetCallerUserProfile } from './hooks/useQueries';

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitializing } = useOTPAuth();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  if (isInitializing || (isAuthenticated && profileLoading)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // If authenticated but no profile exists, create one automatically
  // The backend will handle profile creation during signup flow
  if (isFetched && userProfile === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up your profile...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Root layout component
function RootLayout() {
  const { isAuthenticated } = useOTPAuth();

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
  const { isAuthenticated, isInitializing } = useOTPAuth();

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
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
