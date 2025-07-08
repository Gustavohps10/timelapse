import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'

import { IClient } from '@/client'
import { ThemeProvider } from '@/components/theme-provider'
import { SidebarProvider } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/contexts/auth'
import { ClientContext } from '@/contexts/ClientContext'
import { TimeEntriesContextProvider } from '@/contexts/TimeEntriesContext'
import { queryClient } from '@/lib/query-client'
import { router } from '@/routes'

interface AppProps {
  client: IClient
}

export function App({ client }: AppProps) {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <ClientContext.Provider value={client}>
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
      </ClientContext.Provider>
    </ThemeProvider>
  )
}
