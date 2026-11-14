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
        productId: 'va-02',
        name: 'Terracotta Ganesha',
        slug: 'terracotta-ganesha',
        image: STUDIO_MEDIA.terracottaGanesha,
        price: 2199,
        quantity: 1,
      },
      {
        productId: 'va-08',
        name: 'Marigold & Eucalyptus Print',
        slug: 'marigold-eucalyptus-print',
        image: STUDIO_MEDIA.printBotanicalMarigold,
        price: 899,
        quantity: 1,
      },
    ],
    subtotal: 3098,
    shippingFee: 0,
    discount: 0,
    total: 3098,
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
        productId: 'va-03',
        name: 'Serene Lake Print',
        slug: 'serene-lake-print',
        image: STUDIO_MEDIA.watercolorSereneLake,
        price: 999,
        quantity: 2,
      },
    ],
    subtotal: 1998,
    shippingFee: 0,
    discount: 150,
    total: 1848,
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
    productId: 'va-04',
    quantity: 1,
    priceAtEvent: 1299,
    action: 'saved',
    timestamp: '2026-11-11T10:15:00Z',
  },
  {
    id: 'hist-2',
    productId: 'va-12',
    quantity: 1,
    priceAtEvent: 1350,
    action: 'removed',
    timestamp: '2026-11-09T17:40:00Z',
  },
  {
    id: 'hist-3',
    productId: 'va-02',
    quantity: 1,
    priceAtEvent: 2199,
    action: 'checked_out',
    timestamp: '2026-11-08T12:05:00Z',
  },
];

export interface FaqItem {
  question: string;
  answer: string;
  category: 'Artworks' | 'Shipping' | 'Commissions' | 'Care';
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    category: 'Artworks',
    question: 'Are the pencil sketches and oil paintings true originals?',
    answer:
      'Yes. Every item marked "Original 1-of-1" is an authentic, singular drawing or painting hand-crafted in our studio on archival cotton rag paper or stretched Belgian linen, signed by the artist.',
  },
  {
    category: 'Artworks',
    question: 'What is the difference between an Original and a Watercolor Print?',
    answer:
      'Originals are one-of-a-kind works directly from the easel. Our Watercolor Prints are museum-grade giclee editions printed with pigment inks on 310 GSM deckle-edge cotton paper, stamped and numbered by the studio.',
  },
  {
    category: 'Shipping',
    question: 'How do you protect fragile terracotta and unframed sketches during shipping?',
    answer:
      'Sketches and prints ship flat between rigid archival boards inside moisture-sealed sleeves. Terracotta sculptures and stoneware are double-boxed using biodegradable honeycomb paper and wood-wool cushioning.',
  },
  {
    category: 'Shipping',
    question: 'When do orders ship and is free shipping available?',
    answer:
      'Orders placed before 2 PM dispatch within 2–5 business days from our studio. Shipping is complimentary on all orders above ₹999 across India; orders under ₹999 carry a flat ₹95 studio packing & courier fee.',
  },
  {
    category: 'Commissions',
    question: 'How long does a custom artwork commission take?',
    answer:
      'Custom pencil portraits, architectural home sketches, and personalized terracotta pieces typically take 10–18 days depending on size and drying/kiln schedules. We share work-in-progress studio photos before wrapping.',
  },
  {
    category: 'Care',
    question: 'How should I care for raw unglazed terracotta and graphite drawings?',
    answer:
      'Dust unglazed terracotta gently with a soft dry brush—avoid soaking in water. For charcoal and pencil works, we recommend framing under glass with an acid-free mat spacer and displaying away from damp walls.',
  },
];
