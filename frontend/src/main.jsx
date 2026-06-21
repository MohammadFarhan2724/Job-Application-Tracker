import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from '@tanstack/react-query';
import './index.css'
import App from './App.jsx'
import Register from './pages/Register.jsx';

const queryClient = new QueryClient()

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />
  },
  { path: "/register", 
    element: <Register /> 
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
  <QueryClientProvider client={queryClient}>
  <RouterProvider router={router} />
  </QueryClientProvider>
  </StrictMode>
)
