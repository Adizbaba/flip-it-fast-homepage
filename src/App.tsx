
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/auth/Auth";
import CreateListing from "./pages/listing/CreateListing";
import AdminDashboard from "./pages/admin/AdminDashboard";
import WatchList from "./pages/WatchList";
import Search from "./pages/Search"; // New import for Search page

const App = () => {
  // Create QueryClient using useState to ensure it's created only once
  const [queryClient] = useState(() => new QueryClient());
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/create-listing" element={<CreateListing />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/watch-list" element={<WatchList />} />
            <Route path="/search" element={<Search />} /> {/* New search route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
