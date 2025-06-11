import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { DashboardProvider } from "@/contexts/DashboardContext";
import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import HowItWorks from "./pages/HowItWorks";
import AllAuctions from "./pages/AllAuctions";
import BrowseCategories from "./pages/BrowseCategories";
import CategoryPage from "./pages/CategoryPage";
import Search from "./pages/Search";
import ItemDetail from "./pages/item/ItemDetail";
import CreateListing from "./pages/listing/CreateListing";
import Auth from "./pages/auth/Auth";
import Dashboard from "./pages/dashboard/Dashboard";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import PaymentConfirmation from "./pages/PaymentConfirmation";
import NotFound from "./pages/NotFound";
import Declutter from "./pages/declutter/Declutter";
import CreateDeclutterListing from "./pages/declutter/CreateDeclutterListing";
import DeclutterListingDetail from "./pages/declutter/DeclutterListingDetail";
import WatchList from "./pages/WatchList";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Careers from "./pages/Careers";

function App() {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <CartProvider>
        <DashboardProvider>
          <Router>
            <div className="min-h-screen bg-background font-sans antialiased">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/auctions" element={<AllAuctions />} />
                <Route path="/browse-categories" element={<BrowseCategories />} />
                <Route path="/auctions/category/:categorySlug" element={<CategoryPage />} />
                <Route path="/search" element={<Search />} />
                <Route path="/search/:query" element={<Search />} />
                <Route path="/item/:itemId" element={<ItemDetail />} />
                <Route path="/create-listing" element={<CreateListing />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dashboard/:path" element={<Dashboard />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/payment-confirmation" element={<PaymentConfirmation />} />
                <Route path="/declutter" element={<Declutter />} />
                <Route path="/declutter/create-listing" element={<CreateDeclutterListing />} />
                <Route path="/declutter/listing/:listingId" element={<DeclutterListingDetail />} />
                <Route path="/watchlist" element={<WatchList />} />
                
                {/* Add new routes for the legal pages */}
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/careers" element={<Careers />} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </div>
          </Router>
        </DashboardProvider>
      </CartProvider>
    </QueryClientProvider>
  );
}

export default App;
