import { Outlet } from 'react-router'

import { AppSidebar } from '@/ui/components/app-sidebar'
import { Footer } from '@/ui/components/footer'
import { Header } from '@/ui/components/header'
import { ScrollArea } from '@/ui/components/ui/scroll-area'

export function AppLayout() {
  return (
    <>
      <AppSidebar />
      <main className="h-[100vh] flex-1 overflow-hidden">
        <Header />
        <ScrollArea className="h-full">
          <section className="p-4">
            <Outlet />
          </section>
          <Footer />
        </ScrollArea>
      </main>
    </>
  )
}
