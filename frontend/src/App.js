import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { CartProvider } from './context/CartContext';
import './i18n/i18n';
import './App.css';

// Component imports
import Home from './pages/Home';
import Auth from './pages/Auth';
import ProductList from './pages/ProductList';
import ProductDetails from './pages/ProductDetails';
import CowList from './pages/CowList';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Toast from './components/Toast';
import ScrollToTop from './components/ScrollToTop';

// Protected Route Component
const ProtectedRoute = ({ children, requireRole }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" />;
  }

  if (requireRole && user?.role !== requireRole) {
    return <Navigate to="/" />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/cows" element={<CowList />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute requireRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <AppRoutes />
          <Toast />
          <ScrollToTop />
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
