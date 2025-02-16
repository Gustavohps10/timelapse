import { useEffect, useState } from "react";
import './styles/global.css'
import { AppSidebar } from "@/renderer/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/renderer/components/ui/sidebar";

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
    <div>
      
      <SidebarProvider>
      <main>
        <AppSidebar/>
        <SidebarTrigger />
        <h1>ATASK</h1>
      </main>
      </SidebarProvider>


      
      
      {data ? <pre>{JSON.stringify(data, null, 2)}</pre> : <p>Carregando...</p>}
    </div>
  );
}
