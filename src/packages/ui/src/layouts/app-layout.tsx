import { Outlet } from 'react-router-dom'

import { AppRail } from '@/components/app-rail'
import { Toaster } from '@/components/ui/sonner'

export function AppLayout() {
  return (
    <>
      <main className="flex h-screen w-screen overflow-hidden pt-4">
        <AppRail />

        <section className="flex flex-1 overflow-hidden rounded-tl-md border-t-1 border-l-1">
          <Outlet />
        </section>
      </main>
      <Toaster />
    </>
  )
}
