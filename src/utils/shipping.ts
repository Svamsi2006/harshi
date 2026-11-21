import type { Coupon, ShippingZone } from '../types';

export const DEFAULT_STUDIO_ORIGIN_STATE = 'Maharashtra';

export const DEFAULT_SHIPPING_ZONES: ShippingZone[] = [
  {
    id: 'local',
    name: 'Local / Home State Express',
    description: 'Same-state studio hub delivery (Maharashtra & Goa)',
    fee: 49,
    eta: '2–3 business days',
    states: ['maharashtra', 'goa'],
  },
  {
    id: 'metro',
    name: 'Tier-1 Metro Air Express',
    description: 'Delhi NCR, Bengaluru, Hyderabad, Chennai, Kolkata & Ahmedabad',
    fee: 79,
    eta: '3–4 business days',
    states: ['delhi', 'new delhi', 'karnataka', 'telangana', 'tamil nadu', 'west bengal', 'gujarat'],
  },
  {
    id: 'national',
    name: 'Rest of India Standard',
    description: 'Insured national parcel across all Indian states & PIN codes',
    fee: 99,
    eta: '4–6 business days',
  },
  {
    id: 'special',
    name: 'North-East, Hills & Islands',
    description: 'Assam, North-East states, J&K, Ladakh, Himachal, Uttarakhand & Islands',
    fee: 149,
    eta: '6–8 business days',
    states: [
      'assam',
      'meghalaya',
      'manipur',
      'mizoram',
      'nagaland',
      'tripura',
      'arunachal pradesh',
      'sikkim',
      'jammu and kashmir',
      'jammu & kashmir',
      'ladakh',
      'himachal pradesh',
      'uttarakhand',
      'andaman and nicobar',
      'andaman & nicobar',
      'lakshadweep',
    ],
  },
  {
    id: 'international',
    name: 'International Insured Air',
    description: 'Worldwide tracked studio packaging outside India',
    fee: 1499,
    eta: '10–14 business days',
  },
];

const METRO_CITIES = new Set([
  'mumbai',
  'pune',
  'thane',
  'navi mumbai',
  'delhi',
  'new delhi',
  'noida',
  'gurgaon',
  'gurugram',
  'faridabad',
  'ghaziabad',
  'bengaluru',
  'bangalore',
  'hyderabad',
  'secunderabad',
  'chennai',
  'kolkata',
  'ahmedabad',
  'surat',
  'jaipur',
  'kochi',
]);

// Indian postal PIN prefix routing (standard 6-digit India Post / Shiprocket / Delhivery zones)
const METRO_PIN_PREFIXES = [
  '110', // Delhi
  '122', // Gurugram
  '201', // Noida / Ghaziabad
  '380', // Ahmedabad
  '400', // Mumbai
  '401', // Mumbai Suburban
  '411', // Pune
  '500', // Hyderabad
  '560', // Bengaluru
  '600', // Chennai
  '700', // Kolkata
];

const SPECIAL_PIN_PREFIXES = [
  '171', '172', '173', '174', '175', '176', '177', // Himachal Pradesh
  '180', '181', '182', '184', '185', '190', '191', '192', '193', '194', // J&K & Ladakh
  '244', '246', '247', '248', '249', '262', '263', // Uttarakhand hills
  '68255', // Lakshadweep
  '737', // Sikkim
  '744', // Andaman & Nicobar
  '781', '782', '783', '784', '785', '786', '787', '788', // Assam
  '790', '791', '792', // Arunachal Pradesh
  '793', '794', // Meghalaya
  '795', // Manipur
  '796', // Mizoram
  '797', '798', // Nagaland
  '799', // Tripura
];

const LOCAL_STATE_PIN_PREFIXES: Record<string, string[]> = {
  maharashtra: ['40', '41', '42', '43', '44'],
  karnataka: ['56', '57', '58', '59'],
  telangana: ['50'],
  'andhra pradesh': ['51', '52', '53'],
  'tamil nadu': ['60', '61', '62', '63', '64'],
  kerala: ['67', '68', '69'],
  gujarat: ['36', '37', '38', '39'],
  delhi: ['11'],
  'west bengal': ['70', '71', '72', '73', '74'],
  rajasthan: ['30', '31', '32', '33', '34'],
  'uttar pradesh': ['20', '21', '22', '23', '24', '25', '26', '27', '28'],
};

export interface LocationShippingInput {
  country?: string;
  state?: string;
  city?: string;
  postalCode?: string;
  subtotal: number;
  zones?: ShippingZone[];
  originState?: string;
  freeShippingThreshold?: number;
  coupons?: Coupon[];
  appliedCouponCode?: string | null;
}

export interface LocationShippingResult {
  zone: ShippingZone;
  baseFee: number;
  finalFee: number;
  freeDeliveryApplied: boolean;
  freeDeliveryCoupon: Coupon | null;
  eligibleFreeDeliveryCoupon: Coupon | null;
  amountNeededForFreeDelivery: number;
  eta: string;
}

export function resolveShippingZones(customZones?: ShippingZone[]): ShippingZone[] {
  if (!Array.isArray(customZones) || customZones.length === 0) {
    return DEFAULT_SHIPPING_ZONES;
  }
  const byId = new Map(customZones.map((z) => [z.id, z]));
  return DEFAULT_SHIPPING_ZONES.map((def) => {
    const custom = byId.get(def.id);
    if (!custom) return def;
    return {
      ...def,
      ...custom,
      fee: Number.isFinite(Number(custom.fee)) && Number(custom.fee) >= 0 ? Number(custom.fee) : def.fee,
    };
  });
}

