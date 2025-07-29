import {
  Dashboard,
  Docs,
  Error,
  Login,
  NotFound,
  TimeEntries,
  TimerWidget,
  WorkspaceSettings,
} from '@trackalize/ui'
import { AppLayout, AuthLayout } from '@trackalize/ui'
import { createHashRouter } from 'react-router-dom'

export const router = createHashRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <Error />,
    children: [
      {
        path: '/',
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
      {
        path: 'workspace-settings/:workspaceId',
        element: <WorkspaceSettings />,
      },
      {
        path: 'widgets',
        children: [
          {
            path: 'timer',
            element: <TimerWidget />,
          },
        ],
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
    path: '*',
    element: <NotFound />,
  },
])
