import '@/renderer/index.css'

import { QueryClientProvider } from '@tanstack/react-query'
import {
  ClientProvider,
  queryClient,
  SidebarProvider,
  SyncProvider,
  ThemeProvider,
  TimeEntriesContextProvider,
  TooltipProvider,
} from '@timelapse/ui'
import { RouterProvider } from 'react-router-dom'

import { ipcClient } from '@/renderer/client'
import { router } from '@/renderer/routes'

export function AppDesktop() {
  return (
    <ClientProvider client={ipcClient}>
      <SyncProvider>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <TooltipProvider>
            <TimeEntriesContextProvider>
              <SidebarProvider>
                <QueryClientProvider client={queryClient}>
                  <RouterProvider router={router} />
                </QueryClientProvider>
              </SidebarProvider>
            </TimeEntriesContextProvider>
          </TooltipProvider>
        </ThemeProvider>
      </SyncProvider>
    </ClientProvider>
  )
}
