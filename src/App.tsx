
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/contexts/CartContext";
import Index from "./pages/Index";
import Search from "./pages/Search";
import Contact from "./pages/Contact";
import HowItWorks from "./pages/HowItWorks";
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
import OrdersPage from "./pages/dashboard/OrdersPage";
import OrderDetail from "./pages/dashboard/OrderDetail";
import { MyBidsPage, WonAuctionsPage, FavoritesPage, PaymentHistoryPage } from "./pages/dashboard/BuyerPages";
import AuctionPayment from "./pages/AuctionPayment";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/search" element={<Search />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
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
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/orders" element={<OrdersPage />} />
            <Route path="/dashboard/orders/:orderId" element={<OrderDetail />} />
            <Route path="/dashboard/my-bids" element={<MyBidsPage />} />
            <Route path="/dashboard/won-auctions" element={<WonAuctionsPage />} />
            <Route path="/dashboard/favorites" element={<FavoritesPage />} />
            <Route path="/dashboard/payment-history" element={<PaymentHistoryPage />} />
            
            {/* Add the new auction payment route */}
            <Route path="/auction-payment" element={<AuctionPayment />} />
            
            {/* Add a default route to redirect to home page */}
            <Route path="*" element={<Index />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </QueryClientProvider>
  );
}

export default App;
