import { Outlet } from 'react-router-dom'
import { Toaster } from 'sonner'

import { Footer } from '@/components/footer'
import { ScrollArea } from '@/components/ui/scroll-area'

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
