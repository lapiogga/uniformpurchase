import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store';
import Login from './pages/Login';
import MainLayout from './layouts/MainLayout';
import AdminDashboard from './pages/admin/Dashboard';
import StoreDashboard from './pages/store/Dashboard';
import TailorDashboard from './pages/tailor/Dashboard';
import UserShop from './pages/user/Shop';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) {
  const user = useAuthStore((state) => state.user);
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }
  
  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route element={<MainLayout />}>
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/store/dashboard" element={
            <ProtectedRoute allowedRoles={['store']}>
              <StoreDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/tailor/dashboard" element={
            <ProtectedRoute allowedRoles={['tailor']}>
              <TailorDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/user/shop" element={
            <ProtectedRoute allowedRoles={['user']}>
              <UserShop />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </Router>
  );
}
