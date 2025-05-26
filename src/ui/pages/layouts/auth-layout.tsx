import { Outlet } from 'react-router-dom'

import { AppSidebar } from '@/ui/components/app-sidebar'
import { ScrollArea } from '@/ui/components/ui/scroll-area'

export function AuthLayout() {
  return (
    <>
      <AppSidebar />
      <main className="h-[100vh] flex-1 overflow-hidden">
        <ScrollArea className="h-[100vh] p-4">
          <Outlet />
        </ScrollArea>
      </main>
    </>
  )
}
