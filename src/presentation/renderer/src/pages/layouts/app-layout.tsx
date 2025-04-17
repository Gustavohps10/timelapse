import { AppSidebar } from '@/presentation/renderer/components/app-sidebar'
import { Header } from '@/presentation/renderer/components/header'
import { SidebarProvider } from '@/presentation/renderer/components/ui/sidebar'
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