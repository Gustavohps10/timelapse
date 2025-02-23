import { createBrowserRouter } from 'react-router-dom'
import { Error } from '@/renderer/src/pages/error'
import { NotFound } from '@/renderer/src/pages/not-found'
import { AppLayout } from '@/renderer/src/pages/layouts/app-layout'
import { Dashboard } from '@/renderer/src/pages/dashboard'
import { Docs } from './pages/docs'
import { Login } from './pages/login'
import { AuthLayout } from './pages/layouts/auth-layout'
import { ProtectedRoute } from '../utils/protected-route'


export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <Error />,
    children: [
      {
        path: '/',
        element: <ProtectedRoute element={<Dashboard/>} />,
      },
      {
        path: '/docs',
        element: <ProtectedRoute element={<Docs/>} />,
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