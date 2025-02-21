import './styles/global.css'
import { SidebarProvider } from "@/renderer/components/ui/sidebar";
import { ThemeProvider } from "@/renderer/components/theme-provider";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";

export function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <SidebarProvider>
        <RouterProvider router={router} />
      </SidebarProvider>
    </ThemeProvider>
  );
}
