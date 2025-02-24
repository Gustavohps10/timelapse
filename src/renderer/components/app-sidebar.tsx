import { ChartLine, FileText, Search, Settings, Timer, ChevronRight, User, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/renderer/components/ui/sidebar";
import { NavLink, useNavigate } from "react-router-dom";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import logoAtak from '../src/assets/images/icon-atak.png'
import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";
import { useAuth } from "../hooks/use-auth";

const mainItems = [
  { title: "Dashboard", url: "/", icon: ChartLine },
  { title: "Temporizador", url: "/timer", icon: Timer },
  { title: "Documentação", url: "/docs", icon: FileText },
];

const subItems = [
  { title: "Buscar", url: "/search", icon: Search },
  { title: "Configurações", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { logout, user } = useAuth()

  const handleLogout = () => {
    logout(); 
  };

  return (
    <Sidebar collapsible="none">
      <SidebarHeader>
        <div className="hover:bg-zinc-100 dark:hover:bg-zinc-800 p-2 rounded-md flex gap-2 items-center">
          <img src={logoAtak} className="w-8 h-8 bg-zinc-200 rounded-lg p-2" alt="Logo" />
          <div className="flex flex-col">
            <h1 className="scroll-m-20 text-sm font-bold tracking-tighter">Atask</h1>
            <h2 className="text-muted-foreground scroll-m-20 text-sm font tracking-tight leading-none">Manager</h2>
          </div>
          <ModeToggle className="ml-auto cursor-pointer hover:bg-[#e7e7e9] dark:hover:bg-[#2e2e31] p-1 size-8 rounded-lg text-foreground"/>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegar</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
                      className="[&.active]:bg-zinc-100 dark:[&.active]:bg-zinc-800 flex items-center h-9! rounded-md transition-colors"
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon className={isActive ? "text-primary" : "text-foreground"} />
                          <span>{item.title}</span>
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Mais Opções</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible defaultOpen className="group">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <span>Opções Avançadas</span>
                      <ChevronRight className="ml-auto transition-transform rotate-0 group-data-[state=open]:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {subItems.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuButton asChild>
                            <NavLink to={subItem.url}>
                              <subItem.icon />
                              <span>{subItem.title}</span>
                            </NavLink>
                          </SidebarMenuButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="hover:bg-zinc-100 dark:hover:bg-zinc-800 p-2 rounded-md flex gap-2 items-center">
          <User className="text-zinc-900 bg-zinc-200 rounded-lg h-8 w-8 p-2"/>
          <div className="flex flex-col">
            <h1 className="scroll-m-20 text-sm font-bold tracking-tighter">
              {user?.firstname && user?.lastname ? `${user?.firstname} ${user?.lastname}` : ''}
            </h1>
            <h2 className="text-muted-foreground scroll-m-20 text-sm font tracking-tight leading-none">
              {user?.login || ''}
            </h2>
          </div>
          <Button size="icon" variant="outline" className="ml-auto h-8 w-8" onClick={handleLogout}>
            <LogOut />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
