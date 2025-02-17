import { createBrowserRouter } from 'react-router-dom'
import { Error } from '@/renderer/src/pages/error'
import { NotFound } from '@/renderer/src/pages/not-found'
import { AppLayout } from '@/renderer/src/pages/layouts/app-layout'
import { Dashboard } from '@/renderer/src/pages/dashboard'
import { Docs } from './pages/docs'

export const router = createBrowserRouter([
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
        path: '/docs',
        element: <Docs />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
])