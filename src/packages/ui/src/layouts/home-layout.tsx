import { Outlet } from 'react-router'
import { Toaster } from 'sonner'

import { AppSidebarHomeContent, AppSidebarHomeFooter } from '@/components'
import { AppSidebar } from '@/components/app-sidebar'
import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { ScrollArea } from '@/components/ui/scroll-area'

export function HomeLayout() {
  return (
    <>
      <AppSidebar
        content={<AppSidebarHomeContent />}
        footer={<AppSidebarHomeFooter />}
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
    </>
  )
}
