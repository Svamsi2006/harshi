import React, { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { MotionConfig } from 'motion/react';
import { StoreProvider, useStore } from './context/StoreContext';
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

import { AdminLoginPage } from './pages/Admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/Admin/AdminDashboardPage';
import { AdminProductsPage } from './pages/Admin/AdminProductsPage';
import { AdminProductFormPage } from './pages/Admin/AdminProductFormPage';
import { AdminInventoryPage } from './pages/Admin/AdminInventoryPage';
import { AdminOrdersPage } from './pages/Admin/AdminOrdersPage';
import { AdminCustomersPage } from './pages/Admin/AdminCustomersPage';
import { AdminCommissionsPage } from './pages/Admin/AdminCommissionsPage';
import { AdminAnalyticsPage } from './pages/Admin/AdminAnalyticsPage';
import { AdminDiscountsPage } from './pages/Admin/AdminDiscountsPage';
import { AdminContentPage } from './pages/Admin/AdminContentPage';
import { AdminSettingsPage } from './pages/Admin/AdminSettingsPage';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
};

const RequireAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin } = useStore();
  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
};

const AppShell: React.FC = () => {
  const { pathname } = useLocation();
  const { storeSettings } = useStore();
  const isAdminRoute = pathname.startsWith('/admin');

  return (
    <div className="relative min-h-screen flex flex-col bg-[#FAF7F2] text-[#2B2623]">
      {/* Subtle paper-grain texture across the storefront */}
      <div className="fixed inset-0 paper-grain-overlay z-[1]" aria-hidden="true" />

      {!isAdminRoute && <AnnouncementBar message={storeSettings.announcementText} />}
      {!isAdminRoute && <Navbar />}

      <main className="relative z-[2] flex-1">
        <Routes>
          {/* Customer Storefront Routes */}
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

          {/* Studio Owner Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminDashboardPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/products"
            element={
              <RequireAdmin>
                <AdminProductsPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/products/new"
            element={
              <RequireAdmin>
                <AdminProductFormPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/products/:id/edit"
            element={
              <RequireAdmin>
                <AdminProductFormPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/inventory"
            element={
              <RequireAdmin>
                <AdminInventoryPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <RequireAdmin>
                <AdminOrdersPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/customers"
            element={
              <RequireAdmin>
                <AdminCustomersPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/commissions"
            element={
              <RequireAdmin>
                <AdminCommissionsPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <RequireAdmin>
                <AdminAnalyticsPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/discounts"
            element={
              <RequireAdmin>
                <AdminDiscountsPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/content"
            element={
              <RequireAdmin>
                <AdminContentPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <RequireAdmin>
                <AdminSettingsPage />
              </RequireAdmin>
            }
          />

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

      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <CartDrawer />}
      {!isAdminRoute && <SearchOverlay />}
      <ToastNotification />
    </div>
  );
};

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <StoreProvider>
        <BrowserRouter>
          <ScrollToTop />
          <AppShell />
        </BrowserRouter>
      </StoreProvider>
    </MotionConfig>
  );
}
