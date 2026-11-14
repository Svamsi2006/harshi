import type {
  Address,
  CartHistoryEntry,
  CartItem,
  CommissionRequest,
  CustomerUser,
  Order,
} from '../types';
import {
  DEMO_CUSTOMER,
  INITIAL_ADDRESSES,
  INITIAL_CART_HISTORY,
  INITIAL_ORDERS,
} from '../data/mockAccount';

const KEY_PREFIX = 'varniks_atelier_v1';

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

/**
 * Service abstraction layer so Part 2 can swap localStorage persistence
 * for real backend APIs / database calls without rewriting UI components.
 */
export const storeService = {
  getCurrentUser(): CustomerUser | null {
    return readJson<CustomerUser | null>(`${KEY_PREFIX}:current_user`, null);
  },

  setCurrentUser(user: CustomerUser | null): void {
    writeJson(`${KEY_PREFIX}:current_user`, user);
  },

  getRegisteredUsers(): Array<CustomerUser & { password: string }> {
    const users = readJson<Array<CustomerUser & { password: string }>>(
      `${KEY_PREFIX}:users`,
      [{ ...DEMO_CUSTOMER, password: 'studio123' }]
    );
    return users;
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

  /** Account-scoped storage key guarantees zero cross-account cart leakage */
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
    const scope = this.accountScope(userId);
    const fallback = userId === DEMO_CUSTOMER.id ? INITIAL_ORDERS : [];
    return readJson<Order[]>(`${KEY_PREFIX}:orders:${scope}`, fallback);
  },

  saveOrders(orders: Order[], userId?: string | null): void {
    const scope = this.accountScope(userId);
    writeJson(`${KEY_PREFIX}:orders:${scope}`, orders);
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

  saveCommissionRequest(req: CommissionRequest): void {
    const existing = readJson<CommissionRequest[]>(`${KEY_PREFIX}:commissions`, []);
    writeJson(`${KEY_PREFIX}:commissions`, [req, ...existing]);
  },
};
