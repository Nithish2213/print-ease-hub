
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { OrderProvider } from "./context/OrderContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <OrderProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              
              {/* Student Routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/print" element={<Dashboard content="print" />} />
              <Route path="/dashboard/tracking" element={<Dashboard content="tracking" />} />
              <Route path="/dashboard/orders" element={<Dashboard content="orders" />} />
              
              {/* Co-Admin Routes */}
              <Route path="/dashboard/manage-orders" element={<Dashboard content="manage-orders" />} />
              <Route path="/dashboard/inventory" element={<Dashboard content="inventory" />} />
              <Route path="/dashboard/printer-controls" element={<Dashboard content="printer-controls" />} />
              
              {/* Admin Routes */}
              <Route path="/dashboard/staff" element={<Dashboard content="staff" />} />
              <Route path="/dashboard/revenue" element={<Dashboard content="revenue" />} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </OrderProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
