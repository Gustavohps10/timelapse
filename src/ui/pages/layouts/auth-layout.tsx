import { Outlet } from 'react-router-dom'
import { Toaster } from 'sonner'

import { Footer } from '@/ui/components/footer'
import { ScrollArea } from '@/ui/components/ui/scroll-area'

export function AuthLayout() {
  return (
    <>
      <main className="h-[100vh] flex-1 overflow-hidden">
        <ScrollArea className="h-[100vh]">
          <Outlet />
          <Footer />
        </ScrollArea>
        <Toaster />
      </main>
    </>
  )
}
