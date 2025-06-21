
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { CartProvider } from "@/contexts/CartContext";
import AuthGuard from "@/components/AuthGuard";
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
import DashboardLayout from "@/components/dashboard/DashboardLayout";
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
import BrowseCategories from "./pages/BrowseCategories";
import CategoryPage from "./pages/CategoryPage";
import CheckoutFlow from "./pages/CheckoutFlow";
import OrderConfirmation from "./pages/OrderConfirmation";

const App = () => {
  const [queryClient] = useState(() => new QueryClient());
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <CartProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              
              {/* Protected Routes */}
              <Route path="/create-listing" element={
                <AuthGuard requireAuth>
                  <CreateListing />
                </AuthGuard>
              } />
              <Route path="/create-declutter-listing" element={
                <AuthGuard requireAuth>
                  <CreateDeclutterListing />
                </AuthGuard>
              } />
              <Route path="/admin" element={
                <AuthGuard requireAuth>
                  <AdminDashboard />
                </AuthGuard>
              } />
              <Route path="/watch-list" element={
                <AuthGuard requireAuth>
                  <WatchList />
                </AuthGuard>
              } />
              
              {/* Public Routes */}
              <Route path="/search" element={<Search />} />
              <Route path="/item/:itemId" element={<ItemDetail />} />
              <Route path="/declutter" element={<Declutter />} />
              <Route path="/declutter/:id" element={<DeclutterListingDetail />} />
              <Route path="/auctions" element={<AllAuctions />} />
              <Route path="/browse-categories" element={<BrowseCategories />} />
              <Route path="/auctions/category/:categorySlug" element={<CategoryPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/about" element={<AboutPage />} />
              
              {/* Cart and Checkout Routes */}
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/checkout-flow" element={<CheckoutFlow />} />
              <Route path="/order-confirmation" element={<OrderConfirmation />} />
              <Route path="/payment-confirmation" element={<PaymentConfirmation />} />
              
              {/* Dashboard Routes - All Protected */}
              <Route path="/dashboard" element={
                <AuthGuard requireAuth>
                  <DashboardLayout />
                </AuthGuard>
              }>
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
          </CartProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
