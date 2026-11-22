import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type {
  Address,
  CartHistoryAction,
  CartHistoryEntry,
  CartItem,
  CategoryItem,
  CommissionRequest,
  Coupon,
  CustomerUser,
  Order,
  OrderStatus,
  PaymentMethod,
  Product,
  StoreSettings,
  ToastMessage,
} from '../types';
import { DEMO_CUSTOMER, DEMO_OWNER, storeService } from '../services/storeService';
import { PRODUCTS as DEFAULT_PRODUCTS } from '../data/products';
import { STUDIO_MEDIA } from '../data/studioImages';
import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_FEE } from '../utils/format';
import { calculateLocationShipping } from '../utils/shipping';
import { isAdminEmail } from '../utils/admin';
import {
  getBrowserSupabaseClient,
  getPublicAuthConfig,
  signOutBrowserSupabase,
  startSupabaseGoogleSignIn,
} from '../lib/supabaseAuth';

export interface SupabaseSyncDiagnostics {
  hasUrl: boolean;
  hasKey: boolean;
  hasDatabaseUrl: boolean;
  urlSource?: string | null;
  keySource?: string | null;
  vercel?: boolean;
}

export interface SupabaseSyncStatus {
  configured: boolean;
  tablesReady: boolean;
  missingTables: string[];
  error?: string;
  diagnostics?: SupabaseSyncDiagnostics;
  checked: boolean;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'string' && error.trim()) return error;
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  return fallback;
}

interface StoreContextValue {
  user: CustomerUser | null;
  isAdmin: boolean;
  adminPinUnlocked: boolean;
  unlockAdminPortal: (token: string) => void;
  lockAdminPortal: () => void;
  categories: CategoryItem[];
  products: Product[];
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  shippingFee: number;
  wishlist: string[];
  cartHistory: CartHistoryEntry[];
  addresses: Address[];
  orders: Order[];
  allOrders: Order[];
  commissions: CommissionRequest[];
  coupons: Coupon[];
  storeSettings: StoreSettings;
  recentSearches: string[];
  isCartDrawerOpen: boolean;
  isSearchOpen: boolean;
  toasts: ToastMessage[];
  lastPlacedOrder: Order | null;
  supabaseStatus: SupabaseSyncStatus;
  refreshSupabaseSync: () => Promise<void>;

  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  addToast: (title: string, subtitle?: string, type?: ToastMessage['type']) => void;
  dismissToast: (id: string) => void;

