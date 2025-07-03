import { createBrowserRouter } from 'react-router-dom'

import { Dashboard } from '@/ui/pages/dashboard'
import { Error } from '@/ui/pages/error'
import { AppLayout } from '@/ui/pages/layouts/app-layout'
import { NotFound } from '@/ui/pages/not-found'
import { TimeEntries } from '@/ui/pages/time-entries'
import { TimerWidget } from '@/ui/pages/widgets/timer-widget'

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
        element: <Dashboard />,
        // element: <ProtectedRoute element={<Dashboard />} />,
      },
      {
        path: '/docs',
        element: <Docs />,
        // element: <ProtectedRoute element={<Docs />} />,
      },
      {
        path: '/time-entries',
        element: <TimeEntries />,
        // element: <ProtectedRoute element={<TimeEntries />} />,
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
    path: '/widgets',
    children: [
      {
        path: 'timer',
        element: <TimerWidget />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
])
