import '@trackpoint/ui/globals.css'

import { QueryClientProvider } from '@tanstack/react-query'
import {
  AuthProvider,
  ClientProvider,
  Dashboard,
  queryClient,
  SidebarProvider,
  ThemeProvider,
  TimeEntriesContextProvider,
  TooltipProvider,
} from '@trackpoint/ui'

import { desktopClient } from '@/renderer/client'

export function AppDesktop() {
  return (
    <ClientProvider client={desktopClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <TooltipProvider>
          <TimeEntriesContextProvider>
            <SidebarProvider>
              <AuthProvider>
                <QueryClientProvider client={queryClient}>
                  {/* <RouterProvider router={router} /> */}
                  <Dashboard />
                </QueryClientProvider>
              </AuthProvider>
            </SidebarProvider>
          </TimeEntriesContextProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ClientProvider>
  )
}
