// src/renderer/main.tsx (ou onde você monta o App)
import '@/renderer/index.css'

import { QueryClientProvider } from '@tanstack/react-query'
import {
  ClientProvider,
  queryClient,
  SidebarProvider,
  ThemeProvider,
  TooltipProvider,
} from '@timelapse/ui'
import { NuqsAdapter } from 'nuqs/adapters/react-router/v6'
import { RouterProvider } from 'react-router-dom'

import { ipcClient } from '@/renderer/client'
import { router } from '@/renderer/routes'

export function AppDesktop() {
  return (
    <ClientProvider client={ipcClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <TooltipProvider>
          <SidebarProvider>
            <QueryClientProvider client={queryClient}>
              <NuqsAdapter>
                <RouterProvider router={router} />
              </NuqsAdapter>
            </QueryClientProvider>
          </SidebarProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ClientProvider>
  )
}
