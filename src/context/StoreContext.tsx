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

interface StoreContextValue {
  user: CustomerUser | null;
  isAdmin: boolean;
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
    }
  ) => Order | null;

  saveCoupons: (coupons: Coupon[]) => void;
  saveStoreSettings: (settings: StoreSettings & { openrouterApiKey?: string }) => Promise<void>;

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
  }) => Order;

  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CustomerUser | null>(() => storeService.getCurrentUser());
  const userId = user?.id ?? null;
  const isAdmin = user?.role === 'owner';

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
  const [supabaseStatus, setSupabaseStatus] = useState<SupabaseSyncStatus>({
    configured: false,
    tablesReady: false,
    missingTables: [],
    checked: false,
  });

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
          error: statusJson.error || `API returned HTTP ${statusRes.status}`,
          diagnostics: statusJson.diagnostics,
          checked: true,
        });
        return;
      }
      setSupabaseStatus({
        configured: Boolean(statusJson.configured),
        tablesReady: Boolean(statusJson.tablesReady),
        missingTables: Array.isArray(statusJson.missingTables) ? statusJson.missingTables : [],
        error: typeof statusJson.error === 'string' ? statusJson.error : undefined,
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
        storeService.saveStoreSettings(boot.settings);
        setStoreSettings(boot.settings);
      }
    } catch (error) {
      setSupabaseStatus({
        configured: false,
        tablesReady: false,
        missingTables: [],
        error: error instanceof Error ? error.message : 'Could not reach the Supabase API',
        checked: true,
      });
    }
  }, []);

  useEffect(() => {
    void refreshSupabaseSync();
  }, [refreshSupabaseSync]);

  useEffect(() => {
    setCart(storeService.getCart(userId));
    setWishlist(storeService.getWishlist(userId));
    setCartHistory(storeService.getCartHistory(userId));
    setAddresses(storeService.getAddresses(userId));
    setAllOrders(storeService.getAllOrders());
    setCommissions(storeService.getCommissions());
  }, [userId]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (title: string, subtitle?: string, type: ToastMessage['type'] = 'success') => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev.slice(-2), { id, title, subtitle, type }]);
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
      const product = getProductById(productId);
      if (!product) return;
      if (quantity <= 0) {
        setCart((prev) => {
          const item = prev.find((i) => i.productId === productId);
          if (item) recordCartHistory(productId, item.quantity, 'removed');
          const next = prev.filter((i) => i.productId !== productId);
          storeService.saveCart(next, userId);
          return next;
        });
        return;
      }
      const clamped = Math.min(quantity, product.stock);
      setCart((prev) => {
        const next = prev.map((i) =>
          i.productId === productId ? { ...i, quantity: clamped } : i
        );
        storeService.saveCart(next, userId);
        return next;
      });
    },
    [getProductById, recordCartHistory, userId]
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
      storeService.setCurrentUser(cleanUser);
      setUser(cleanUser);
      addToast(
        `Welcome back, ${cleanUser.fullName.split(' ')[0]}`,
        cleanUser.role === 'owner' ? 'Studio Admin Workspace' : undefined,
        'success'
      );
      return { ok: true, user: cleanUser };
    },
    [addToast]
  );

  const loginAsDemoCustomer = useCallback(() => {
    storeService.setCurrentUser(DEMO_CUSTOMER);
    setUser(DEMO_CUSTOMER);
    addToast('Signed in as Ananya Deshmukh', 'Demo customer account active', 'success');
  }, [addToast]);

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
      const newUser: CustomerUser = {
        id: `cust-${Date.now()}`,
        fullName: data.fullName.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        joinedAt: new Date().toISOString().split('T')[0],
        role: 'customer',
      };
      storeService.registerUser(newUser, data.password);
      setUser(newUser);
      addToast('Welcome to varniks_atelier', 'Your customer studio account is ready.', 'success');
      return { ok: true };
    },
    [addToast]
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
    storeService.setCurrentUser(null);
    setUser(null);
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
          addToast(
            'Product saved locally',
            json.error || 'Run Supabase SQL tables to sync remotely.',
            'info'
          );
          return { ok: true, product: created, synced: false, error: json.error };
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
          addToast(
            'Updated locally — Supabase sync issue',
            json.error || `HTTP ${res.status}`,
            'error'
          );
          return { ok: true, synced: false, error: json.error || `HTTP ${res.status}` };
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
          addToast(
            'Removed locally — Supabase sync notice',
            json.error || `HTTP ${res.status}`,
            'error'
          );
          return { ok: true, synced: false, error: json.error || `HTTP ${res.status}` };
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
      }
    ): Order | null => {
      const addr = checkoutInput?.shippingAddress;
      const email = (checkoutInput?.customerEmail || req.email || '').trim();
      const name = (checkoutInput?.customerName || addr?.fullName || req.customerName || '').trim();
      if (
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
      const fee = price >= storeSettings.freeShippingThreshold ? 0 : storeSettings.defaultShippingFee;
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
        customerId: req.customerId ?? userId ?? 'guest',
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
        orderStatus: 'Confirmed',
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
    [storeSettings.defaultShippingFee, storeSettings.freeShippingThreshold, userId]
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
      }
    ): Order | null => {
      const existing = commissions.find((c) => c.id === id);
      if (!existing) return null;
      if (existing.orderCreated && existing.linkedOrderId) {
        return allOrders.find((o) => o.id === existing.linkedOrderId) ?? null;
      }

      const newOrder = buildOrderFromCustomRequest(existing, checkoutInput);
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

      addToast('Custom Order Confirmed & Created', `Continuous Order ${newOrder.orderNumber}`, 'success');
      return newOrder;
    },
    [addToast, allOrders, buildOrderFromCustomRequest, commissions]
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

      const newOrder = buildOrderFromCustomRequest(existing, checkoutInput);
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
    async (settings: StoreSettings & { openrouterApiKey?: string }): Promise<void> => {
      const { openrouterApiKey, ...safeClientSettings } = settings;
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
          };
          storeService.saveStoreSettings(merged);
          setStoreSettings(merged);
          if (openrouterApiKey && openrouterApiKey !== '__CLEAR__') {
            addToast('Studio settings & OpenRouter key saved', undefined, 'success');
            return;
          }
        } else if (json?.error) {
          addToast('Settings saved locally — sync notice', json.error, 'info');
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
    return cartSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
  }, [cartSubtotal]);

  const placeOrder = useCallback(
    ({
      shippingAddress,
      paymentMethod,
      customerEmail,
      customerName,
      paymentReference,
      discount = 0,
    }: {
      shippingAddress: Omit<Address, 'id' | 'isDefault'>;
      paymentMethod: PaymentMethod;
      customerEmail?: string;
      customerName?: string;
      paymentReference?: string;
      discount?: number;
    }): Order => {
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

      const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const fee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
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
        customerId: userId ?? 'guest',
        customerName: customerName ?? user?.fullName ?? shippingAddress.fullName,
        customerEmail: customerEmail ?? user?.email ?? 'customer@example.com',
        date: new Date().toISOString().split('T')[0],
        items: orderItems,
        subtotal,
        shippingFee: fee,
        discount,
        total,
        paymentMethod,
        paymentStatus: 'Paid',
        orderStatus: 'Pending',
        shippingAddress,
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
    [cart, clearCart, getProductById, recordCartHistory, user, userId]
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
