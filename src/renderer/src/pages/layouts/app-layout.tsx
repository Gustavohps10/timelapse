import { AppSidebar } from '@/renderer/components/app-sidebar'
import { Header } from '@/renderer/components/header'
import { SidebarProvider, SidebarTrigger } from '@/renderer/components/ui/sidebar'
import { Outlet } from 'react-router'

export function AppLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main>
        <SidebarTrigger />
        <Header/>
        <Outlet />
      </main>
    </SidebarProvider>
  )
}