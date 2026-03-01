import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from '@/components/ui/sidebar'

export function AppSidebar({ children }: { children: React.ReactNode }) {
  return (
    <Sidebar
      collapsible="none"
      className="z-40 flex h-screen w-[240px] flex-row"
    >
      <div className="flex flex-1 flex-col border-r">{children}</div>
    </Sidebar>
  )
}

export function AppSidebarHeader({ children }: { children?: React.ReactNode }) {
  return <SidebarHeader className="z-40 p-0">{children}</SidebarHeader>
}

export function AppSidebarContent({
  children,
}: {
  children?: React.ReactNode
}) {
  return (
    <SidebarContent className="z-40">
      <ScrollArea className="h-full">{children}</ScrollArea>
    </SidebarContent>
  )
}

export function AppSidebarFooter({ children }: { children?: React.ReactNode }) {
  return <SidebarFooter className="mb-12">{children}</SidebarFooter>
}
