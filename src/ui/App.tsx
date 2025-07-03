import './styles/global.css'

import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'

import { ThemeProvider } from '@/ui/components/theme-provider'
import { SidebarProvider } from '@/ui/components/ui/sidebar'
import { TooltipProvider } from '@/ui/components/ui/tooltip'
import { AuthProvider } from '@/ui/contexts/auth'
import { TimeEntriesContextProvider } from '@/ui/contexts/TimeEntriesContext'
import { queryClient } from '@/ui/lib/query-client'
import { router } from '@/ui/routes'

export function App() {
  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <TooltipProvider>
          <TimeEntriesContextProvider>
            <SidebarProvider>
              <AuthProvider>
                <QueryClientProvider client={queryClient}>
                  <RouterProvider router={router} />
                </QueryClientProvider>
              </AuthProvider>
            </SidebarProvider>
          </TimeEntriesContextProvider>
        </TooltipProvider>
      </ThemeProvider>
    </>
  )
}
