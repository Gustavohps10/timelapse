import {
  Activities,
  Backlog,
  // Backlog,
  Docs,
  Error,
  Metrics,
  NotFound,
  TimeEntries,
  TimerWidget,
  WorkspaceSettings,
} from '@timelapse/ui'
import { ActivitiesLayout, HomeLayout, WorkspaceLayout } from '@timelapse/ui'
import { createHashRouter } from 'react-router-dom'

export const router = createHashRouter([
  {
    path: '/',
    element: <HomeLayout />,
    errorElement: <Error />,
    children: [
      { index: true, element: <div>Home</div> },
      { path: 'about', element: <div>About</div> },
      { path: 'contact', element: <div>Contact</div> },
    ],
  },
  {
    path: '/workspaces/:workspaceId',
    element: <WorkspaceLayout />,
    errorElement: <Error />,
    children: [
      { index: true, element: <Metrics /> },
      { path: 'docs', element: <Docs /> },
      { path: 'time-entries', element: <TimeEntries /> },
      {
        path: 'activities',
        element: <ActivitiesLayout />,
        children: [
          { index: true, element: <Activities /> }, // Área de Trabalho
          { path: 'backlog', element: <Backlog /> },
        ],
      },
      { path: 'settings', element: <WorkspaceSettings /> },
      {
        path: 'widgets',
        children: [{ path: 'timer', element: <TimerWidget /> }],
      },
    ],
  },
  { path: '*', element: <NotFound /> },
])
