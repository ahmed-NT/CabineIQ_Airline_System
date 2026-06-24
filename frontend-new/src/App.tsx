import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom';
import AppShell from '@/components/layout/AppShell';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import FlightsPage from '@/pages/FlightsPage';
import FlightDetail from '@/pages/FlightDetail';
import SeatMapPage from '@/pages/SeatMapPage';
import PassengersPage from '@/pages/PassengersPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import FeedbackPage from '@/pages/FeedbackPage';
import AircraftPage from '@/pages/AircraftPage';
import PassengerPortalPage from '@/pages/PassengerPortalPage';
import UsersPage from '@/pages/UsersPage';
import NotFound from '@/pages/NotFound';
import CrewGuard from '@/components/layout/CrewGuard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/passenger" element={<PassengerPortalPage />} />

          {/* Protected routes inside AppShell */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="flights" element={<FlightsPage />} />
            <Route path="flights/:id" element={<FlightDetail />} />
            <Route path="aircraft" element={<CrewGuard><AircraftPage /></CrewGuard>} />
            <Route path="seat-map" element={<CrewGuard><SeatMapPage /></CrewGuard>} />
            <Route path="passengers" element={<CrewGuard><PassengersPage /></CrewGuard>} />
            <Route path="analytics" element={<CrewGuard><AnalyticsPage /></CrewGuard>} />
            <Route path="users" element={<CrewGuard><UsersPage /></CrewGuard>} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

