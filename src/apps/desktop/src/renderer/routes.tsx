// import { AppLayout, AuthLayout } from '@trackpoint/ui/layouts'
// import {
//   Dashboard,
//   Docs,
//   Error,
//   Login,
//   NotFound,
//   TimeEntries,
//   TimerWidget,
// } from '@trackpoint/ui/pages'
// import { createBrowserRouter } from 'react-router-dom'

// export const router = createBrowserRouter([
//   {
//     path: '/',
//     element: <AppLayout />,
//     errorElement: <Error />,
//     children: [
//       {
//         index: true,
//         path: '/dashboard',
//         element: <Dashboard />,
//       },
//       {
//         path: 'docs',
//         element: <Docs />,
//       },
//       {
//         path: 'time-entries',
//         element: <TimeEntries />,
//       },
//     ],
//   },
//   {
//     path: '/login',
//     element: <AuthLayout />,
//     children: [
//       {
//         index: true,
//         element: <Login />,
//       },
//     ],
//   },
//   {
//     path: '/widgets',
//     children: [
//       {
//         path: 'timer',
//         element: <TimerWidget />,
//       },
//     ],
//   },
//   {
//     path: '*',
//     element: <NotFound />,
//   },
// ])
