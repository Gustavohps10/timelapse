import { ChartLine, FileText, Search, Settings, Timer, ChevronRight } from "lucide-react";
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
import { NavLink } from "react-router-dom";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import logoAtak from '../src/assets/images/icon-atak.png'
import { ModeToggle } from "./mode-toggle";

const mainItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: ChartLine,
  },
  {
    title: "Temporizador",
    url: "/timer",
    icon: Timer,
  },
  {
    title: "Documentação",
    url: "/docs",
    icon: FileText,
  },
];

const subItems = [
  {
    title: "Buscar",
    url: "/search",
    icon: Search,
  },
  {
    title: "Configurações",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
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
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
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
        Rodapé
      </SidebarFooter>
    </Sidebar>
  );
}
