import { RouterProvider, createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import HomePage from './pages/HomePage';
import ClassSelectionPage from './pages/ClassSelectionPage';
import StudentListPage from './pages/StudentListPage';
import AttendancePage from './pages/AttendancePage';
import SummaryPage from './pages/SummaryPage';
import AppLayout from './components/AppLayout';
import { AttendanceSessionProvider } from './state/attendanceSession';

const rootRoute = createRootRoute({
  component: () => (
    <AttendanceSessionProvider>
      <AppLayout />
    </AttendanceSessionProvider>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const classSelectionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/class-selection',
  component: ClassSelectionPage,
});

const studentListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/student-list',
  component: StudentListPage,
});

const attendanceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/attendance',
  component: AttendancePage,
});

const summaryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/summary',
  component: SummaryPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  classSelectionRoute,
  studentListRoute,
  attendanceRoute,
  summaryRoute,
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
