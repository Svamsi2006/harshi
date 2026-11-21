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
import { StudioSplashIntro } from './components/common/StudioSplashIntro';
import { StudioChatbotWidget } from './components/chat/StudioChatbotWidget';

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
import { AdminCategoriesPage } from './pages/Admin/AdminCategoriesPage';
import { AdminInventoryPage } from './pages/Admin/AdminInventoryPage';
import { AdminOrdersPage } from './pages/Admin/AdminOrdersPage';
import { AdminCustomersPage } from './pages/Admin/AdminCustomersPage';
import { AdminCommissionsPage } from './pages/Admin/AdminCommissionsPage';
import { AdminAnalyticsPage } from './pages/Admin/AdminAnalyticsPage';
import { AdminDiscountsPage } from './pages/Admin/AdminDiscountsPage';
import { AdminContentPage } from './pages/Admin/AdminContentPage';
import { AdminSettingsPage } from './pages/Admin/AdminSettingsPage';

class StudioErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === 'string'
          ? error
          : 'An unexpected rendering issue occurred.';
    return { hasError: true, message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-lg mx-auto my-16 p-8 rounded-3xl bg-white border border-[#E7C7CC] shadow-warm text-center space-y-4">
          <h2 className="font-display text-2xl font-medium text-[#3E2F27]">
            Something paused in the studio
          </h2>
          <p className="text-sm text-[#7A655C] break-words">{this.state.message}</p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-xl bg-[#6D1836] text-[#FFF9F5] text-sm font-medium"
            >
              Reload Studio
            </button>
            <a
              href="/"
              className="px-5 py-2.5 rounded-xl border border-[#E7C7CC] text-sm font-medium text-[#3E2F27]"
            >
              Back to Home
            </a>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

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
  const [introReplay, setIntroReplay] = React.useState(0);
  const isAdminRoute = pathname.startsWith('/admin');

  useEffect(() => {
    const onReplay = () => setIntroReplay((n) => n + 1);
    window.addEventListener('varniks:replay-intro', onReplay);
    return () => window.removeEventListener('varniks:replay-intro', onReplay);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col bg-[#FFF9F5] text-[#3E2F27]">
      <StudioSplashIntro replayTrigger={introReplay} />
      <div className="fixed inset-0 paper-grain-overlay z-[1]" aria-hidden="true" />

      {!isAdminRoute && <AnnouncementBar message={storeSettings.announcementText} />}
      {!isAdminRoute && <Navbar />}

      <main className="relative z-[2] flex-1">
        <StudioErrorBoundary>
          <Routes>
          {/* Customer Storefront Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/shop/category/:slug" element={<ShopPage />} />
          <Route path="/product/:slug" element={<ProductDetailPage />} />
          <Route path="/about-us" element={<ArtistStoryPage />} />
          <Route path="/artist-story" element={<Navigate to="/about-us" replace />} />
          <Route path="/custom-orders" element={<CommissionPage />} />
          <Route path="/commission" element={<Navigate to="/custom-orders" replace />} />
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
            path="/admin/categories"
            element={
              <RequireAdmin>
                <AdminCategoriesPage />
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
        </StudioErrorBoundary>
      </main>

      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <CartDrawer />}
      {!isAdminRoute && <SearchOverlay />}
      {!isAdminRoute && <StudioChatbotWidget />}
      <ToastNotification />
    </div>
  );
};

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <StudioErrorBoundary>
        <StoreProvider>
          <BrowserRouter>
            <ScrollToTop />
            <AppShell />
          </BrowserRouter>
        </StoreProvider>
      </StudioErrorBoundary>
    </MotionConfig>
  );
}
