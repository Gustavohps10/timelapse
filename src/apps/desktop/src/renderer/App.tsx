import '@/renderer/index.css'

import { QueryClientProvider } from '@tanstack/react-query'
import {
  AuthProvider,
  ClientProvider,
  queryClient,
  SidebarProvider,
  ThemeProvider,
  TimeEntriesContextProvider,
  TooltipProvider,
} from '@trackalize/ui'
import { RouterProvider } from 'react-router-dom'

import { desktopClient } from '@/renderer/client'
import { router } from '@/renderer/routes'

export function AppDesktop() {
  return (
    <ClientProvider client={desktopClient}>
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
    </ClientProvider>
  )
}
