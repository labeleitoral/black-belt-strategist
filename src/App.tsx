import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import Index from "./pages/Index";
import Agents from "./pages/Agents";
import Insights from "./pages/Insights";
import Cases from "./pages/Cases";
import Network from "./pages/Network";
import Lab from "./pages/Lab";
import Library from "./pages/Library";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/agentes" element={<Agents />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/cases" element={<Cases />} />
            <Route path="/rede" element={<Network />} />
            <Route path="/lab" element={<Lab />} />
            <Route path="/biblioteca" element={<Library />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
