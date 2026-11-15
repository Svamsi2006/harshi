import type {
  Address,
  CartHistoryEntry,
  CartItem,
  CategoryItem,
  CommissionRequest,
  Coupon,
  CustomerUser,
  Order,
  OrderStatus,
  Product,
  StoreSettings,
} from '../types';
import { DEFAULT_CATEGORIES, PRODUCTS } from '../data/products';
import { STUDIO_MEDIA } from '../data/studioImages';
import { DEMO_CUSTOMER, INITIAL_ADDRESSES, INITIAL_CART_HISTORY, INITIAL_ORDERS } from '../data/mockAccount';
export { DEMO_CUSTOMER };

const KEY_PREFIX = 'varniks_atelier_v3';

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
    code: 'HEARTMADE15',
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
  announcementText: 'Handmade • Heartmade • Heartfelt — Free shipping on orders above ₹999',
};

const INITIAL_COMMISSIONS: CommissionRequest[] = [
  {
    id: 'CUST-9821',
    customerId: 'cust-ananya-01',
    customerName: 'Aarav Mehta',
    email: 'aarav@example.com',
    phone: '+91 98112 33445',
    categorySlug: 'frames-led',
    categoryLabel: 'Frames & LED Frames',
    customIdea: 'Anniversary Pressed Rose LED Frame with Custom Date',
    artworkType: 'Frames & LED Frames',
    preferredStyle: 'Warm Gold Botanicals & Ivory Mat',
    approximateSize: '10 × 10 inches',
    budgetRange: '₹1,500 – ₹2,999',
    isCustomPrice: false,
    predictedPrice: 2299,
    hasUploadedFile: true,
    referenceImageName: 'anniversary_couple_photo.jpg',
    referenceImageData: STUDIO_MEDIA.ledMemoryFrame,
    description: 'Would love burgundy pressed roses around our anniversary photo with warm LED fairy lights.',
    status: 'Admin Approved',
    adminApproved: true,
    customerApproved: false,
    orderCreated: false,
    quotedPrice: 2299,
    internalNotes: 'Photo resolution verified. Dried burgundy cosmos ready.',
    submittedAt: '2026-11-12T14:20:00Z',
  },
  {
    id: 'CUST-9844',
    customerId: 'cust-ananya-01',
    customerName: 'Ananya Deshmukh',
    email: 'ananya@example.com',
    phone: '+91 98204 51120',
    categorySlug: 'clay-pipe-cleaner',
    categoryLabel: 'Clay & Pipe Cleaner Creations',
    customIdea: 'Custom Tulip & Lavender Bouquet in Cream Speckled Pot',
    artworkType: 'Clay & Pipe Cleaner Creations',
    preferredStyle: 'Blush Velvet Wrap with Gold Tag',
    approximateSize: '9 inches tall',
    budgetRange: 'Custom Price',
    isCustomPrice: true,
    predictedPrice: 1450,
    hasUploadedFile: true,
    referenceImageName: 'bouquet_palette_inspo.png',
    referenceImageData: STUDIO_MEDIA.clayPipecleanerBouquet,
    description: 'Matching my friend’s bedroom palette in blush, burgundy, and cream.',
    status: 'Waiting List',
    adminApproved: false,
    customerApproved: false,
    orderCreated: false,
    submittedAt: '2026-11-14T09:15:00Z',
  },
];

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
    // Ignore storage quota errors
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

  // Dynamic Categories CRUD
  getCategories(): CategoryItem[] {
    return readJson<CategoryItem[]>(`${KEY_PREFIX}:categories`, DEFAULT_CATEGORIES);
  },

  saveCategories(categories: CategoryItem[]): void {
    writeJson(`${KEY_PREFIX}:categories`, categories);
  },

  addCategory(input: { label: string; subtitle?: string }): CategoryItem {
    const categories = this.getCategories();
    const baseSlug = input.label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const slug = categories.some((c) => c.slug === baseSlug)
      ? `${baseSlug}-${Date.now().toString().slice(-3)}`
      : baseSlug;
    const item: CategoryItem = {
      id: `cat-${Date.now()}`,
      slug,
      label: input.label.trim(),
      subtitle: input.subtitle?.trim() || `Handmade ${input.label.trim()} crafted in our studio`,
      isDefault: false,
    };
    const next = [...categories, item];
    this.saveCategories(next);
    return item;
  },

  deleteCategory(idOrSlug: string): void {
    const categories = this.getCategories();
    const next = categories.filter((c) => c.id !== idOrSlug && c.slug !== idOrSlug);
    this.saveCategories(next);
  },

  // Products CRUD
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

  // Custom Orders / Commissions
  getCommissions(): CommissionRequest[] {
    return readJson<CommissionRequest[]>(`${KEY_PREFIX}:commissions`, INITIAL_COMMISSIONS);
  },

  saveCommissions(commissions: CommissionRequest[]): void {
    writeJson(`${KEY_PREFIX}:commissions`, commissions);
  },

  saveCommissionRequest(req: CommissionRequest): void {
    const items = this.getCommissions();
    const next = [req, ...items];
    this.saveCommissions(next);
  },

  updateCommission(updated: CommissionRequest): void {
    const items = this.getCommissions();
    const next = items.map((c) => (c.id === updated.id ? updated : c));
    this.saveCommissions(next);
  },

  updateCommissionStatus(
    id: string,
    status: CommissionRequest['status'],
    quotedPrice?: number,
    internalNotes?: string
  ): void {
    const items = this.getCommissions();
    const next = items.map((c) =>
      c.id === id
        ? {
            ...c,
            status,
            adminApproved:
              status === 'Admin Approved' ||
              status === 'Customer Approved' ||
              status === 'Order Created' ||
              status === 'In Progress' ||
              status === 'Completed'
                ? true
                : status === 'Rejected'
                  ? false
                  : c.adminApproved,
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
    const saved = readJson<Partial<StoreSettings> | null>(`${KEY_PREFIX}:settings`, null);
    return {
      ...INITIAL_SETTINGS,
      ...(saved && typeof saved === 'object' ? saved : {}),
    };
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
    return readJson<string[]>(`${KEY_PREFIX}:wishlist:${scope}`, ['va-01', 'va-05']);
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

  saveUserOrder(order: Order): void {
    const all = this.getAllOrders();
    const next = [order, ...all];
    this.saveAllOrders(next);
  },

  getRecentSearches(): string[] {
    return readJson<string[]>(`${KEY_PREFIX}:recent_searches`, [
      'Resin coasters',
      'LED photo frame',
      'Pipe cleaner bouquet',
    ]);
  },

  saveRecentSearches(queries: string[]): void {
    writeJson(`${KEY_PREFIX}:recent_searches`, queries.slice(0, 6));
  },
};
