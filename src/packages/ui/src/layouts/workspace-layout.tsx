import { Outlet } from 'react-router'
import { Toaster } from 'sonner'

import {
  AppSidebarWorkspacesContent,
  AppSidebarWorkspacesFooter,
} from '@/components'
import { AppSidebar } from '@/components/app-sidebar'
import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { ScrollArea } from '@/components/ui/scroll-area'
import { WorkspaceProvider } from '@/contexts/WorkspaceContext'
import { AuthProvider } from '@/providers'
import { SyncProvider } from '@/stores/syncStore'

export function WorkspaceLayout() {
  return (
    <WorkspaceProvider>
      <SyncProvider>
        <AuthProvider>
          <AppSidebar
            content={<AppSidebarWorkspacesContent />}
            footer={<AppSidebarWorkspacesFooter />}
          />
          <main className="relative h-[100vh] flex-1 overflow-hidden">
            <Header />
            <ScrollArea className="h-full">
              <section className="p-4">
                <Outlet />
              </section>
              <Footer />
            </ScrollArea>
            <Toaster />
          </main>
        </AuthProvider>
      </SyncProvider>
    </WorkspaceProvider>
  )
}
