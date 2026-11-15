import type { Address, CartHistoryEntry, CustomerUser, Order } from '../types';
import { STUDIO_MEDIA } from './studioImages';

export const DEMO_CUSTOMER: CustomerUser = {
  id: 'cust-ananya-01',
  fullName: 'Ananya Deshmukh',
  email: 'ananya@example.com',
  phone: '+91 98204 51120',
  joinedAt: '2026-06-14',
};

export const INITIAL_ADDRESSES: Address[] = [
  {
    id: 'addr-1',
    fullName: 'Ananya Deshmukh',
    phone: '+91 98204 51120',
    addressLine: '14 Gulmohar Lane, Koregaon Park',
    city: 'Pune',
    state: 'Maharashtra',
    postalCode: '411001',
    country: 'India',
    isDefault: true,
  },
  {
    id: 'addr-2',
    fullName: 'Ananya Deshmukh',
    phone: '+91 98204 51120',
    addressLine: '302 Banyan Residency, Indiranagar 12th Main',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560038',
    country: 'India',
    isDefault: false,
  },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1042',
    orderNumber: 'VA-2026-1042',
    customerId: 'cust-ananya-01',
    date: '2026-11-08',
    items: [
      {
        productId: 'va-05',
        name: 'Golden Glow Pressed Flower LED Frame',
        slug: 'pressed-botanical-led-memory-frame',
        image: STUDIO_MEDIA.ledMemoryFrame,
        price: 2199,
        quantity: 1,
      },
      {
        productId: 'va-11',
        name: 'Gold-Flake Initial Keychain & Pearl Bag Charm',
        slug: 'personalized-floral-initial-keychain-set',
        image: STUDIO_MEDIA.personalizedAccessoriesCharm,
        price: 699,
        quantity: 1,
      },
    ],
    subtotal: 2898,
    shippingFee: 0,
    discount: 0,
    total: 2898,
    paymentMethod: 'razorpay',
    paymentStatus: 'Paid',
    orderStatus: 'Shipped',
    shippingAddress: {
      fullName: 'Ananya Deshmukh',
      phone: '+91 98204 51120',
      addressLine: '14 Gulmohar Lane, Koregaon Park',
      city: 'Pune',
      state: 'Maharashtra',
      postalCode: '411001',
      country: 'India',
    },
    trackingCode: 'BD-IN-78419204',
    estimatedDelivery: 'Nov 16, 2026',
  },
  {
    id: 'ord-0987',
    orderNumber: 'VA-2026-0987',
    customerId: 'cust-ananya-01',
    date: '2026-09-21',
    items: [
      {
        productId: 'va-07',
        name: 'Wax-Sealed Story & Polaroid Keepsake Box',
        slug: 'wax-sealed-polaroid-memory-box',
        image: STUDIO_MEDIA.paperPhotoKeepsake,
        price: 1849,
        quantity: 1,
      },
    ],
    subtotal: 1849,
    shippingFee: 0,
    discount: 150,
    total: 1699,
    paymentMethod: 'stripe',
    paymentStatus: 'Paid',
    orderStatus: 'Delivered',
    shippingAddress: {
      fullName: 'Ananya Deshmukh',
      phone: '+91 98204 51120',
      addressLine: '14 Gulmohar Lane, Koregaon Park',
      city: 'Pune',
      state: 'Maharashtra',
      postalCode: '411001',
      country: 'India',
    },
    trackingCode: 'BD-IN-65201933',
    estimatedDelivery: 'Delivered Sep 26, 2026',
  },
];

export const INITIAL_CART_HISTORY: CartHistoryEntry[] = [
  {
    id: 'hist-1',
    productId: 'va-01',
    quantity: 1,
    priceAtEvent: 1299,
    action: 'saved',
    timestamp: '2026-11-11T10:15:00Z',
  },
  {
    id: 'hist-2',
    productId: 'va-09',
    quantity: 1,
    priceAtEvent: 1599,
    action: 'removed',
    timestamp: '2026-11-09T17:40:00Z',
  },
  {
    id: 'hist-3',
    productId: 'va-05',
    quantity: 1,
    priceAtEvent: 2199,
    action: 'checked_out',
    timestamp: '2026-11-08T12:05:00Z',
  },
];

export interface FaqItem {
  question: string;
  answer: string;
  category: 'Creations' | 'Shipping' | 'Custom Orders' | 'Care';
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    category: 'Creations',
    question: 'Are your resin florals, pipe cleaner bouquets, and embroidery truly handmade?',
    answer:
      'Yes! Every resin coaster, fuzzy chenille bouquet, LED floral frame, embroidery hoop, scrapbook keepsake, and portrait is handcrafted inside our independent studio using real dried botanicals, cotton paper, and natural fibers.',
  },
  {
    category: 'Custom Orders',
    question: 'How does the Custom Orders approval & waiting list process work?',
    answer:
      'Pick your category and idea, upload a reference photograph, and choose a predicted price range or enter your own custom price. Your request enters our studio Waiting List where we confirm the quote and mark Admin Approved. Once approved, you simply click Approve & Place Order to create your continuous order.',
  },
  {
    category: 'Shipping',
    question: 'How do you protect LED glass frames, resin keepsakes, and bouquets during shipping?',
    answer:
      'Frames and resin pieces are wrapped in protective kraft honeycomb sleeves and double-walled gift boxes. Bouquets and textile hoops travel in cushioned presentation boxes with blush tissue and velvet ties.',
  },
  {
    category: 'Shipping',
    question: 'When do orders ship and is free shipping available?',
    answer:
      'Ready-to-ship pieces dispatch within 2–4 business days. Shipping is complimentary on all orders above ₹999 across India; orders under ₹999 carry a flat ₹95 studio packing & courier fee.',
  },
  {
    category: 'Care',
    question: 'How should I care for resin creations and embroidered textile hoops?',
    answer:
      'Wipe resin gently with a soft dry microfiber cloth and keep out of prolonged direct midday sun. Lightly dust embroidery hoops and pipe cleaner blooms with a dry soft brush.',
  },
];
