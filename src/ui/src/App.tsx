import './styles/global.css'

import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'

import { ThemeProvider } from '@/ui/components/theme-provider'
import { SidebarProvider } from '@/ui/components/ui/sidebar'

import { AuthProvider } from '../contexts/auth'
import { queryClient } from '../lib/query-client'
import { router } from './routes'
export function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <SidebarProvider>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
          </QueryClientProvider>
        </AuthProvider>
      </SidebarProvider>
    </ThemeProvider>
  )
}
