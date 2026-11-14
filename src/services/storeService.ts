import type {
  Address,
  CartHistoryEntry,
  CartItem,
  CommissionRequest,
  Coupon,
  CustomerUser,
  Order,
  OrderStatus,
  Product,
  StoreSettings,
} from '../types';
import { PRODUCTS } from '../data/products';
import { DEMO_CUSTOMER, INITIAL_ADDRESSES, INITIAL_CART_HISTORY, INITIAL_ORDERS } from '../data/mockAccount';
export { DEMO_CUSTOMER };

const KEY_PREFIX = 'varniks_atelier_v2';

export const DEMO_OWNER: CustomerUser = {
  id: 'owner-varniks-01',
  fullName: 'Varnika Studio Owner',
  email: 'owner@varniksatelier.studio',
  phone: '+91 98204 99999',
  joinedAt: '2025-01-01',
  role: 'owner',
};

const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'coup-1',
    code: 'STUDIO10',
    discountType: 'percentage',
    discountValue: 10,
    minimumOrder: 999,
    isActive: true,
  },
  {
    id: 'coup-2',
    code: 'ARTLOVER15',
    discountType: 'percentage',
    discountValue: 15,
    minimumOrder: 2500,
    isActive: true,
  },
];

const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'varniks_atelier',
  contactEmail: 'hello@varniksatelier.studio',
  contactPhone: '+91 98204 51120',
  currency: 'INR',
  freeShippingThreshold: 999,
  defaultShippingFee: 95,
  announcementText: 'Free shipping on orders above ₹999 • Every piece is packed with love ♡',
};

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors in sandboxed iframes
  }
}

