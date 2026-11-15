import React from 'react';
import { Link } from 'react-router-dom';
import { PageTransition } from '../../components/common/PageTransition';

type PolicyKind = 'shipping' | 'returns' | 'privacy' | 'terms';

const POLICY_CONTENT: Record<
  PolicyKind,
  {
    title: string;
    updated: string;
    intro: string;
    sections: { heading: string; body: string }[];
  }
> = {
  shipping: {
    title: 'Shipping Policy',
    updated: 'Last updated November 2026',
    intro:
      'Every resin keepsake, frame, bouquet, embroidery hoop, and portrait leaves varniks_atelier wrapped with care in gift-ready protective packaging.',
    sections: [
      {
        heading: 'Dispatch Timeline',
        body: 'Ready-to-ship creations dispatch within 2–5 business days. Custom orders and hand-drawn portraits take 4–8 business days after studio & customer approval.',
      },
      {
        heading: 'Shipping Rates & Free Threshold',
        body: 'Complimentary insured shipping across India is automatically applied on all orders above ₹999. Orders below ₹999 carry a flat ₹95 studio packing and courier fee.',
      },
      {
        heading: 'Protective Gift Packaging',
        body: 'Frames and resin keepsakes are padded in honeycomb paper, blush tissue, and corner-braced double corrugated boxes so delicate corners arrive intact.',
      },
      {
        heading: 'Tracking Your Parcel',
        body: 'Once dispatched, your tracking number appears under My Orders in your customer account and is sent via email.',
      },
    ],
  },
  returns: {
    title: 'Return & Transit Care Policy',
    updated: 'Last updated November 2026',
    intro:
      'Because each piece is handcrafted or personalized in small studio batches, we handle returns with personal care and fairness.',
    sections: [
      {
        heading: 'Damaged in Transit',
        body: 'If a frame, resin piece, or clay keepsake arrives damaged, please email hello@varniksatelier.studio within 48 hours of delivery with unboxing photos. We will arrange a replacement or full refund immediately.',
      },
      {
        heading: 'Eligible Returns',
        body: 'Unused non-personalized pieces may be returned within 7 days of delivery in original protective packaging. Personalized custom orders and commissioned portraits are final sale unless damaged during shipping.',
      },
      {
        heading: 'Refund Timeline',
        body: 'Approved refunds are credited back to your original Razorpay or Stripe payment method within 5–7 business days after studio inspection.',
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    updated: 'Last updated November 2026',
    intro:
      'varniks_atelier respects your privacy and collects only the details needed to craft your custom orders, deliver your parcels, and maintain your account.',
    sections: [
      {
        heading: 'Information We Collect',
        body: 'When you create an account, place an order, or submit a custom order with a reference photograph, we store your name, email address, phone number, reference photo, and shipping address securely.',
      },
      {
        heading: 'Payment Security',
        body: 'Card and UPI credentials are processed directly by PCI-DSS compliant partners (Razorpay and Stripe). Our studio never stores your raw card numbers.',
      },
      {
        heading: 'Account Isolation',
        body: 'Your shopping bag, wishlist, custom requests, and order receipts remain strictly private to your authenticated customer account.',
      },
    ],
  },
  terms: {
    title: 'Terms & Conditions',
    updated: 'Last updated November 2026',
    intro:
      'By browsing or purchasing from varniks_atelier, you agree to the studio terms outlined below.',
    sections: [
      {
        heading: 'Artwork & Design Copyright',
        body: 'Purchasing a handmade piece or custom portrait transfers physical ownership of the creation. Commercial reproduction rights remain with varniks_atelier unless explicitly agreed in writing.',
      },
      {
        heading: 'Natural Handmade Variations',
        body: 'Subtle variations in pressed petals, hand-twisted chenille blooms, embroidery stitch tension, and hand lettering are authentic signatures of handmade work.',
      },
      {
        heading: 'Custom Orders Approval',
        body: 'Custom orders enter our Waiting List upon submission. Continuous order creation proceeds once the studio admin confirms the quote and the customer approves the request.',
      },
    ],
  },
};

export const PolicyPage: React.FC<{ kind: PolicyKind }> = ({ kind }) => {
  const data = POLICY_CONTENT[kind];

  return (
    <PageTransition className="py-12 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-2 pb-6 border-b border-[#E7C7CC]">
          <p className="text-xs text-[#7A655C]">{data.updated}</p>
          <h1 className="font-display text-3xl sm:text-4xl font-medium text-[#3E2F27]">
            {data.title}
          </h1>
          <p className="text-sm sm:text-base text-[#7A655C] leading-relaxed pt-1">{data.intro}</p>
        </div>

        <div className="space-y-6">
          {data.sections.map((section) => (
            <section key={section.heading} className="space-y-2">
              <h2 className="font-display text-xl font-medium text-[#3E2F27]">
                {section.heading}
              </h2>
              <p className="text-sm text-[#7A655C] leading-relaxed">{section.body}</p>
            </section>
          ))}
        </div>

        <div className="pt-6 border-t border-[#E7C7CC] flex flex-wrap items-center justify-between gap-3 text-xs text-[#7A655C]">
          <span>Questions about this policy?</span>
          <Link to="/contact" className="font-medium text-[#6D1836] hover:text-[#541129]">
            Write to our studio →
          </Link>
        </div>
      </div>
    </PageTransition>
  );
};
