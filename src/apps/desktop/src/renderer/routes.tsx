import {
  Dashboard,
  Docs,
  Error,
  Login,
  NotFound,
  TimeEntries,
  TimerWidget,
} from '@trackpoint/ui'
import { AppLayout, AuthLayout } from '@trackpoint/ui'
import { createHashRouter } from 'react-router-dom'

export const router = createHashRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <Error />,
    children: [
      {
        path: 'dashboard',
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
