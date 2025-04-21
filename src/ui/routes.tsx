import { createBrowserRouter } from 'react-router-dom'

import { Dashboard } from '@/ui/pages/dashboard'
import { Error } from '@/ui/pages/error'
import { AppLayout } from '@/ui/pages/layouts/app-layout'
import { NotFound } from '@/ui/pages/not-found'

import { Docs } from './pages/docs'
import { AuthLayout } from './pages/layouts/auth-layout'
import { Login } from './pages/login'
import { ProtectedRoute } from './utils/protected-route'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <Error />,
    children: [
      {
        path: '/',
        element: <ProtectedRoute element={<Dashboard />} />,
      },
      {
        path: '/docs',
        element: <ProtectedRoute element={<Docs />} />,
      },
    ],
  },
  {
    path: '/',
    element: <AuthLayout />,
    errorElement: <Error />,
    children: [
      {
        path: '/login',
        element: <Login />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
])
