
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/contexts/CartContext";
import Index from "./pages/Index";
import Search from "./pages/Search";
import HowItWorks from "./pages/HowItWorks";
import AllAuctions from "./pages/AllAuctions";
// Lazy-loaded routes for performance
const Contact = lazy(() => import("./pages/Contact"));
const About = lazy(() => import("./pages/About"));
const BrowseCategories = lazy(() => import("./pages/BrowseCategories"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const Auth = lazy(() => import("./pages/auth/Auth"));
const ProfileManagement = lazy(() => import("./pages/dashboard/ProfileManagement"));
const CreateListing = lazy(() => import("./pages/listing/CreateListing"));
const CreateDeclutterListing = lazy(() => import("./pages/declutter/CreateDeclutterListing"));
const EditListing = lazy(() => import("./pages/dashboard/seller/EditListing"));
const EditDeclutterListing = lazy(() => import("./pages/declutter/EditDeclutterListing"));
const WatchList = lazy(() => import("./pages/WatchList"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const CheckoutFlow = lazy(() => import("./pages/CheckoutFlow"));
const PaymentConfirmation = lazy(() => import("./pages/PaymentConfirmation"));
const ItemDetail = lazy(() => import("./pages/item/ItemDetail"));
const DeclutterListingDetail = lazy(() => import("./pages/declutter/DeclutterListingDetail"));
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"));
const DashboardLayout = lazy(() => import("./components/dashboard/DashboardLayout"));
const OrdersPage = lazy(() => import("./pages/dashboard/OrdersPage"));
const OrderDetail = lazy(() => import("./pages/dashboard/OrderDetail"));
const MyBidsPage = lazy(() => import("./pages/dashboard/BuyerPages").then(m => ({ default: m.MyBidsPage })));
const WonAuctionsPage = lazy(() => import("./pages/dashboard/BuyerPages").then(m => ({ default: m.WonAuctionsPage })));
const FavoritesPage = lazy(() => import("./pages/dashboard/BuyerPages").then(m => ({ default: m.FavoritesPage })));
const PaymentHistoryPage = lazy(() => import("./pages/dashboard/BuyerPages").then(m => ({ default: m.PaymentHistoryPage })));
const MyListingsPage = lazy(() => import("./pages/dashboard/SellerPages").then(m => ({ default: m.MyListingsPage })));
const CreateListingPage = lazy(() => import("./pages/dashboard/SellerPages").then(m => ({ default: m.CreateListingPage })));
const SoldItemsPage = lazy(() => import("./pages/dashboard/SellerPages").then(m => ({ default: m.SoldItemsPage })));
const EarningsPage = lazy(() => import("./pages/dashboard/SellerPages").then(m => ({ default: m.EarningsPage })));
const DeclutterListingsPage = lazy(() => import("./pages/dashboard/DeclutterPages").then(m => ({ default: m.DeclutterListingsPage })));
const DeclutterSoldItemsPage = lazy(() => import("./pages/dashboard/DeclutterPages").then(m => ({ default: m.DeclutterSoldItemsPage })));
const NotificationsPage = lazy(() => import("./pages/dashboard/SharedPages").then(m => ({ default: m.NotificationsPage })));
const ProfilePage = lazy(() => import("./pages/dashboard/SharedPages").then(m => ({ default: m.ProfilePage })));
const SettingsPage = lazy(() => import("./pages/dashboard/SharedPages").then(m => ({ default: m.SettingsPage })));

const AuctionPayment = lazy(() => import("./pages/AuctionPayment"));
const Declutter = lazy(() => import("./pages/declutter/Declutter"));
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <BrowserRouter>
        <CartProvider>
          <Suspense fallback={<div className="p-8">Loading...</div>}>
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
              <Route path="*" element={<Index />} />
            </Routes>
          </Suspense>
        </CartProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
