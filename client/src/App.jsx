import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// Public & Customer Pages
import HomePage from './pages/HomePage';
import MoviesPage from './pages/MoviesPage';
import MovieDetailsPage from './pages/MovieDetailsPage';
import CinemasPage from './pages/CinemasPage';
import OffersPage from './pages/OffersPage';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import SeatSelectionPage from './pages/SeatSelectionPage';
import CheckoutPage from './pages/CheckoutPage';
import DigitalTicketPage from './pages/DigitalTicketPage';
import CustomerDashboardPage from './pages/CustomerDashboardPage';

// Admin Pages
import AdminOverviewPage from './pages/admin/AdminOverviewPage';
import AdminMoviesPage from './pages/admin/AdminMoviesPage';
import AdminCinemasPage from './pages/admin/AdminCinemasPage';
import AdminShowtimesPage from './pages/admin/AdminShowtimesPage';
import { AdminBookingsPage, AdminCustomersPage } from './pages/admin/AdminManagementPages';

// Protected Route wrappers
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user || user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#18181F',
            color: '#F6F2ED',
            border: '1px solid #282834',
            borderRadius: '12px',
            fontSize: '13px',
          },
          success: {
            iconTheme: {
              primary: '#2EAD75',
              secondary: '#18181F',
            },
          },
          error: {
            iconTheme: {
              primary: '#D94A55',
              secondary: '#18181F',
            },
          },
        }}
      />

      <Routes>
        {/* Customer Storefront Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="movies" element={<MoviesPage />} />
          <Route path="movies/:id" element={<MovieDetailsPage />} />
          <Route path="cinemas" element={<CinemasPage />} />
          <Route path="offers" element={<OffersPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />

          {/* Booking Flow */}
          <Route path="booking/seats/:showtimeId" element={<SeatSelectionPage />} />
          <Route
            path="booking/checkout/:bookingId"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="booking/ticket/:id"
            element={
              <ProtectedRoute>
                <DigitalTicketPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="my-bookings"
            element={
              <ProtectedRoute>
                <CustomerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <CustomerDashboardPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Admin Back-Office Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminOverviewPage />} />
          <Route path="movies" element={<AdminMoviesPage />} />
          <Route path="cinemas" element={<AdminCinemasPage />} />
          <Route path="showtimes" element={<AdminShowtimesPage />} />
          <Route path="bookings" element={<AdminBookingsPage />} />
          <Route path="customers" element={<AdminCustomersPage />} />
        </Route>

        {/* Catch-all redirect to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;

