import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from '../components/ProtectedRoute';

// Pages
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import PropertyDetail from '../pages/PropertyDetail';
import UserDashboard from '../pages/UserDashboard';
import OwnerDashboard from '../pages/OwnerDashboard';
import AdminDashboard from '../pages/AdminDashboard';
import NotFound from '../pages/NotFound';

const AppRoutes = () => {
  return (
    <MainLayout>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/properties/:id" element={<PropertyDetail />} />

        {/* Protected User Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['USER']}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Owner Dashboard */}
        <Route
          path="/owner"
          element={
            <ProtectedRoute allowedRoles={['OWNER']}>
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Admin Dashboard */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Wildcard 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </MainLayout>
  );
};

export default AppRoutes;
