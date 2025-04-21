import { Outlet } from 'react-router-dom'

import { AppSidebar } from '@/ui/components/app-sidebar'
import { Header } from '@/ui/components/header'
import { SidebarProvider } from '@/ui/components/ui/sidebar'

export function AuthLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 p-4">
        <Header />
        <Outlet />
      </main>
    </SidebarProvider>
  )
}