export const storeService = {
  getCurrentUser(): CustomerUser | null {
    return readJson<CustomerUser | null>(`${KEY_PREFIX}:current_user`, null);
  },

  setCurrentUser(user: CustomerUser | null): void {
    writeJson(`${KEY_PREFIX}:current_user`, user);
  },

  getRegisteredUsers(): Array<CustomerUser & { password?: string }> {
    return readJson<Array<CustomerUser & { password?: string }>>(`${KEY_PREFIX}:users`, [
      { ...DEMO_CUSTOMER, password: 'studio123' },
      { ...DEMO_OWNER, password: 'owner123' },
    ]);
  },

  registerUser(user: CustomerUser, password: string): void {
    const existing = this.getRegisteredUsers();
    const updated = [...existing.filter((u) => u.email !== user.email), { ...user, password }];
    writeJson(`${KEY_PREFIX}:users`, updated);
    this.setCurrentUser(user);
  },

  updateUserProfile(user: CustomerUser): void {
    this.setCurrentUser(user);
    const existing = this.getRegisteredUsers();
    const updated = existing.map((u) => (u.id === user.id ? { ...u, ...user } : u));
    writeJson(`${KEY_PREFIX}:users`, updated);
  },

  // Products CRUD (Admin + Storefront)
  getProducts(): Product[] {
    return readJson<Product[]>(`${KEY_PREFIX}:products`, PRODUCTS);
  },

  saveProducts(products: Product[]): void {
    writeJson(`${KEY_PREFIX}:products`, products);
  },

  addProduct(productData: Omit<Product, 'id' | 'createdAt'>): Product {
    const products = this.getProducts();
    const newProduct: Product = {
      ...productData,
      id: `va-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      isPublished: productData.isPublished ?? true,
    };
    const next = [newProduct, ...products];
    this.saveProducts(next);
    return newProduct;
  },

  updateProduct(updated: Product): void {
    const products = this.getProducts();
    const next = products.map((p) => (p.id === updated.id ? updated : p));
    this.saveProducts(next);
  },

  deleteProduct(id: string): void {
    const products = this.getProducts();
    const next = products.filter((p) => p.id !== id);
    this.saveProducts(next);
  },

  duplicateProduct(id: string): Product | null {
    const products = this.getProducts();
    const target = products.find((p) => p.id === id);
    if (!target) return null;
    const duplicated: Product = {
      ...target,
      id: `va-${Date.now()}`,
      name: `${target.name} (Copy)`,
      slug: `${target.slug}-copy-${Date.now().toString().slice(-4)}`,
      sku: target.sku ? `${target.sku}-COPY` : undefined,
      createdAt: new Date().toISOString().split('T')[0],
    };
    const next = [duplicated, ...products];
    this.saveProducts(next);
    return duplicated;
  },

  // Orders Management
  getAllOrders(): Order[] {
    return readJson<Order[]>(`${KEY_PREFIX}:all_orders`, INITIAL_ORDERS);
  },

  saveAllOrders(orders: Order[]): void {
    writeJson(`${KEY_PREFIX}:all_orders`, orders);
  },

  updateOrderStatus(orderId: string, orderStatus: OrderStatus, trackingCode?: string): void {
    const orders = this.getAllOrders();
    const next = orders.map((o) =>
      o.id === orderId ? { ...o, orderStatus, trackingCode: trackingCode ?? o.trackingCode } : o
    );
    this.saveAllOrders(next);
  },

  // Commissions
  getCommissions(): CommissionRequest[] {
    return readJson<CommissionRequest[]>(`${KEY_PREFIX}:commissions`, [
      {
        id: 'COM-9821',
        customerName: 'Aarav Mehta',
        email: 'aarav@example.com',
        phone: '+91 98112 33445',
        artworkType: 'Charcoal Portrait',
        preferredStyle: 'Detailed Realism',
        approximateSize: '16 × 20 inches',
        budgetRange: '₹5,000 – ₹10,000',
        description: 'Family heirloom portrait study from old sepia photograph.',
        status: 'New',
        submittedAt: '2026-11-12T14:20:00Z',
      },
    ]);
  },

  saveCommissions(commissions: CommissionRequest[]): void {
    writeJson(`${KEY_PREFIX}:commissions`, commissions);
  },

  saveCommissionRequest(req: CommissionRequest): void {
    const items = this.getCommissions();
    const next = [req, ...items];
    this.saveCommissions(next);
  },

  updateCommissionStatus(id: string, status: CommissionRequest['status'], quotedPrice?: number, internalNotes?: string): void {
    const items = this.getCommissions();
    const next = items.map((c) =>
      c.id === id
        ? {
            ...c,
            status,
            quotedPrice: quotedPrice ?? c.quotedPrice,
            internalNotes: internalNotes ?? c.internalNotes,
          }
        : c
    );
    this.saveCommissions(next);
  },

  // Coupons
  getCoupons(): Coupon[] {
    return readJson<Coupon[]>(`${KEY_PREFIX}:coupons`, INITIAL_COUPONS);
  },

  saveCoupons(coupons: Coupon[]): void {
    writeJson(`${KEY_PREFIX}:coupons`, coupons);
  },

  // Settings
  getStoreSettings(): StoreSettings {
    return readJson<StoreSettings>(`${KEY_PREFIX}:settings`, INITIAL_SETTINGS);
  },

  saveStoreSettings(settings: StoreSettings): void {
    writeJson(`${KEY_PREFIX}:settings`, settings);
  },

  // Account isolated storage
  accountScope(userId?: string | null): string {
    return userId ? `user_${userId}` : 'guest';
  },

  getCart(userId?: string | null): CartItem[] {
    const scope = this.accountScope(userId);
    return readJson<CartItem[]>(`${KEY_PREFIX}:cart:${scope}`, []);
  },

  saveCart(items: CartItem[], userId?: string | null): void {
    const scope = this.accountScope(userId);
    writeJson(`${KEY_PREFIX}:cart:${scope}`, items);
  },

  getWishlist(userId?: string | null): string[] {
    const scope = this.accountScope(userId);
    return readJson<string[]>(`${KEY_PREFIX}:wishlist:${scope}`, ['va-01', 'va-07']);
  },

  saveWishlist(ids: string[], userId?: string | null): void {
    const scope = this.accountScope(userId);
    writeJson(`${KEY_PREFIX}:wishlist:${scope}`, ids);
  },

  getCartHistory(userId?: string | null): CartHistoryEntry[] {
    const scope = this.accountScope(userId);
    const fallback = userId === DEMO_CUSTOMER.id ? INITIAL_CART_HISTORY : [];
    return readJson<CartHistoryEntry[]>(`${KEY_PREFIX}:cart_history:${scope}`, fallback);
  },

  saveCartHistory(entries: CartHistoryEntry[], userId?: string | null): void {
    const scope = this.accountScope(userId);
    writeJson(`${KEY_PREFIX}:cart_history:${scope}`, entries);
  },

  getAddresses(userId?: string | null): Address[] {
    const scope = this.accountScope(userId);
    const fallback = userId === DEMO_CUSTOMER.id ? INITIAL_ADDRESSES : [];
    return readJson<Address[]>(`${KEY_PREFIX}:addresses:${scope}`, fallback);
  },

  saveAddresses(addresses: Address[], userId?: string | null): void {
    const scope = this.accountScope(userId);
    writeJson(`${KEY_PREFIX}:addresses:${scope}`, addresses);
  },

  getOrders(userId?: string | null): Order[] {
    const all = this.getAllOrders();
    if (!userId) return [];
    return all.filter((o) => o.customerId === userId);
  },

  saveUserOrder(order: Order, userId?: string | null): void {
    const all = this.getAllOrders();
    const next = [order, ...all];
    this.saveAllOrders(next);
  },

  getRecentSearches(): string[] {
    return readJson<string[]>(`${KEY_PREFIX}:recent_searches`, [
      'Terracotta Ganesha',
      'Village sketch',
      'Watercolor print',
    ]);
  },

  saveRecentSearches(queries: string[]): void {
    writeJson(`${KEY_PREFIX}:recent_searches`, queries.slice(0, 6));
  },
};
