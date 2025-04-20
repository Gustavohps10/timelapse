import { createBrowserRouter } from 'react-router-dom'

import { Dashboard } from '@/ui/src/pages/dashboard'
import { Error } from '@/ui/src/pages/error'
import { AppLayout } from '@/ui/src/pages/layouts/app-layout'
import { NotFound } from '@/ui/src/pages/not-found'

import { ProtectedRoute } from '../utils/protected-route'
import { Docs } from './pages/docs'
import { AuthLayout } from './pages/layouts/auth-layout'
import { Login } from './pages/login'

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
