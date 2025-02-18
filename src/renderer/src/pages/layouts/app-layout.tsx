import { AppSidebar } from '@/renderer/components/app-sidebar'
import { Header } from '@/renderer/components/header'
import { SidebarProvider } from '@/renderer/components/ui/sidebar'
import { Outlet } from 'react-router'

export function AppLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className='flex-1 p-4'>
      <Header/>
      <Outlet/>
      </main>
    </SidebarProvider>
  )
}