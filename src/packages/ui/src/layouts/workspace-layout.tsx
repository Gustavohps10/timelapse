import { Outlet } from 'react-router'

import {
  AppSidebar,
  AppSidebarContent,
  AppSidebarFooter,
  AppSidebarHeader,
  AppSidebarWorkspacesContent,
  AppSidebarWorkspacesFooter,
  Header,
} from '@/components'
import { AppSidebarDefaultHeader } from '@/components/app-sidebar/app-sidebar-default-header'
import { Footer } from '@/components/footer'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AuthProvider } from '@/contexts/AuthContext'
import { WorkspaceProvider } from '@/contexts/WorkspaceContext'
import { TimeEntriesContextProvider } from '@/providers'
import { SyncProvider } from '@/stores/syncStore'

export function WorkspaceLayout() {
  return (
    <WorkspaceProvider>
      <SyncProvider>
        <TimeEntriesContextProvider>
          <AuthProvider>
            <>
              <AppSidebar>
                <AppSidebarHeader>
                  <AppSidebarDefaultHeader />
                </AppSidebarHeader>

                <AppSidebarContent>
                  <AppSidebarWorkspacesContent />
                </AppSidebarContent>

                <AppSidebarFooter>
                  <AppSidebarWorkspacesFooter />
                </AppSidebarFooter>
              </AppSidebar>

              <main className="relative h-full flex-1 overflow-hidden">
                <Header />
                <ScrollArea className="h-full">
                  <section className="px-4 pt-12">
                    <Outlet />
                  </section>
                  <Footer />
                </ScrollArea>
              </main>
            </>
          </AuthProvider>
        </TimeEntriesContextProvider>
      </SyncProvider>
    </WorkspaceProvider>
  )
}
