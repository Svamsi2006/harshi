export type CategoryKey = string;

export interface CategoryItem {
  id: string;
  slug: string;
  label: string;
  subtitle: string;
  isDefault?: boolean;
}

export type ProductWorkType = 'Handmade Keepsake' | 'Custom Made' | 'Original Artwork';

export type ProductBadgeType = 'Handmade' | 'Bestseller' | 'Only 1 Left' | 'Limited Run' | 'Customizable';

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
  category: string;
  categoryLabel: string;
  routeGroup: string;
  price: number;
  originalPrice?: number;
  costPrice?: number;
  sku?: string;
  images: string[];
  medium: string;
  dimensions: string;
  stock: number;
  lowStockThreshold?: number;
  productType: ProductWorkType;
  availabilityLabel: 'In Stock' | 'Made to Order' | 'Last Piece';
  badge?: ProductBadgeType;
  isBestseller?: boolean;
  isPublished?: boolean;
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
  role?: 'customer' | 'owner';
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

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Packed'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled'
  | 'Refunded';

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
  customerName?: string;
  customerEmail?: string;
  date: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'Paid' | 'Pending' | 'Authorized' | 'Refunded';
  orderStatus: OrderStatus;
  shippingAddress: Omit<Address, 'id' | 'isDefault'>;
  trackingCode?: string;
  courierName?: string;
  estimatedDelivery: string;
  isCustomOrder?: boolean;
  customRequestId?: string;
  paymentReference?: string;
}

export type CustomOrderStatus =
  | 'Waiting List'
  | 'Reviewing'
  | 'Admin Approved'
  | 'Customer Approved'
  | 'Order Created'
  | 'In Progress'
  | 'Completed'
  | 'Rejected';

export interface CommissionRequest {
  id: string;
  customerId?: string;
  customerName: string;
  email: string;
  phone: string;
  categorySlug: string;
  categoryLabel: string;
  customIdea: string;
  artworkType: string;
  preferredStyle: string;
  approximateSize: string;
  budgetRange: string;
  isCustomPrice: boolean;
  predictedPrice?: number;
  hasUploadedFile: boolean;
  referenceImageName?: string;
  referenceImageData?: string;
  description: string;
  status: CustomOrderStatus;
  adminApproved: boolean;
  customerApproved: boolean;
  orderCreated: boolean;
  linkedOrderId?: string;
  quotedPrice?: number;
  internalNotes?: string;
  submittedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumOrder: number;
  isActive: boolean;
  expiresAt?: string;
}

export interface StoreSettings {
  storeName: string;
  contactEmail: string;
  contactPhone: string;
  currency: string;
  freeShippingThreshold: number;
  defaultShippingFee: number;
  announcementText: string;
  logoUrl?: string;
  chatbotEnabled?: boolean;
  openrouterModel?: string;
  hasOpenrouterKey?: boolean;
  openrouterKeyMasked?: string;
}

export interface FilterState {
  category: CategoryKey;
  priceRange: 'all' | 'under-1200' | '1200-2500' | 'above-2500';
  availability: 'all' | 'in-stock' | 'last-piece';
  workType: 'all' | 'handmade' | 'custom' | 'original';
  sortBy: 'newest' | 'price-asc' | 'price-desc' | 'bestselling';
}

export interface ToastMessage {
  id: string;
  title: string;
  subtitle?: string;
  type?: 'success' | 'info' | 'error';
}
