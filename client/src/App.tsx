import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { WalletProvider } from "@/contexts/WalletContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { WalletConnect } from "@/components/WalletConnect";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NetworkConfig } from "@/components/NetworkConfig";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Upload from "@/pages/Upload";
import DocumentDetail from "@/pages/DocumentDetail";
import NotFound from "@/pages/not-found";

function AppContent() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route>
        <div className="flex h-screen w-full">
          <AppSidebar />
          <div className="flex flex-col flex-1">
            <header className="flex items-center justify-between gap-4 p-4 border-b">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <div className="flex items-center gap-2">
                <NetworkConfig />
                <ThemeToggle />
                <WalletConnect />
              </div>
            </header>
            <main className="flex-1 overflow-auto p-6">
              <Switch>
                <Route path="/dashboard" component={Dashboard} />
                <Route path="/upload" component={Upload} />
                <Route path="/document/:id" component={DocumentDetail} />
                <Route component={NotFound} />
              </Switch>
            </main>
          </div>
        </div>
      </Route>
    </Switch>
  );
}

export default function App() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <WalletProvider>
            <SidebarProvider style={style as React.CSSProperties}>
              <AppContent />
            </SidebarProvider>
            <Toaster />
          </WalletProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

