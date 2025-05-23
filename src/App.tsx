
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { CartProvider } from "@/contexts/CartContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/auth/Auth";
import CreateListing from "./pages/listing/CreateListing";
import AdminDashboard from "./pages/admin/AdminDashboard";
import WatchList from "./pages/WatchList";
import Search from "./pages/Search";
import ItemDetail from "./pages/item/ItemDetail";
import AllAuctions from "./pages/AllAuctions";
import HowItWorksPage from "./pages/HowItWorks";
import ContactPage from "./pages/Contact";
import AboutPage from "./pages/About";
import Checkout from "./pages/Checkout";
import PaymentConfirmation from "./pages/PaymentConfirmation";
import Cart from "./pages/Cart";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import { 
  MyBidsPage, 
  WonAuctionsPage, 
  FavoritesPage, 
  PaymentHistoryPage 
} from "./pages/dashboard/BuyerPages";
import {
  MyListingsPage,
  CreateListingPage,
  SoldItemsPage,
  EarningsPage
} from "./pages/dashboard/SellerPages";
import {
  NotificationsPage,
  ProfilePage,
  SettingsPage
} from "./pages/dashboard/SharedPages";
import {
  DeclutterListingsPage,
  EditDeclutterListingPage
} from "./pages/dashboard/DeclutterPages";
import OrdersPage from "./pages/dashboard/OrdersPage";
import OrderDetail from "./pages/dashboard/OrderDetail";
import Declutter from "./pages/declutter/Declutter";
import DeclutterListingDetail from "./pages/declutter/DeclutterListingDetail";
import CreateDeclutterListing from "./pages/declutter/CreateDeclutterListing";
import EditListing from "./pages/dashboard/seller/EditListing";

const App = () => {
  const [queryClient] = useState(() => new QueryClient());
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/create-listing" element={<CreateListing />} />
              <Route path="/create-declutter-listing" element={<CreateDeclutterListing />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/watch-list" element={<WatchList />} />
              <Route path="/search" element={<Search />} />
              <Route path="/item/:itemId" element={<ItemDetail />} />
              <Route path="/declutter" element={<Declutter />} />
              <Route path="/declutter/:id" element={<DeclutterListingDetail />} />
              <Route path="/auctions" element={<AllAuctions />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/payment-confirmation" element={<PaymentConfirmation />} />
              
              {/* Dashboard Routes */}
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<Dashboard />} />
                
                {/* Buyer Pages */}
                <Route path="bids" element={<MyBidsPage />} />
                <Route path="won-auctions" element={<WonAuctionsPage />} />
                <Route path="favorites" element={<FavoritesPage />} />
                <Route path="payment-history" element={<PaymentHistoryPage />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="orders/:orderId" element={<OrderDetail />} />
                
                {/* Seller Pages */}
                <Route path="listings" element={<MyListingsPage />} />
                <Route path="create-listing" element={<CreateListingPage />} />
                <Route path="edit-listing/:id" element={<EditListing />} />
                <Route path="declutter-listings" element={<DeclutterListingsPage />} />
                <Route path="edit-declutter-listing/:id" element={<EditDeclutterListingPage />} />
                <Route path="sold-items" element={<SoldItemsPage />} />
                <Route path="earnings" element={<EarningsPage />} />
                
                {/* Shared Pages */}
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