export function detectShippingZone(params: {
  country?: string;
  state?: string;
  city?: string;
  postalCode?: string;
  zones?: ShippingZone[];
  originState?: string;
}): ShippingZone {
  const zones = resolveShippingZones(params.zones);
  const byId = new Map(zones.map((z) => [z.id, z]));
  const localZone = byId.get('local') ?? zones[0];
  const metroZone = byId.get('metro') ?? zones[1] ?? localZone;
  const nationalZone = byId.get('national') ?? zones[2] ?? localZone;
  const specialZone = byId.get('special') ?? zones[3] ?? nationalZone;
  const intlZone = byId.get('international') ?? zones[4] ?? nationalZone;

  const country = (params.country || 'India').trim().toLowerCase();
  const state = (params.state || '').trim().toLowerCase();
  const city = (params.city || '').trim().toLowerCase();
  const pin = (params.postalCode || '').replace(/\D/g, '');
  const origin = (params.originState || DEFAULT_STUDIO_ORIGIN_STATE).trim().toLowerCase();

  // 1. Outside India → International
  if (country && country !== 'india' && country !== 'in' && country !== 'bharat') {
    return intlZone;
  }

  // 2. Special regions (North-East, J&K, Ladakh, Hills, Islands)
  if (
    (state && specialZone.states?.some((s) => state.includes(s))) ||
    (pin.length >= 3 && SPECIAL_PIN_PREFIXES.some((prefix) => pin.startsWith(prefix)))
  ) {
    return specialZone;
  }

  // 3. Local / Home State (studio hub state)
  const originPrefixes = LOCAL_STATE_PIN_PREFIXES[origin] ?? ['40', '41', '42', '43', '44'];
  if (
    (state && (state === origin || localZone.states?.some((s) => state === s))) ||
    (pin.length >= 2 && originPrefixes.some((p) => pin.startsWith(p)))
  ) {
    return localZone;
  }

  // 4. Tier-1 Metro cities
  if (
    (city && METRO_CITIES.has(city)) ||
    (pin.length >= 3 && METRO_PIN_PREFIXES.some((prefix) => pin.startsWith(prefix)))
  ) {
    return metroZone;
  }

  // 5. National default
  return nationalZone;
}

export function calculateLocationShipping(input: LocationShippingInput): LocationShippingResult {
  const zone = detectShippingZone({
    country: input.country,
    state: input.state,
    city: input.city,
    postalCode: input.postalCode,
    zones: input.zones,
    originState: input.originState,
  });

  if (input.subtotal <= 0) {
    return {
      zone,
      baseFee: 0,
      finalFee: 0,
      freeDeliveryApplied: false,
      freeDeliveryCoupon: null,
      eligibleFreeDeliveryCoupon: null,
      amountNeededForFreeDelivery: 0,
      eta: zone.eta,
    };
  }

  const coupons = Array.isArray(input.coupons) ? input.coupons : [];
  const activeFreeShipCoupons = coupons
    .filter((c) => c.isActive && c.discountType === 'free_shipping')
    .sort((a, b) => a.minimumOrder - b.minimumOrder);

  const primaryFreeShipCoupon = activeFreeShipCoupons[0] ?? null;
  const threshold = primaryFreeShipCoupon?.minimumOrder ?? input.freeShippingThreshold ?? 1000;
  const normalizedCode = (input.appliedCouponCode || '').trim().toUpperCase();

  // Domestic free shipping (international stays charged unless explicitly waived by coupon code)
  const isInternational = zone.id === 'international';

  const explicitlyAppliedFreeShip = normalizedCode
    ? activeFreeShipCoupons.find(
        (c) => c.code.toUpperCase() === normalizedCode && input.subtotal >= c.minimumOrder
      ) ?? null
    : null;

  const autoAppliedFreeShip =
    !isInternational && primaryFreeShipCoupon?.autoApply && input.subtotal >= primaryFreeShipCoupon.minimumOrder
      ? primaryFreeShipCoupon
      : null;

  const appliedFreeShipCoupon = explicitlyAppliedFreeShip ?? autoAppliedFreeShip;

  // Also fallback to store threshold if no free_shipping coupon exists at all
  const thresholdFree =
    !isInternational && !primaryFreeShipCoupon && input.subtotal >= threshold;

  const freeDeliveryApplied = Boolean(appliedFreeShipCoupon || thresholdFree);
  const eligibleFreeDeliveryCoupon =
    !isInternational && primaryFreeShipCoupon && input.subtotal >= primaryFreeShipCoupon.minimumOrder
      ? primaryFreeShipCoupon
      : null;

  return {
    zone,
    baseFee: zone.fee,
    finalFee: freeDeliveryApplied ? 0 : zone.fee,
    freeDeliveryApplied,
    freeDeliveryCoupon: appliedFreeShipCoupon,
    eligibleFreeDeliveryCoupon,
    amountNeededForFreeDelivery: isInternational ? 0 : Math.max(0, threshold - input.subtotal),
    eta: zone.eta,
  };
}
