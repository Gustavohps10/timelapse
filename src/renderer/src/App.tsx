import { useEffect, useState } from "react";
import './styles/global.css'
import { SidebarProvider } from "@/renderer/components/ui/sidebar";
import { ThemeProvider } from "@/renderer/components/theme-provider";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";

export function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function getMainData() {
      try {
        // Acesse a função fetchRedmine da API exposta
        const jsonData = await window.api.fetchRedmine(); 
        setData(jsonData);
        console.log(data)
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    }

    getMainData();
  }, []);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <SidebarProvider>
        <RouterProvider router={router} />
      </SidebarProvider>
    </ThemeProvider>
  );
}
