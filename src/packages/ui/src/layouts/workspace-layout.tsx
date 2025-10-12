import { Outlet, useParams } from 'react-router'
import { Toaster } from 'sonner'

import {
  AppSidebarWorkspacesContent,
  AppSidebarWorkspacesFooter,
} from '@/components'
import { AppSidebar } from '@/components/app-sidebar'
import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AuthProvider, SyncProvider } from '@/providers'

export function WorkspaceLayout() {
  const { workspaceId } = useParams<{ workspaceId: string }>()
  if (!workspaceId) throw new Error('WorkspaceId not found')

  return (
    <SyncProvider workspaceId={workspaceId}>
      <AuthProvider workspaceId={workspaceId}>
        <AppSidebar
          content={<AppSidebarWorkspacesContent />}
          footer={<AppSidebarWorkspacesFooter />}
        />
        <main className="h-[100vh] flex-1 overflow-hidden">
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
  )
}
