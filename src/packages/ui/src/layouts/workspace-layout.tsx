import { Outlet } from 'react-router'
import { Toaster } from 'sonner'

import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AuthProvider } from '@/contexts/AuthContext'
import { WorkspaceProvider } from '@/contexts/WorkspaceContext'
import { SyncProvider } from '@/stores/syncStore'

export function WorkspaceLayout() {
  return (
    <WorkspaceProvider>
      <SyncProvider>
        <AuthProvider>
          <main className="flex h-full flex-col">
            <Header />

            <ScrollArea className="flex-1">
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
