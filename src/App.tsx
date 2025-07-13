
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/contexts/CartContext";
import Index from "./pages/Index";
import Search from "./pages/Search";
import Contact from "./pages/Contact";
import HowItWorks from "./pages/HowItWorks";
import AllAuctions from "./pages/AllAuctions";
import BrowseCategories from "./pages/BrowseCategories";
import CategoryPage from "./pages/CategoryPage";
import About from "./pages/About";
import Auth from "./pages/auth/Auth";
import ProfileManagement from "./pages/dashboard/ProfileManagement";
import CreateListing from "./pages/listing/CreateListing";
import CreateDeclutterListing from "./pages/declutter/CreateDeclutterListing";
import EditListing from "./pages/dashboard/seller/EditListing";
import EditDeclutterListing from "./pages/declutter/EditDeclutterListing";
import WatchList from "./pages/WatchList";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import CheckoutFlow from "./pages/CheckoutFlow";
import PaymentConfirmation from "./pages/PaymentConfirmation";
import ItemDetail from "./pages/item/ItemDetail";
import DeclutterListingDetail from "./pages/declutter/DeclutterListingDetail";
import Dashboard from "./pages/dashboard/Dashboard";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import OrdersPage from "./pages/dashboard/OrdersPage";
import OrderDetail from "./pages/dashboard/OrderDetail";
import { MyBidsPage, WonAuctionsPage, FavoritesPage, PaymentHistoryPage } from "./pages/dashboard/BuyerPages";
import { MyListingsPage, CreateListingPage, SoldItemsPage, EarningsPage } from "./pages/dashboard/SellerPages";
import { DeclutterListingsPage, DeclutterSoldItemsPage } from "./pages/dashboard/DeclutterPages";
import { NotificationsPage, ProfilePage, SettingsPage } from "./pages/dashboard/SharedPages";
import AuctionPayment from "./pages/AuctionPayment";
import Declutter from "./pages/declutter/Declutter";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <BrowserRouter>
        <CartProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/search" element={<Search />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/about" element={<About />} />
            <Route path="/auctions" element={<AllAuctions />} />
            <Route path="/browse-categories" element={<BrowseCategories />} />
            <Route path="/auctions/category/:categorySlug" element={<CategoryPage />} />
            <Route path="/declutter" element={<Declutter />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<ProfileManagement />} />
            <Route path="/create-listing" element={<CreateListing />} />
            <Route path="/create-declutter-listing" element={<CreateDeclutterListing />} />
            <Route path="/edit-listing/:itemId" element={<EditListing />} />
            <Route path="/edit-declutter-listing/:itemId" element={<EditDeclutterListing />} />
            <Route path="/watch-list" element={<WatchList />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/checkout-flow" element={<CheckoutFlow />} />
            <Route path="/payment-confirmation" element={<PaymentConfirmation />} />
            <Route path="/item/:itemId" element={<ItemDetail />} />
            <Route path="/declutter/:itemId" element={<DeclutterListingDetail />} />
            <Route path="/auction-payment" element={<AuctionPayment />} />
            
            {/* All dashboard routes now use DashboardLayout */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="orders/:orderId" element={<OrderDetail />} />
              <Route path="bids" element={<MyBidsPage />} />
              <Route path="won-auctions" element={<WonAuctionsPage />} />
              <Route path="favorites" element={<FavoritesPage />} />
              <Route path="payment-history" element={<PaymentHistoryPage />} />
              <Route path="listings" element={<MyListingsPage />} />
              <Route path="create-listing" element={<CreateListingPage />} />
              <Route path="sold-items" element={<SoldItemsPage />} />
              <Route path="earnings" element={<EarningsPage />} />
              <Route path="declutter-listings" element={<DeclutterListingsPage />} />
              <Route path="declutter-sold-items" element={<DeclutterSoldItemsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            
            {/* Add a default route to redirect to home page */}
            <Route path="*" element={<Index />} />
          </Routes>
        </CartProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
