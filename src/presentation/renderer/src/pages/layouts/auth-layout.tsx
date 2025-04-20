import { Outlet } from 'react-router-dom'

import { AppSidebar } from '@/presentation/renderer/components/app-sidebar'
import { Header } from '@/presentation/renderer/components/header'
import { SidebarProvider } from '@/presentation/renderer/components/ui/sidebar'

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
