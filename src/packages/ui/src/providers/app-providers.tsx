import { QueryClientProvider } from '@tanstack/react-query'

import { IClient } from '@/client'
import { ThemeProvider } from '@/components/theme-provider'
import { SidebarProvider } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/contexts/auth'
import { ClientProvider } from '@/contexts/ClientContext'
import { TimeEntriesContextProvider } from '@/contexts/TimeEntriesContext'
import { queryClient } from '@/lib/query-client'

interface AppProvidersProps {
  client: IClient
  children: React.ReactNode
}

export function AppProviders({ client, children }: AppProvidersProps) {
  return (
    <ClientProvider client={client}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <TooltipProvider>
          <TimeEntriesContextProvider>
            <SidebarProvider>
              <AuthProvider>
                <QueryClientProvider client={queryClient}>
                  {children}
                </QueryClientProvider>
              </AuthProvider>
            </SidebarProvider>
          </TimeEntriesContextProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ClientProvider>
  )
}
