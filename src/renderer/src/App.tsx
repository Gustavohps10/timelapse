import './styles/global.css'
import { SidebarProvider } from "@/renderer/components/ui/sidebar";
import { ThemeProvider } from "@/renderer/components/theme-provider";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../contexts/auth';
import { queryClient } from '../lib/query-client';

export function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <SidebarProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </AuthProvider>
      </SidebarProvider>
    </ThemeProvider>
  );
}
