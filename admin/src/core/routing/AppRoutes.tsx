import { lazy } from 'react';
import { Routes, Route } from 'react-router';
import { ProtectedRoute } from './ProtectedRoute';
import { Permission } from '../auth/types';

// Lazy load components for code splitting
const AppLayout = lazy(() => import('../../layout/AppLayout'));
const Home = lazy(() => import('../../pages/Dashboard/Home'));
const SignIn = lazy(() => import('../../pages/AuthPages/SignIn'));
const SignUp = lazy(() => import('../../pages/AuthPages/SignUp'));
const NotFound = lazy(() => import('../../pages/OtherPage/NotFound'));

// Profile and Calendar
const UserProfiles = lazy(() => import('../../pages/UserProfiles'));
const Calendar = lazy(() => import('../../pages/Calendar'));
const Blank = lazy(() => import('../../pages/Blank'));

// Forms
const FormElements = lazy(() => import('../../pages/Forms/FormElements'));

// Tables
const BasicTables = lazy(() => import('../../pages/Tables/BasicTables'));

// UI Elements
const Alerts = lazy(() => import('../../pages/UiElements/Alerts'));
const Avatars = lazy(() => import('../../pages/UiElements/Avatars'));
const Badges = lazy(() => import('../../pages/UiElements/Badges'));
const Buttons = lazy(() => import('../../pages/UiElements/Buttons'));
const Images = lazy(() => import('../../pages/UiElements/Images'));
const Videos = lazy(() => import('../../pages/UiElements/Videos'));

// Charts
const LineChart = lazy(() => import('../../pages/Charts/LineChart'));
const BarChart = lazy(() => import('../../pages/Charts/BarChart'));

/**
 * Application Routes Component
 * 
 * Implements Single Responsibility Principle by handling only routing logic.
 * Features:
 * - Lazy loading for performance optimization
 * - Protected routes with permission checking
 * - Clean route organization
 * - Code splitting at route level
 */
export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Protected Dashboard Layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard */}
        <Route index element={<Home />} />

        {/* Profile and Calendar - Basic user access */}
        <Route path="profile" element={<UserProfiles />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="blank" element={<Blank />} />

        {/* Forms - Basic user access */}
        <Route path="form-elements" element={<FormElements />} />

        {/* Tables - Requires read users permission */}
        <Route
          path="basic-tables"
          element={
            <ProtectedRoute requiredPermissions={[Permission.READ_USERS]}>
              <BasicTables />
            </ProtectedRoute>
          }
        />

        {/* UI Elements - Basic user access */}
        <Route path="alerts" element={<Alerts />} />
        <Route path="avatars" element={<Avatars />} />
        <Route path="badge" element={<Badges />} />
        <Route path="buttons" element={<Buttons />} />
        <Route path="images" element={<Images />} />
        <Route path="videos" element={<Videos />} />

        {/* Charts - Requires analytics permission */}
        <Route
          path="line-chart"
          element={
            <ProtectedRoute requiredPermissions={[Permission.READ_ANALYTICS]}>
              <LineChart />
            </ProtectedRoute>
          }
        />
        <Route
          path="bar-chart"
          element={
            <ProtectedRoute requiredPermissions={[Permission.READ_ANALYTICS]}>
              <BarChart />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Public Auth Routes */}
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />

      {/* Fallback Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
