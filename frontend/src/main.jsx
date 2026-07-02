import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css'
import Register from './pages/Register.jsx';
import Login from './pages/login.jsx';
import Dashboard from './pages/dashboard.jsx';
import { AuthProvider, useAuth } from './context/AuthContext';
import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import ProtectedRoute from './components/ProtectedRoute';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';

const queryClient = new QueryClient()

function RootRedirect() {
  const { token } = useAuth();
  return token ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootRedirect />
  },
  {
    path: "/register",
    element: <Register />
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/dashboard",
        element: <Dashboard />
      }
    ]
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </AuthProvider>
  </StrictMode>
)