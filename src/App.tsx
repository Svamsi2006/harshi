import React, { useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { MotionConfig } from 'motion/react';
import { StoreProvider } from './context/StoreContext';
import { AnnouncementBar } from './components/layout/AnnouncementBar';
import { Navbar } from './components/navigation/Navbar';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/cart/CartDrawer';
import { SearchOverlay } from './components/navigation/SearchOverlay';
import { ToastNotification } from './components/common/ToastNotification';

import { HomePage } from './pages/Home/HomePage';
import { ShopPage } from './pages/Shop/ShopPage';
import { ProductDetailPage } from './pages/Product/ProductDetailPage';
import { ArtistStoryPage } from './pages/ArtistStory/ArtistStoryPage';
import { CommissionPage } from './pages/Commission/CommissionPage';
import { SearchPage } from './pages/Search/SearchPage';
import { CartPage } from './pages/Cart/CartPage';
import { CheckoutPage } from './pages/Checkout/CheckoutPage';
import { OrderSuccessPage } from './pages/Checkout/OrderSuccessPage';
import { AccountPage } from './pages/Account/AccountPage';
import { AccountOrdersPage } from './pages/Account/AccountOrdersPage';
import { AccountCartHistoryPage } from './pages/Account/AccountCartHistoryPage';
import { AccountAddressesPage } from './pages/Account/AccountAddressesPage';
import { LoginPage, RegisterPage, ForgotPasswordPage } from './pages/Auth/AuthPages';
import { PolicyPage } from './pages/Policies/PolicyPage';
import { ContactPage } from './pages/Policies/ContactPage';
import { FaqPage } from './pages/Policies/FaqPage';
import { EmptyState } from './components/common/EmptyState';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
};

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <StoreProvider>
        <BrowserRouter>
          <ScrollToTop />
          <div className="relative min-h-screen flex flex-col bg-[#FAF7F2] text-[#2B2623]">
            {/* Subtle paper-grain texture across the storefront */}
            <div className="fixed inset-0 paper-grain-overlay z-[1]" aria-hidden="true" />

            <AnnouncementBar />
            <Navbar />

            <main className="relative z-[2] flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/shop/sketches" element={<ShopPage routeGroup="sketches" />} />
                <Route path="/shop/handicrafts" element={<ShopPage routeGroup="handicrafts" />} />
                <Route path="/shop/paintings" element={<ShopPage routeGroup="paintings" />} />
                <Route path="/shop/prints" element={<ShopPage routeGroup="prints" />} />
                <Route path="/product/:slug" element={<ProductDetailPage />} />
                <Route path="/artist-story" element={<ArtistStoryPage />} />
                <Route path="/commission" element={<CommissionPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-success" element={<OrderSuccessPage />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/account/orders" element={<AccountOrdersPage />} />
                <Route path="/account/cart-history" element={<AccountCartHistoryPage />} />
                <Route path="/account/addresses" element={<AccountAddressesPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/policies/shipping" element={<PolicyPage kind="shipping" />} />
                <Route path="/policies/returns" element={<PolicyPage kind="returns" />} />
                <Route path="/policies/privacy" element={<PolicyPage kind="privacy" />} />
                <Route path="/policies/terms" element={<PolicyPage kind="terms" />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/faq" element={<FaqPage />} />
                <Route
                  path="*"
                  element={
                    <div className="max-w-2xl mx-auto py-20 px-4">
                      <EmptyState
                        title="Page not found"
                        description="This corner of the studio doesn't exist yet. Let's take you back to the gallery shelf."
                        actionLabel="Back to Home"
                        actionTo="/"
                      />
                    </div>
                  }
                />
              </Routes>
            </main>

            <Footer />
            <CartDrawer />
            <SearchOverlay />
            <ToastNotification />
          </div>
        </BrowserRouter>
      </StoreProvider>
    </MotionConfig>
  );
}
