import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient } from "react-query";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/contexts/CartContext";
import Home from "./pages/Home";
import Auctions from "./pages/Auctions";
import Declutter from "./pages/Declutter";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import CreateAuctionItem from "./pages/CreateAuctionItem";
import CreateDeclutterItem from "./pages/CreateDeclutterItem";
import EditAuctionItem from "./pages/EditAuctionItem";
import EditDeclutterItem from "./pages/EditDeclutterItem";
import WatchList from "./pages/WatchList";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import CheckoutFlow from "./pages/CheckoutFlow";
import PaymentConfirmation from "./pages/PaymentConfirmation";
import ItemDetail from "./pages/item/ItemDetail";
import DeclutterDetail from "./pages/declutter/DeclutterDetail";
import Dashboard from "./pages/dashboard/Dashboard";
import OrdersPage from "./pages/dashboard/OrdersPage";
import OrderDetail from "./pages/dashboard/OrderDetail";
import { MyBidsPage, WonAuctionsPage, FavoritesPage, PaymentHistoryPage } from "./pages/dashboard/BuyerPages";
import AuctionPayment from "./pages/AuctionPayment";

function App() {
  return (
    <QueryClient>
      <Toaster />
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auctions" element={<Auctions />} />
            <Route path="/declutter" element={<Declutter />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/create-auction-item" element={<CreateAuctionItem />} />
            <Route path="/create-declutter-item" element={<CreateDeclutterItem />} />
            <Route path="/edit-auction-item/:itemId" element={<EditAuctionItem />} />
            <Route path="/edit-declutter-item/:itemId" element={<EditDeclutterItem />} />
            <Route path="/watch-list" element={<WatchList />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/checkout-flow" element={<CheckoutFlow />} />
            <Route path="/payment-confirmation" element={<PaymentConfirmation />} />
            <Route path="/item/:itemId" element={<ItemDetail />} />
            <Route path="/declutter/:itemId" element={<DeclutterDetail />} />
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
            <Route path="*" element={<Home />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </QueryClient>
  );
}

export default App;
