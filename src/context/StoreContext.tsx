import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type {
  Address,
  CartHistoryAction,
  CartHistoryEntry,
  CartItem,
  CustomerUser,
  Order,
  PaymentMethod,
  ToastMessage,
} from '../types';
import { getProductById } from '../data/products';
import { DEMO_CUSTOMER } from '../data/mockAccount';
import { storeService } from '../services/storeService';
import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_FEE } from '../utils/format';

interface StoreContextValue {
  user: CustomerUser | null;
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  shippingFee: number;
  wishlist: string[];
  cartHistory: CartHistoryEntry[];
  addresses: Address[];
  orders: Order[];
  recentSearches: string[];
  isCartDrawerOpen: boolean;
  isSearchOpen: boolean;
  toasts: ToastMessage[];
  lastPlacedOrder: Order | null;

  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  addToast: (title: string, subtitle?: string, type?: ToastMessage['type']) => void;
  dismissToast: (id: string) => void;

  loginWithCredentials: (email: string, password: string) => { ok: boolean; error?: string };
  loginAsDemoCustomer: () => void;
  registerCustomer: (data: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
  }) => { ok: boolean; error?: string };
  updateProfile: (data: { fullName: string; email: string; phone: string }) => void;
  logout: () => void;

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
    discount?: number;
  }) => Order;

  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CustomerUser | null>(() => storeService.getCurrentUser());
  const userId = user?.id ?? null;

  const [cart, setCart] = useState<CartItem[]>(() => storeService.getCart(userId));
  const [wishlist, setWishlist] = useState<string[]>(() => storeService.getWishlist(userId));
  const [cartHistory, setCartHistory] = useState<CartHistoryEntry[]>(() =>
    storeService.getCartHistory(userId)
  );
  const [addresses, setAddresses] = useState<Address[]>(() => storeService.getAddresses(userId));
  const [orders, setOrders] = useState<Order[]>(() => storeService.getOrders(userId));
  const [recentSearches, setRecentSearches] = useState<string[]>(() =>
    storeService.getRecentSearches()
  );

  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);

  // Reload account-isolated state whenever active customer changes
  useEffect(() => {
    setCart(storeService.getCart(userId));
    setWishlist(storeService.getWishlist(userId));
    setCartHistory(storeService.getCartHistory(userId));
    setAddresses(storeService.getAddresses(userId));
    setOrders(storeService.getOrders(userId));
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
    [userId]
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
    [addToast, userId]
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
      if (quantity > product.stock) {
        addToast(`Maximum ${product.stock} available`, product.name, 'info');
      }
      setCart((prev) => {
        const next = prev.map((i) =>
          i.productId === productId ? { ...i, quantity: clamped } : i
        );
        storeService.saveCart(next, userId);
        return next;
      });
    },
    [addToast, recordCartHistory, userId]
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
    [addToast, recordCartHistory, userId]
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
    [addToast, removeFromCart, userId]
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
    [addToast, userId]
  );

  const isWishlisted = useCallback(
    (productId: string) => wishlist.includes(productId),
    [wishlist]
  );

  const loginWithCredentials = useCallback(
    (email: string, password: string): { ok: boolean; error?: string } => {
      const normalized = email.trim().toLowerCase();
      const users = storeService.getRegisteredUsers();
      const matched = users.find((u) => u.email.toLowerCase() === normalized);
      if (!matched) {
        return { ok: false, error: 'No account found with that email address.' };
      }
      if (matched.password !== password) {
        return { ok: false, error: 'Incorrect password. Please try again.' };
      }
      const { password: _pwd, ...cleanUser } = matched;
      storeService.setCurrentUser(cleanUser);
      setUser(cleanUser);
      addToast(`Welcome back, ${cleanUser.fullName.split(' ')[0]}`, undefined, 'success');
      return { ok: true };
    },
    [addToast]
  );

  const loginAsDemoCustomer = useCallback(() => {
    storeService.setCurrentUser(DEMO_CUSTOMER);
    setUser(DEMO_CUSTOMER);
    addToast('Signed in as Ananya Deshmukh', 'Demo customer account active', 'success');
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
    [cart]
  );

  const shippingFee = useMemo(() => {
    if (cartSubtotal === 0) return 0;
    return cartSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
  }, [cartSubtotal]);

  const placeOrder = useCallback(
    ({
      shippingAddress,
      paymentMethod,
      discount = 0,
    }: {
      shippingAddress: Omit<Address, 'id' | 'isDefault'>;
      paymentMethod: PaymentMethod;
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
        estimatedDelivery,
      };

      // Move checked-out items into Cart History
      orderItems.forEach((item) => {
        recordCartHistory(item.productId, item.quantity, 'checked_out');
      });

      setOrders((prev) => {
        const next = [newOrder, ...prev];
        storeService.saveOrders(next, userId);
        return next;
      });
      setLastPlacedOrder(newOrder);
      clearCart();
      return newOrder;
    },
    [cart, clearCart, recordCartHistory, userId]
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

  return (
    <StoreContext.Provider
      value={{
        user,
        cart,
        cartCount,
        cartSubtotal,
        shippingFee,
        wishlist,
        cartHistory,
        addresses,
        orders,
        recentSearches,
        isCartDrawerOpen,
        isSearchOpen,
        toasts,
        lastPlacedOrder,
        openCartDrawer: () => setIsCartDrawerOpen(true),
        closeCartDrawer: () => setIsCartDrawerOpen(false),
        openSearch: () => setIsSearchOpen(true),
        closeSearch: () => setIsSearchOpen(false),
        addToast,
        dismissToast,
        loginWithCredentials,
        loginAsDemoCustomer,
        registerCustomer,
        updateProfile,
        logout,
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