  loginWithCredentials: (
    email: string,
    password: string
  ) => { ok: boolean; user?: CustomerUser; error?: string };
  loginWithGoogle: (redirectPath?: string) => Promise<{ ok: boolean; error?: string }>;
  googleAuthAvailable: boolean;
  authSyncing: boolean;
  loginAsDemoCustomer: () => void;
  loginAsDemoOwner: () => void;
  registerCustomer: (data: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
  }) => { ok: boolean; error?: string };
  updateProfile: (data: { fullName: string; email: string; phone: string }) => void;
  logout: () => void;

  addCategory: (input: { label: string; subtitle?: string }) => CategoryItem;
  deleteCategory: (idOrSlug: string) => void;

  addProduct: (
    data: Omit<Product, 'id' | 'createdAt'>
  ) => Promise<{ ok: boolean; product: Product; synced?: boolean; error?: string }>;
  updateProduct: (product: Product) => Promise<{ ok: boolean; synced?: boolean; error?: string }>;
  deleteProduct: (id: string) => Promise<{ ok: boolean; synced?: boolean; error?: string }>;
  duplicateProduct: (id: string) => Promise<Product | null>;

  updateOrderStatus: (orderId: string, status: OrderStatus, trackingCode?: string) => void;

  createCustomOrderRequest: (
    req: Omit<
      CommissionRequest,
      'id' | 'submittedAt' | 'status' | 'adminApproved' | 'customerApproved' | 'orderCreated'
    >
  ) => CommissionRequest;
  updateCommissionStatus: (
    id: string,
    status: CommissionRequest['status'],
    quotedPrice?: number,
    internalNotes?: string
  ) => void;
  approveCustomOrderByAdmin: (id: string, quotedPrice?: number, internalNotes?: string) => void;
  approveCustomOrderByCustomerAndCreateOrder: (
    id: string,
    checkoutInput?: {
      shippingAddress: Omit<Address, 'id' | 'isDefault'>;
      customerEmail: string;
      customerName?: string;
      paymentMethod: PaymentMethod;
      paymentReference?: string;
      shippingFeeOverride?: number;
    }
  ) => Order | null;
  createContinuousOrderFromCustomRequest: (
    id: string,
    checkoutInput?: {
      shippingAddress: Omit<Address, 'id' | 'isDefault'>;
      customerEmail: string;
      customerName?: string;
      paymentMethod: PaymentMethod;
      paymentReference?: string;
      shippingFeeOverride?: number;
    }
  ) => Order | null;

  saveCoupons: (coupons: Coupon[]) => void;
  saveStoreSettings: (
    settings: StoreSettings & { openrouterApiKey?: string; razorpayKeySecret?: string }
  ) => Promise<void>;

  addToCart: (productId: string, quantity?: number, openDrawer?: boolean) => boolean;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string, actionType?: CartHistoryAction) => void;
  saveCartItemForLater: (productId: string) => void;
  clearCart: () => void;

  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;

  addAddress: (address: Omit<Address, 'id'>) => void;
  updateAddress: (address: Address) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;

  placeOrder: (params: {
    shippingAddress: Omit<Address, 'id' | 'isDefault'>;
    paymentMethod: PaymentMethod;
    customerEmail?: string;
    customerName?: string;
    paymentReference?: string;
    discount?: number;
    shippingFeeOverride?: number;
  }) => Order | null;

  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CustomerUser | null>(() => storeService.getCurrentUser());
  const userId = user?.id ?? null;
  const isAdmin = Boolean(user && isAdminEmail(user.email));
  const [adminPinUnlocked, setAdminPinUnlocked] = useState(false);
  const [, setAdminUnlockToken] = useState<string | null>(null);

  const unlockAdminPortal = useCallback((token: string) => {
    if (!token) return;
    setAdminUnlockToken(token);
    setAdminPinUnlocked(true);
  }, []);

  const lockAdminPortal = useCallback(() => {
    setAdminUnlockToken(null);
    setAdminPinUnlocked(false);
  }, []);

  const [categories, setCategories] = useState<CategoryItem[]>(() => storeService.getCategories());
  const [products, setProducts] = useState<Product[]>(() => storeService.getProducts());
  const [cart, setCart] = useState<CartItem[]>(() => storeService.getCart(userId));
  const [wishlist, setWishlist] = useState<string[]>(() => storeService.getWishlist(userId));
  const [cartHistory, setCartHistory] = useState<CartHistoryEntry[]>(() =>
    storeService.getCartHistory(userId)
  );
  const [addresses, setAddresses] = useState<Address[]>(() => storeService.getAddresses(userId));
  const [allOrders, setAllOrders] = useState<Order[]>(() => storeService.getAllOrders());
  const [commissions, setCommissions] = useState<CommissionRequest[]>(() =>
    storeService.getCommissions()
  );
  const [coupons, setCoupons] = useState<Coupon[]>(() => storeService.getCoupons());
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() =>
    storeService.getStoreSettings()
  );
  const [recentSearches, setRecentSearches] = useState<string[]>(() =>
    storeService.getRecentSearches()
  );

  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);
  const [googleAuthAvailable, setGoogleAuthAvailable] = useState(false);
  const [authSyncing, setAuthSyncing] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<SupabaseSyncStatus>({
    configured: false,
    tablesReady: false,
    missingTables: [],
    checked: false,
  });

  const mergeGuestCartIntoUser = useCallback((targetUserId: string) => {
    const guestItems = storeService.getCart(undefined);
    if (guestItems.length === 0) return;
    const userItems = storeService.getCart(targetUserId);
    const mergedMap = new Map<string, CartItem>();
    for (const item of userItems) {
      mergedMap.set(item.productId, { ...item });
    }
    for (const gItem of guestItems) {
      const existing = mergedMap.get(gItem.productId);
      if (existing) {
        mergedMap.set(gItem.productId, {
          ...existing,
          quantity: existing.quantity + gItem.quantity,
        });
      } else {
        mergedMap.set(gItem.productId, { ...gItem });
      }
    }
    storeService.saveCart(Array.from(mergedMap.values()), targetUserId);
    storeService.saveCart([], undefined);
  }, []);

  const refreshSupabaseSync = useCallback(async () => {
    try {
      const statusRes = await fetch('/api/supabase/status', {
        headers: { Accept: 'application/json' },
      });
      const contentType = statusRes.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        setSupabaseStatus({
          configured: false,
          tablesReady: false,
          missingTables: [],
          error:
            'API route (/api/supabase/status) returned HTML instead of JSON. Ensure Vercel serverless functions in /api are deployed and redeploy.',
          checked: true,
        });
        return;
      }

      const statusJson = await statusRes.json().catch(() => ({}));
      if (!statusRes.ok) {
        setSupabaseStatus({
          configured: false,
          tablesReady: false,
          missingTables: [],
          error: getErrorMessage(statusJson.error, `API returned HTTP ${statusRes.status}`),
          diagnostics: statusJson.diagnostics,
          checked: true,
        });
        return;
      }
      setSupabaseStatus({
        configured: Boolean(statusJson.configured),
        tablesReady: Boolean(statusJson.tablesReady),
        missingTables: Array.isArray(statusJson.missingTables) ? statusJson.missingTables : [],
        error: statusJson.error
          ? getErrorMessage(statusJson.error, 'Supabase status request failed')
          : undefined,
        diagnostics: statusJson.diagnostics,
        checked: true,
      });

      if (!statusJson.tablesReady) return;

      const bootRes = await fetch('/api/bootstrap', {
        headers: { Accept: 'application/json' },
      });
      if (!bootRes.ok) return;
      const bootContentType = bootRes.headers.get('content-type') || '';
      if (!bootContentType.includes('application/json')) return;
      const boot = await bootRes.json();
      if (!boot.synced) return;

      if (Array.isArray(boot.categories) && boot.categories.length > 0) {
        storeService.saveCategories(boot.categories);
        setCategories(boot.categories);
      }
      if (Array.isArray(boot.products) && boot.products.length > 0) {
        storeService.saveProducts(boot.products);
        setProducts(boot.products);
      } else {
        await fetch('/api/products/seed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ products: storeService.getProducts() || DEFAULT_PRODUCTS }),
        });
      }
      if (Array.isArray(boot.orders) && boot.orders.length > 0) {
        storeService.saveAllOrders(boot.orders);
        setAllOrders(boot.orders);
      }
      if (Array.isArray(boot.commissions) && boot.commissions.length > 0) {
        storeService.saveCommissions(boot.commissions);
        setCommissions(boot.commissions);
      }
      if (Array.isArray(boot.coupons) && boot.coupons.length > 0) {
        storeService.saveCoupons(boot.coupons);
        setCoupons(boot.coupons);
      }
      if (boot.settings) {
        const mergedSettings: StoreSettings = {
          ...storeService.getStoreSettings(),
          ...boot.settings,
        };
        storeService.saveStoreSettings(mergedSettings);
        setStoreSettings(mergedSettings);
      }
    } catch (error) {
      setSupabaseStatus({
        configured: false,
        tablesReady: false,
        missingTables: [],
        error: getErrorMessage(error, 'Could not reach the Supabase API'),
        checked: true,
      });
    }
  }, []);

  useEffect(() => {
    void refreshSupabaseSync();
  }, [refreshSupabaseSync]);

  // Sync Supabase Google OAuth sessions automatically on load & auth state changes
  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | null = null;

    const syncSessionToStore = async (accessToken: string, fallbackUser?: {
      id: string;
      email?: string | null;
      phone?: string | null;
      created_at?: string;
      user_metadata?: Record<string, any>;
    }) => {
      if (!active) return;
      setAuthSyncing(true);
      try {
        const res = await fetch('/api/auth/supabase-sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const ct = res.headers.get('content-type') || '';
        const json = ct.includes('application/json') ? await res.json().catch(() => ({})) : {};

        let syncedUser: CustomerUser | null = null;
        if (res.ok && json?.ok && json.user) {
          const serverUser = json.user as CustomerUser;
          syncedUser = isAdminEmail(serverUser.email)
            ? { ...serverUser, role: 'owner' }
            : serverUser;
        } else if (fallbackUser?.email) {
          const meta = fallbackUser.user_metadata || {};
          const email = fallbackUser.email.trim().toLowerCase();
          syncedUser = {
            id: `sb-${fallbackUser.id}`,
            fullName: String(meta.full_name || meta.name || email.split('@')[0] || 'Studio Collector'),
            email,
            phone: String(fallbackUser.phone || meta.phone || ''),
            joinedAt: fallbackUser.created_at
              ? String(fallbackUser.created_at).slice(0, 10)
              : new Date().toISOString().split('T')[0],
            role: isAdminEmail(email) ? 'owner' : 'customer',
          };
        }

        if (syncedUser && active) {
          mergeGuestCartIntoUser(syncedUser.id);
          storeService.setCurrentUser(syncedUser);
          setUser(syncedUser);
        }
      } catch {
        // ignore network hiccups; local session remains intact
      } finally {
        if (active) setAuthSyncing(false);
      }
    };

    const initSupabaseAuth = async () => {
      const cfg = await getPublicAuthConfig();
      if (active) setGoogleAuthAvailable(cfg.googleAuthEnabled);
      if (!cfg.googleAuthEnabled) return;

      const client = await getBrowserSupabaseClient();
      if (!client || !active) return;

      const { data } = await client.auth.getSession();
      if (data.session?.access_token && data.session.user) {
        await syncSessionToStore(data.session.access_token, data.session.user);
      }

      const { data: listener } = client.auth.onAuthStateChange((event, session) => {
        if (
          (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') &&
          session?.access_token &&
          session.user
        ) {
          void syncSessionToStore(session.access_token, session.user);
        }
      });
      unsubscribe = () => listener.subscription.unsubscribe();
    };

    void initSupabaseAuth();

    return () => {
      active = false;
      if (unsubscribe) unsubscribe();
    };
  }, [mergeGuestCartIntoUser]);

  useEffect(() => {
    setCart(storeService.getCart(userId));
    setWishlist(storeService.getWishlist(userId));
    setCartHistory(storeService.getCartHistory(userId));
    setAddresses(storeService.getAddresses(userId));
    setAllOrders(storeService.getAllOrders());
    setCommissions(storeService.getCommissions());
    setAdminPinUnlocked(false);
    setAdminUnlockToken(null);
  }, [userId]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (title: unknown, subtitle?: unknown, type: ToastMessage['type'] = 'success') => {
      const safeTitle = getErrorMessage(title, 'Studio notification');
      const safeSubtitle =
        subtitle === undefined || subtitle === null
          ? undefined
          : getErrorMessage(subtitle, '');
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [
        ...prev.slice(-2),
        { id, title: safeTitle, subtitle: safeSubtitle || undefined, type },
      ]);
      window.setTimeout(() => {
        dismissToast(id);
      }, 3200);
    },
    [dismissToast]
  );

  const getProductById = useCallback(
    (id: string) => products.find((p) => p.id === id),
    [products]
  );

  const recordCartHistory = useCallback(
    (productId: string, quantity: number, action: CartHistoryAction) => {
      const product = getProductById(productId);
      if (!product) return;
      const entry: CartHistoryEntry = {
        id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        productId,
        quantity,
        priceAtEvent: product.price,
        action,
        timestamp: new Date().toISOString(),
      };
      setCartHistory((prev) => {
        const next = [entry, ...prev].slice(0, 30);
        storeService.saveCartHistory(next, userId);
        return next;
      });
    },
    [getProductById, userId]
  );

  const addToCart = useCallback(
    (productId: string, quantity = 1, openDrawer = false): boolean => {
      const product = getProductById(productId);
      if (!product || product.stock <= 0) {
        addToast('Currently out of stock', 'This piece has found a home.', 'error');
        return false;
      }

      let addedOk = true;
      setCart((prev) => {
        const existing = prev.find((item) => item.productId === productId);
        const currentQty = existing?.quantity ?? 0;
        const targetQty = currentQty + quantity;
        if (targetQty > product.stock) {
          addedOk = false;
          return prev;
        }
        const next = existing
          ? prev.map((item) =>
              item.productId === productId ? { ...item, quantity: targetQty } : item
            )
          : [...prev, { productId, quantity, addedAt: new Date().toISOString() }];
        storeService.saveCart(next, userId);
        return next;
      });

      if (!addedOk) {
        addToast(
          `Only ${product.stock} available`,
          `Maximum stock for ${product.name} is already in your bag.`,
          'info'
        );
        return false;
      }

      addToast('Added to your studio bag', product.name, 'success');
      if (openDrawer) {
        setIsCartDrawerOpen(true);
      }
      return true;
    },
    [addToast, getProductById, userId]
  );

  const updateCartQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        const product = getProductById(productId);
        setCart((prev) => {
          const item = prev.find((i) => i.productId === productId);
          if (item) recordCartHistory(productId, item.quantity, 'removed');
          const next = prev.filter((i) => i.productId !== productId);
          storeService.saveCart(next, userId);
          return next;
        });
        if (product) {
          addToast('Removed from bag', product.name, 'info');
        }
        return;
      }
      const product = getProductById(productId);
      if (!product) return;
      const maxStock = product.stock > 0 ? product.stock : quantity;
      const clamped = Math.min(quantity, maxStock);
      setCart((prev) => {
        const next = prev.map((i) =>
          i.productId === productId ? { ...i, quantity: clamped } : i
        );
        storeService.saveCart(next, userId);
        return next;
      });
    },
    [addToast, getProductById, recordCartHistory, userId]
  );

  const removeFromCart = useCallback(
    (productId: string, actionType: CartHistoryAction = 'removed') => {
      const product = getProductById(productId);
      setCart((prev) => {
        const existing = prev.find((i) => i.productId === productId);
        if (existing) {
          recordCartHistory(productId, existing.quantity, actionType);
        }
        const next = prev.filter((i) => i.productId !== productId);
        storeService.saveCart(next, userId);
        return next;
      });
      if (product && actionType === 'removed') {
        addToast('Removed from bag', product.name, 'info');
      }
    },
    [addToast, getProductById, recordCartHistory, userId]
  );

  const saveCartItemForLater = useCallback(
    (productId: string) => {
      const product = getProductById(productId);
      removeFromCart(productId, 'saved');
      setWishlist((prev) => {
        if (prev.includes(productId)) return prev;
        const next = [productId, ...prev];
        storeService.saveWishlist(next, userId);
        return next;
      });
      if (product) {
        addToast('Saved for later', `${product.name} moved to saved items`, 'info');
      }
    },
    [addToast, getProductById, removeFromCart, userId]
  );

  const clearCart = useCallback(() => {
    setCart([]);
    storeService.saveCart([], userId);
  }, [userId]);

  const toggleWishlist = useCallback(
    (productId: string) => {
      const product = getProductById(productId);
      setWishlist((prev) => {
        const exists = prev.includes(productId);
        const next = exists ? prev.filter((id) => id !== productId) : [productId, ...prev];
        storeService.saveWishlist(next, userId);
        if (product) {
          addToast(
            exists ? 'Removed from wishlist' : 'Saved to wishlist',
            product.name,
            exists ? 'info' : 'success'
          );
        }
        return next;
      });
    },
    [addToast, getProductById, userId]
  );

  const isWishlisted = useCallback(
    (productId: string) => wishlist.includes(productId),
    [wishlist]
  );

  const loginWithCredentials = useCallback(
    (
      email: string,
      password: string
    ): { ok: boolean; user?: CustomerUser; error?: string } => {
      const normalized = email.trim().toLowerCase();
      const users = storeService.getRegisteredUsers();
      const matched = users.find((u) => u.email.toLowerCase() === normalized);
      if (!matched) {
        return { ok: false, error: 'No account found with that email address.' };
      }
      if (matched.password && matched.password !== password) {
        return { ok: false, error: 'Incorrect password. Please try again.' };
      }
      const { password: _pwd, ...cleanUser } = matched;
      mergeGuestCartIntoUser(cleanUser.id);
      storeService.setCurrentUser(cleanUser);
      setUser(cleanUser);
      addToast(
        `Welcome back, ${cleanUser.fullName.split(' ')[0]}`,
        cleanUser.role === 'owner' ? 'Studio Admin Workspace' : undefined,
        'success'
      );
      return { ok: true, user: cleanUser };
    },
    [addToast, mergeGuestCartIntoUser]
  );

  const loginWithGoogle = useCallback(
    async (redirectPath = '/account'): Promise<{ ok: boolean; error?: string }> => {
      const res = await startSupabaseGoogleSignIn(redirectPath);
      if (!res.ok) {
        addToast('Google Sign-In unavailable', res.error || 'Please configure Supabase Google Auth.', 'info');
      }
      return res;
    },
    [addToast]
  );

  const loginAsDemoCustomer = useCallback(() => {
    mergeGuestCartIntoUser(DEMO_CUSTOMER.id);
    storeService.setCurrentUser(DEMO_CUSTOMER);
    setUser(DEMO_CUSTOMER);
    addToast('Signed in as Ananya Deshmukh', 'Demo customer account active', 'success');
  }, [addToast, mergeGuestCartIntoUser]);

  const loginAsDemoOwner = useCallback(() => {
    storeService.setCurrentUser(DEMO_OWNER);
    setUser(DEMO_OWNER);
    addToast('Signed in as Studio Owner', 'Admin Dashboard access granted', 'success');
  }, [addToast]);

  const registerCustomer = useCallback(
    (data: {
      fullName: string;
      email: string;
      phone: string;
      password: string;
    }): { ok: boolean; error?: string } => {
      const users = storeService.getRegisteredUsers();
      if (users.some((u) => u.email.toLowerCase() === data.email.trim().toLowerCase())) {
        return { ok: false, error: 'An account with this email already exists.' };
      }
      const normalizedEmail = data.email.trim().toLowerCase();
      const newUser: CustomerUser = {
        id: `cust-${Date.now()}`,
        fullName: data.fullName.trim(),
        email: normalizedEmail,
        phone: data.phone.trim(),
        joinedAt: new Date().toISOString().split('T')[0],
        role: isAdminEmail(normalizedEmail) ? 'owner' : 'customer',
      };
      mergeGuestCartIntoUser(newUser.id);
      storeService.registerUser(newUser, data.password);
      setUser(newUser);
      addToast(
        'Welcome to varniks_atelier',
        newUser.role === 'owner'
          ? 'Your Studio Admin account is ready.'
          : 'Your customer studio account is ready.',
        'success'
      );
      return { ok: true };
    },
    [addToast, mergeGuestCartIntoUser]
  );

  const updateProfile = useCallback(
    (data: { fullName: string; email: string; phone: string }) => {
      if (!user) return;
      const updated: CustomerUser = {
        ...user,
        fullName: data.fullName.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
      };
      storeService.updateUserProfile(updated);
      setUser(updated);
      addToast('Profile updated', 'Your contact details have been saved.', 'success');
    },
    [addToast, user]
  );

  const logout = useCallback(() => {
    void signOutBrowserSupabase();
    storeService.setCurrentUser(null);
    setUser(null);
    setAdminPinUnlocked(false);
    setAdminUnlockToken(null);
    addToast('Signed out', 'See you again soon at the studio.', 'info');
  }, [addToast]);

  // Dynamic Categories Management
  const addCategory = useCallback(
    (input: { label: string; subtitle?: string }) => {
      const created = storeService.addCategory(input);
      setCategories(storeService.getCategories());
      void fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(created),
      }).catch(() => {});
      addToast('Category added', created.label, 'success');
      return created;
    },
    [addToast]
  );

  const deleteCategory = useCallback(
    (idOrSlug: string) => {
      const cat = categories.find((c) => c.id === idOrSlug || c.slug === idOrSlug);
      storeService.deleteCategory(idOrSlug);
      setCategories(storeService.getCategories());
      void fetch(`/api/categories/${encodeURIComponent(idOrSlug)}`, {
        method: 'DELETE',
      }).catch(() => {});
      addToast('Category removed', cat?.label ?? idOrSlug, 'info');
    },
    [addToast, categories]
  );

  // Admin Product Management
  const addProduct = useCallback(
    async (
      data: Omit<Product, 'id' | 'createdAt'>
    ): Promise<{ ok: boolean; product: Product; synced?: boolean; error?: string }> => {
      const created = storeService.addProduct(data);
      setProducts(storeService.getProducts());

      try {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(created),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || json.error) {
          const msg = getErrorMessage(json.error, 'Run Supabase SQL tables to sync remotely.');
          addToast('Product saved locally', msg, 'info');
          return { ok: true, product: created, synced: false, error: msg };
        }
        if (json.synced && json.product) {
          storeService.updateProduct(json.product);
          setProducts(storeService.getProducts());
          addToast('Product added & synced to Supabase', json.product.name, 'success');
          return { ok: true, product: json.product, synced: true };
        }
      } catch {
        // Offline / local fallback
      }

      addToast('Product added successfully', created.name, 'success');
      return { ok: true, product: created, synced: false };
    },
    [addToast]
  );

  const updateProduct = useCallback(
    async (product: Product): Promise<{ ok: boolean; synced?: boolean; error?: string }> => {
      storeService.updateProduct(product);
      setProducts(storeService.getProducts());

      try {
        const res = await fetch(`/api/products/${encodeURIComponent(product.id)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(product),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || json.error) {
          const msg = getErrorMessage(json.error, `HTTP ${res.status}`);
          addToast('Updated locally — Supabase sync issue', msg, 'error');
          return { ok: true, synced: false, error: msg };
        }
        if (json.synced && json.product) {
          storeService.updateProduct(json.product);
          setProducts(storeService.getProducts());
          addToast('Product updated in Supabase', json.product.name, 'success');
          return { ok: true, synced: true };
        }
      } catch {
        // Offline / local fallback
      }

      addToast('Product updated', product.name, 'success');
      return { ok: true, synced: false };
    },
    [addToast]
  );

  const deleteProduct = useCallback(
    async (id: string): Promise<{ ok: boolean; synced?: boolean; error?: string }> => {
      const p = products.find((x) => x.id === id);
      storeService.deleteProduct(id);
      setProducts(storeService.getProducts());

      try {
        const res = await fetch(`/api/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || json.error) {
          const msg = getErrorMessage(json.error, `HTTP ${res.status}`);
          addToast('Removed locally — Supabase sync notice', msg, 'error');
          return { ok: true, synced: false, error: msg };
        }
        addToast('Product removed', p?.name ?? id, 'info');
        return { ok: true, synced: Boolean(json.synced) };
      } catch {
        addToast('Product removed', p?.name ?? id, 'info');
        return { ok: true, synced: false };
      }
    },
    [addToast, products]
  );

  const duplicateProduct = useCallback(
    async (id: string): Promise<Product | null> => {
      const dup = storeService.duplicateProduct(id);
      if (dup) {
        setProducts(storeService.getProducts());
        try {
          const res = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dup),
          });
          const json = await res.json().catch(() => ({}));
          if (json.synced && json.product) {
            storeService.updateProduct(json.product);
            setProducts(storeService.getProducts());
          }
        } catch {
          // ignore
        }
        addToast('Product duplicated', dup.name, 'success');
      }
      return dup;
    },
    [addToast]
  );

  const updateOrderStatus = useCallback(
    (orderId: string, status: OrderStatus, trackingCode?: string) => {
      storeService.updateOrderStatus(orderId, status, trackingCode);
      setAllOrders(storeService.getAllOrders());
      void fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: status, trackingCode }),
      }).catch(() => {});
      addToast('Order status updated', `Order #${orderId} set to ${status}`, 'success');
    },
    [addToast]
  );

  // Custom Orders Workflow (Waiting List -> Admin Approval -> Customer Approval -> Continuous Order Created)
  const createCustomOrderRequest = useCallback(
    (
      req: Omit<
        CommissionRequest,
        'id' | 'submittedAt' | 'status' | 'adminApproved' | 'customerApproved' | 'orderCreated'
      >
    ) => {
      const created: CommissionRequest = {
        ...req,
        id: `CUST-${Math.floor(1000 + Math.random() * 8999)}`,
        customerId: req.customerId ?? userId ?? 'guest',
        status: 'Waiting List',
        adminApproved: false,
        customerApproved: false,
        orderCreated: false,
        submittedAt: new Date().toISOString(),
      };
      storeService.saveCommissionRequest(created);
      setCommissions(storeService.getCommissions());
      void fetch('/api/commissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(created),
      }).catch(() => {});
      addToast('Added to Custom Order Waiting List', `Request ${created.id} submitted`, 'success');
      return created;
    },
    [addToast, userId]
  );

  const updateCommissionStatus = useCallback(
    (
      id: string,
      status: CommissionRequest['status'],
      quotedPrice?: number,
      internalNotes?: string
    ) => {
      storeService.updateCommissionStatus(id, status, quotedPrice, internalNotes);
      setCommissions(storeService.getCommissions());
      const updated = storeService.getCommissions().find((c) => c.id === id);
      if (updated) {
        void fetch(`/api/commissions/${encodeURIComponent(id)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated),
        }).catch(() => {});
      }
      addToast('Custom order updated', `Request ${id}: ${status}`, 'success');
    },
    [addToast]
  );

  const approveCustomOrderByAdmin = useCallback(
    (id: string, quotedPrice?: number, internalNotes?: string) => {
      const existing = commissions.find((c) => c.id === id);
      if (!existing) return;
      const finalQuote = quotedPrice ?? existing.quotedPrice ?? existing.predictedPrice ?? 1499;
      const updated: CommissionRequest = {
        ...existing,
        adminApproved: true,
        status: 'Admin Approved',
        quotedPrice: finalQuote,
        internalNotes: internalNotes ?? existing.internalNotes,
      };
      storeService.updateCommission(updated);
      setCommissions(storeService.getCommissions());
      void fetch(`/api/commissions/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      }).catch(() => {});
      addToast('Custom order approved by Admin', `${id} ready for customer confirmation`, 'success');
    },
    [addToast, commissions]
  );

  const buildOrderFromCustomRequest = useCallback(
    (
      req: CommissionRequest,
      checkoutInput?: {
        shippingAddress: Omit<Address, 'id' | 'isDefault'>;
        customerEmail: string;
        customerName?: string;
        paymentMethod: PaymentMethod;
        paymentReference?: string;
        shippingFeeOverride?: number;
      },
      initialOrderStatus: OrderStatus = 'Pending'
    ): Order | null => {
      const addr = checkoutInput?.shippingAddress;
      const email = (checkoutInput?.customerEmail || req.email || '').trim();
      const name = (checkoutInput?.customerName || addr?.fullName || req.customerName || '').trim();
      const resolvedCustomerId =
        userId || (req.customerId && req.customerId !== 'guest' ? req.customerId : '');
      if (
        !resolvedCustomerId ||
        !addr ||
        !addr.fullName.trim() ||
        !addr.phone.trim() ||
        !addr.addressLine.trim() ||
        !addr.city.trim() ||
        !addr.state.trim() ||
        !addr.postalCode.trim() ||
        !email
      ) {
        return null;
      }

      const num = Math.floor(2100 + Math.random() * 7800);
      const price = req.quotedPrice ?? req.predictedPrice ?? 1499;
      const computedLoc = calculateLocationShipping({
        country: addr.country,
        state: addr.state,
        city: addr.city,
        postalCode: addr.postalCode,
        subtotal: price,
        zones: storeSettings.shippingZones,
        originState: storeSettings.studioOriginState,
        freeShippingThreshold: storeSettings.freeShippingThreshold,
        coupons,
      });
      const fee =
        typeof checkoutInput?.shippingFeeOverride === 'number'
          ? Math.max(0, checkoutInput.shippingFeeOverride)
          : computedLoc.finalFee;
      const estDate = new Date();
      estDate.setDate(estDate.getDate() + 8);
      const estimatedDelivery = new Intl.DateTimeFormat('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(estDate);

      return {
        id: `ord-custom-${Date.now()}`,
        orderNumber: `VA-CUST-${num}`,
        customerId: resolvedCustomerId,
        customerName: name,
        customerEmail: email,
        date: new Date().toISOString().split('T')[0],
        items: [
          {
            productId: req.id,
            name: `Custom: ${req.customIdea || req.categoryLabel}`,
            slug: 'custom-orders',
            image: req.referenceImageData || STUDIO_MEDIA.artPortraitKeepsake,
            price,
            quantity: 1,
          },
        ],
        subtotal: price,
        shippingFee: fee,
        discount: 0,
        total: price + fee,
        paymentMethod: checkoutInput?.paymentMethod ?? 'razorpay',
        paymentStatus: 'Paid',
        orderStatus: initialOrderStatus,
        shippingAddress: {
          fullName: addr.fullName.trim(),
          phone: addr.phone.trim(),
          addressLine: addr.addressLine.trim(),
          city: addr.city.trim(),
          state: addr.state.trim(),
          postalCode: addr.postalCode.trim(),
          country: addr.country.trim() || 'India',
        },
        trackingCode: `VA-CUST-${num}`,
        courierName: 'Blue Dart Express',
        estimatedDelivery,
        isCustomOrder: true,
        customRequestId: req.id,
        paymentReference: checkoutInput?.paymentReference ?? `PAY-${num}`,
      };
    },
    [
      coupons,
      storeSettings.freeShippingThreshold,
      storeSettings.shippingZones,
      storeSettings.studioOriginState,
      userId,
    ]
  );

  const approveCustomOrderByCustomerAndCreateOrder = useCallback(
    (
      id: string,
      checkoutInput?: {
        shippingAddress: Omit<Address, 'id' | 'isDefault'>;
        customerEmail: string;
        customerName?: string;
        paymentMethod: PaymentMethod;
        paymentReference?: string;
        shippingFeeOverride?: number;
      }
    ): Order | null => {
      if (!user) {
        addToast(
          'Sign in required',
          'Please sign in to confirm your custom order and track delivery.',
          'error'
        );
        return null;
      }
      const existing = commissions.find((c) => c.id === id);
      if (!existing) return null;
      if (existing.orderCreated && existing.linkedOrderId) {
        return allOrders.find((o) => o.id === existing.linkedOrderId) ?? null;
      }

      const newOrder = buildOrderFromCustomRequest(existing, checkoutInput, 'Pending');
      if (!newOrder) {
        addToast(
          'Complete shipping & payment details required',
          'Please fill out your full delivery address, email, phone, and payment method.',
          'error'
        );
        return null;
      }

      storeService.saveUserOrder(newOrder);
      setAllOrders(storeService.getAllOrders());

      const updatedReq: CommissionRequest = {
        ...existing,
        customerId: user.id,
        customerApproved: true,
        orderCreated: true,
        linkedOrderId: newOrder.id,
        status: 'Order Created',
      };
      storeService.updateCommission(updatedReq);
      setCommissions(storeService.getCommissions());

      void fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      }).catch(() => {});
      void fetch(`/api/commissions/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedReq),
      }).catch(() => {});

      addToast('Custom Order Placed (Awaiting Studio Confirmation)', `Order ${newOrder.orderNumber}`, 'success');
      return newOrder;
    },
    [addToast, allOrders, buildOrderFromCustomRequest, commissions, user]
  );

  const createContinuousOrderFromCustomRequest = useCallback(
    (
      id: string,
      checkoutInput?: {
        shippingAddress: Omit<Address, 'id' | 'isDefault'>;
        customerEmail: string;
        customerName?: string;
        paymentMethod: PaymentMethod;
        paymentReference?: string;
      }
    ): Order | null => {
      const existing = commissions.find((c) => c.id === id);
      if (!existing) return null;
      if (existing.orderCreated && existing.linkedOrderId) {
        return allOrders.find((o) => o.id === existing.linkedOrderId) ?? null;
      }

      const newOrder = buildOrderFromCustomRequest(existing, checkoutInput, 'Confirmed');
      if (!newOrder) {
        addToast(
          'Customer delivery address required',
          'Enter complete shipping address, phone, email & payment method before placing the order.',
          'error'
        );
        return null;
      }

      storeService.saveUserOrder(newOrder);
      setAllOrders(storeService.getAllOrders());

      const updatedReq: CommissionRequest = {
        ...existing,
        adminApproved: true,
        customerApproved: true,
        orderCreated: true,
        linkedOrderId: newOrder.id,
        status: 'Order Created',
      };
      storeService.updateCommission(updatedReq);
      setCommissions(storeService.getCommissions());

      void fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      }).catch(() => {});
      void fetch(`/api/commissions/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedReq),
      }).catch(() => {});

      addToast('Continuous Order Placed', `Created ${newOrder.orderNumber}`, 'success');
      return newOrder;
    },
    [addToast, allOrders, buildOrderFromCustomRequest, commissions]
  );

  const saveCoupons = useCallback(
    (newCoupons: Coupon[]) => {
      storeService.saveCoupons(newCoupons);
      setCoupons(newCoupons);
      void fetch('/api/coupons', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coupons: newCoupons }),
      }).catch(() => {});
      addToast('Coupons saved', undefined, 'success');
    },
    [addToast]
  );

  const saveStoreSettings = useCallback(
    async (
      settings: StoreSettings & { openrouterApiKey?: string; razorpayKeySecret?: string }
    ): Promise<void> => {
      const { openrouterApiKey, razorpayKeySecret, ...safeClientSettings } = settings;
      storeService.saveStoreSettings(safeClientSettings);
      setStoreSettings(safeClientSettings);

      try {
        const res = await fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settings),
        });
        const json = await res.json().catch(() => ({}));
        if (res.ok) {
          const merged: StoreSettings = {
            ...safeClientSettings,
            hasOpenrouterKey:
              json.hasOpenrouterKey !== undefined
                ? Boolean(json.hasOpenrouterKey)
                : safeClientSettings.hasOpenrouterKey,
            openrouterKeyMasked:
              json.openrouterKeyMasked !== undefined
                ? json.openrouterKeyMasked
                : safeClientSettings.openrouterKeyMasked,
            logoUrl: json.logoUrl !== undefined ? json.logoUrl : safeClientSettings.logoUrl,
            razorpayKeyId:
              json.razorpayKeyId !== undefined ? json.razorpayKeyId : safeClientSettings.razorpayKeyId,
            hasRazorpayKey:
              json.hasRazorpayKey !== undefined
                ? Boolean(json.hasRazorpayKey)
                : safeClientSettings.hasRazorpayKey,
            razorpaySecretMasked:
              json.razorpaySecretMasked !== undefined
                ? json.razorpaySecretMasked
                : safeClientSettings.razorpaySecretMasked,
            razorpayMode:
              json.razorpayMode !== undefined ? json.razorpayMode : safeClientSettings.razorpayMode,
            studioOriginState:
              json.studioOriginState !== undefined
                ? json.studioOriginState
                : safeClientSettings.studioOriginState,
            shippingZones:
              json.shippingZones !== undefined ? json.shippingZones : safeClientSettings.shippingZones,
            gaMeasurementId:
              json.gaMeasurementId !== undefined
                ? json.gaMeasurementId
                : safeClientSettings.gaMeasurementId,
            googleSiteVerification:
              json.googleSiteVerification !== undefined
                ? json.googleSiteVerification
                : safeClientSettings.googleSiteVerification,
          };
          storeService.saveStoreSettings(merged);
          setStoreSettings(merged);
          if (
            (openrouterApiKey && openrouterApiKey !== '__CLEAR__') ||
            (razorpayKeySecret && razorpayKeySecret !== '__CLEAR__')
          ) {
            addToast('Studio settings & live API credentials saved securely', undefined, 'success');
            return;
          }
        } else if (json?.error) {
          addToast(
            'Settings saved locally — sync notice',
            getErrorMessage(json.error, 'Remote settings sync failed'),
            'info'
          );
          return;
        }
      } catch {
        // Offline / local fallback
      }
      addToast('Store settings saved', undefined, 'success');
    },
    [addToast]
  );

  const addAddress = useCallback(
    (addr: Omit<Address, 'id'>) => {
      const id = `addr-${Date.now()}`;
      setAddresses((prev) => {
        const shouldBeDefault = addr.isDefault || prev.length === 0;
        const base = shouldBeDefault ? prev.map((a) => ({ ...a, isDefault: false })) : prev;
        const next = [{ ...addr, id, isDefault: shouldBeDefault }, ...base];
        storeService.saveAddresses(next, userId);
        return next;
      });
      addToast('Address saved', addr.city, 'success');
    },
    [addToast, userId]
  );

  const updateAddress = useCallback(
    (addr: Address) => {
      setAddresses((prev) => {
        const next = prev.map((a) => {
          if (a.id === addr.id) return addr;
          return addr.isDefault ? { ...a, isDefault: false } : a;
        });
        storeService.saveAddresses(next, userId);
        return next;
      });
      addToast('Address updated', addr.city, 'success');
    },
    [addToast, userId]
  );

  const deleteAddress = useCallback(
    (id: string) => {
      setAddresses((prev) => {
        const filtered = prev.filter((a) => a.id !== id);
        if (filtered.length > 0 && !filtered.some((a) => a.isDefault)) {
          filtered[0] = { ...filtered[0], isDefault: true };
        }
        storeService.saveAddresses(filtered, userId);
        return filtered;
      });
      addToast('Address removed', undefined, 'info');
    },
    [addToast, userId]
  );

  const setDefaultAddress = useCallback(
    (id: string) => {
      setAddresses((prev) => {
        const next = prev.map((a) => ({ ...a, isDefault: a.id === id }));
        storeService.saveAddresses(next, userId);
        return next;
      });
      addToast('Default address updated', undefined, 'success');
    },
    [addToast, userId]
  );

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const cartSubtotal = useMemo(
    () =>
      cart.reduce((sum, item) => {
        const product = getProductById(item.productId);
        return sum + (product ? product.price * item.quantity : 0);
      }, 0),
    [cart, getProductById]
  );

  const shippingFee = useMemo(() => {
    if (cartSubtotal === 0) return 0;
    const defaultAddr = addresses.find((a) => a.isDefault) ?? addresses[0];
    const calc = calculateLocationShipping({
      country: defaultAddr?.country || 'India',
      state: defaultAddr?.state,
      city: defaultAddr?.city,
      postalCode: defaultAddr?.postalCode,
      subtotal: cartSubtotal,
      zones: storeSettings.shippingZones,
      originState: storeSettings.studioOriginState,
      freeShippingThreshold: storeSettings.freeShippingThreshold ?? FREE_SHIPPING_THRESHOLD,
      coupons,
    });
    return calc.finalFee;
  }, [
    addresses,
    cartSubtotal,
    coupons,
    storeSettings.freeShippingThreshold,
    storeSettings.shippingZones,
    storeSettings.studioOriginState,
  ]);

  const placeOrder = useCallback(
    ({
      shippingAddress,
      paymentMethod,
      customerEmail,
      customerName,
      paymentReference,
      discount = 0,
      shippingFeeOverride,
    }: {
      shippingAddress: Omit<Address, 'id' | 'isDefault'>;
      paymentMethod: PaymentMethod;
      customerEmail?: string;
      customerName?: string;
      paymentReference?: string;
      discount?: number;
      shippingFeeOverride?: number;
    }): Order | null => {
      if (!user || !userId) {
        addToast(
          'Sign in required',
          'Please log in before placing an order so you can track delivery.',
          'error'
        );
        return null;
      }

      const resolvedEmail = (customerEmail ?? user.email ?? '').trim();
      if (
        !resolvedEmail ||
        !shippingAddress.fullName?.trim() ||
        !shippingAddress.phone?.trim() ||
        !shippingAddress.addressLine?.trim() ||
        !shippingAddress.city?.trim() ||
        !shippingAddress.state?.trim() ||
        !shippingAddress.postalCode?.trim()
      ) {
        addToast(
          'Shipping address required',
          'Please complete all delivery address & contact fields before placing your order.',
          'error'
        );
        return null;
      }

      const orderItems = cart
        .map((item) => {
          const product = getProductById(item.productId);
          if (!product) return null;
          return {
            productId: product.id,
            name: product.name,
            slug: product.slug,
            image: product.images[0],
            price: product.price,
            quantity: item.quantity,
          };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null);

      if (orderItems.length === 0) {
        addToast('Your studio bag is empty', 'Add a creation before checking out.', 'error');
        return null;
      }

      const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const locCalc = calculateLocationShipping({
        country: shippingAddress.country,
        state: shippingAddress.state,
        city: shippingAddress.city,
        postalCode: shippingAddress.postalCode,
        subtotal,
        zones: storeSettings.shippingZones,
        originState: storeSettings.studioOriginState,
        freeShippingThreshold: storeSettings.freeShippingThreshold ?? FREE_SHIPPING_THRESHOLD,
        coupons,
      });
      const fee =
        typeof shippingFeeOverride === 'number'
          ? Math.max(0, shippingFeeOverride)
          : locCalc.finalFee ?? STANDARD_SHIPPING_FEE;
      const total = Math.max(0, subtotal + fee - discount);
      const num = Math.floor(1050 + Math.random() * 8900);

      const estDate = new Date();
      estDate.setDate(estDate.getDate() + 6);
      const estimatedDelivery = new Intl.DateTimeFormat('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(estDate);

      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        orderNumber: `VA-2026-${num}`,
        customerId: userId,
        customerName: (customerName ?? user.fullName ?? shippingAddress.fullName).trim(),
        customerEmail: resolvedEmail,
        date: new Date().toISOString().split('T')[0],
        items: orderItems,
        subtotal,
        shippingFee: fee,
        discount,
        total,
        paymentMethod,
        paymentStatus: 'Paid',
        orderStatus: 'Pending',
        shippingAddress: {
          fullName: shippingAddress.fullName.trim(),
          phone: shippingAddress.phone.trim(),
          addressLine: shippingAddress.addressLine.trim(),
          city: shippingAddress.city.trim(),
          state: shippingAddress.state.trim(),
          postalCode: shippingAddress.postalCode.trim(),
          country: (shippingAddress.country || 'India').trim(),
        },
        trackingCode: `VA-TRK-${num}`,
        courierName: 'Blue Dart Express',
        estimatedDelivery,
        paymentReference: paymentReference ?? `PAY-${num}`,
      };

      orderItems.forEach((item) => {
        recordCartHistory(item.productId, item.quantity, 'checked_out');
      });

      storeService.saveUserOrder(newOrder);
      setAllOrders(storeService.getAllOrders());
      void fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      }).catch(() => {});
      setLastPlacedOrder(newOrder);
      clearCart();
      return newOrder;
    },
    [addToast, cart, clearCart, getProductById, recordCartHistory, user, userId]
  );

  const addRecentSearch = useCallback((query: string) => {
    const clean = query.trim();
    if (!clean) return;
    setRecentSearches((prev) => {
      const next = [clean, ...prev.filter((q) => q.toLowerCase() !== clean.toLowerCase())].slice(
        0,
        6
      );
      storeService.saveRecentSearches(next);
      return next;
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    storeService.saveRecentSearches([]);
  }, []);

  const orders = useMemo(() => {
    if (!userId && !user?.email) return [];
    const emailLower = user?.email?.toLowerCase();
    return allOrders.filter(
      (o) =>
        (userId && o.customerId === userId) ||
        (emailLower && o.customerEmail?.toLowerCase() === emailLower)
    );
  }, [allOrders, user?.email, userId]);

  return (
    <StoreContext.Provider
      value={{
        user,
        isAdmin,
        adminPinUnlocked,
        unlockAdminPortal,
        lockAdminPortal,
        categories,
        products,
        cart,
        cartCount,
        cartSubtotal,
        shippingFee,
        wishlist,
        cartHistory,
        addresses,
        orders,
        allOrders,
        commissions,
        coupons,
        storeSettings,
        recentSearches,
        isCartDrawerOpen,
        isSearchOpen,
        toasts,
        lastPlacedOrder,
        supabaseStatus,
        refreshSupabaseSync,
        openCartDrawer: () => setIsCartDrawerOpen(true),
        closeCartDrawer: () => setIsCartDrawerOpen(false),
        openSearch: () => setIsSearchOpen(true),
        closeSearch: () => setIsSearchOpen(false),
        addToast,
        dismissToast,
        loginWithCredentials,
        loginWithGoogle,
        googleAuthAvailable,
        authSyncing,
        loginAsDemoCustomer,
        loginAsDemoOwner,
        registerCustomer,
        updateProfile,
        logout,
        addCategory,
        deleteCategory,
        addProduct,
        updateProduct,
        deleteProduct,
        duplicateProduct,
        updateOrderStatus,
        createCustomOrderRequest,
        updateCommissionStatus,
        approveCustomOrderByAdmin,
        approveCustomOrderByCustomerAndCreateOrder,
        createContinuousOrderFromCustomRequest,
        saveCoupons,
        saveStoreSettings,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        saveCartItemForLater,
        clearCart,
        toggleWishlist,
        isWishlisted,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        placeOrder,
        addRecentSearch,
        clearRecentSearches,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
