export type CategoryKey =
  | 'all'
  | 'sketches'
  | 'clay-terracotta'
  | 'wood-woven'
  | 'paintings'
  | 'prints';

export type RouteCategorySlug = 'sketches' | 'handicrafts' | 'paintings' | 'prints';

export type ProductWorkType = 'Original 1-of-1' | 'Limited Edition Print' | 'Handmade Craft';

export type ProductBadgeType = 'Handmade' | 'Bestseller' | 'Only 1 Left' | 'Limited Run';

export interface ProductSpecification {
  medium: string;
  dimensions: string;
  material: string;
  availability: string;
  care: string;
  shipping: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  story: string;
  artistNote: string;
  category: Exclude<CategoryKey, 'all'>;
  categoryLabel: string;
  routeGroup: RouteCategorySlug;
  price: number;
  originalPrice?: number;
  images: string[];
  medium: string;
  dimensions: string;
  stock: number;
  productType: ProductWorkType;
  availabilityLabel: 'In Stock' | 'Made to Order' | 'Last Piece';
  badge?: ProductBadgeType;
  isBestseller?: boolean;
  createdAt: string;
  specifications: ProductSpecification;
}

export interface CartItem {
  productId: string;
  quantity: number;
  addedAt: string;
}

export type CartHistoryAction = 'saved' | 'removed' | 'checked_out';

export interface CartHistoryEntry {
  id: string;
  productId: string;
  quantity: number;
  priceAtEvent: number;
  action: CartHistoryAction;
  timestamp: string;
}

export interface CustomerUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  joinedAt: string;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export type OrderStatus = 'Pending' | 'Packed' | 'Shipped' | 'Delivered';

export type PaymentMethod = 'razorpay' | 'stripe';

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  slug: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  date: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'Paid' | 'Pending';
  orderStatus: OrderStatus;
  shippingAddress: Omit<Address, 'id' | 'isDefault'>;
  trackingCode?: string;
  estimatedDelivery: string;
}

export interface CommissionRequest {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  artworkType: string;
  preferredStyle: string;
  approximateSize: string;
  budgetRange: string;
  referenceImageName?: string;
  description: string;
  submittedAt: string;
}

export interface FilterState {
  category: CategoryKey;
  priceRange: 'all' | 'under-1200' | '1200-2500' | 'above-2500';
  availability: 'all' | 'in-stock' | 'last-piece';
  workType: 'all' | 'original' | 'prints' | 'craft';
  sortBy: 'newest' | 'price-asc' | 'price-desc' | 'bestselling';
}

export interface ToastMessage {
  id: string;
  title: string;
  subtitle?: string;
  type?: 'success' | 'info' | 'error';
}
