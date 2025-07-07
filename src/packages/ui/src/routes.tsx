import { createBrowserRouter, RouterProviderProps } from 'react-router-dom'

import { AppLayout, AuthLayout } from '@/layouts'
import {
  Dashboard,
  Docs,
  Error,
  Login,
  NotFound,
  TimeEntries,
  TimerWidget,
} from '@/pages'

type AppRouter = RouterProviderProps['router']

export const router: AppRouter = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <Error />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'docs',
        element: <Docs />,
      },
      {
        path: 'time-entries',
        element: <TimeEntries />,
      },
    ],
  },
  {
    path: '/login',
    element: <AuthLayout />,
    children: [
      {
        index: true,
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
