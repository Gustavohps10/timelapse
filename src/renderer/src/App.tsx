import { useEffect, useState } from "react";
import './styles/global.css'
import { AppSidebar } from "@/renderer/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/renderer/components/ui/sidebar";
import { ThemeProvider } from "@/renderer/components/theme-provider";
import { ModeToggle } from "@/renderer/components/mode-toggle";

export function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function getMainData() {
      try {
        // Acesse a função fetchRedmine da API exposta
        const jsonData = await window.api.fetchRedmine();  // Corrigido aqui
        setData(jsonData);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    }

    getMainData();
  }, []);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <SidebarProvider>
        <main>
          <AppSidebar/>
          <SidebarTrigger />
          <h1>ATASK</h1>
          <ModeToggle/>
          {data ? <pre>{JSON.stringify(data, null, 2)}</pre> : <p>Carregando...</p>}
        </main>
        </SidebarProvider>
    </ThemeProvider>
  );
}
