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
      'Every sketch, sculpture, and woven piece leaves varniks_atelier packed personally by our studio team using zero-plastic protective materials.',
    sections: [
      {
        heading: 'Dispatch Timeline',
        body: 'Ready-to-ship artworks and prints dispatch within 2–5 business days. Original oil paintings on stretched canvas and delicate multi-piece clay sets may take up to 5 business days for custom wood-braced or honeycomb crating.',
      },
      {
        heading: 'Shipping Rates & Free Threshold',
        body: 'Complimentary insured shipping across India is automatically applied on all orders above ₹999. Orders below ₹999 carry a flat ₹95 studio packing and courier fee.',
      },
      {
        heading: 'Archival & Fragile Packaging',
        body: 'Pencil and charcoal sketches are sealed in acid-free glassine sleeves between rigid twin-wall backing boards. Terracotta sculptures are wrapped in biodegradable honeycomb paper and wood-wool cushioning inside double-corrugated boxes.',
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
      'Because each piece is handcrafted or produced in small studio runs, we handle returns with personal care and fairness.',
    sections: [
      {
        heading: 'Damaged in Transit',
        body: 'If a terracotta sculpture, ceramic vessel, or framed work arrives damaged, please email hello@varniksatelier.studio within 48 hours of delivery with photos of the outer box and piece. We will arrange a replacement or full refund immediately.',
      },
      {
        heading: 'Eligible Returns',
        body: 'Unused home crafts and open-edition prints may be returned within 7 days of delivery in their original protective packaging. Original 1-of-1 artworks and custom commissioned pieces are final sale unless damaged during shipping.',
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
      'varniks_atelier respects your privacy and collects only the details needed to deliver your artworks and maintain your collector account.',
    sections: [
      {
        heading: 'Information We Collect',
        body: 'When you create an account, place an order, or request a commission, we store your name, email address, phone number, and shipping address securely.',
      },
      {
        heading: 'Payment Security',
        body: 'Card and UPI credentials are processed directly by PCI-DSS compliant partners (Razorpay and Stripe). Our studio never stores your raw card numbers.',
      },
      {
        heading: 'Account Isolation',
        body: 'Your shopping bag, wishlist, cart history, and order receipts remain strictly private to your authenticated customer account.',
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
        heading: 'Artwork Copyright',
        body: 'Purchasing an original drawing, painting, or archival print transfers physical ownership of the artwork. Reproduction, commercial printing, or resale rights remain with varniks_atelier unless explicitly agreed in writing.',
      },
      {
        heading: 'Natural Handmade Variations',
        body: 'Subtle variations in clay speckles, wood grain, deckle paper edges, and brushwork are authentic signatures of handmade work and not considered defects.',
      },
      {
        heading: 'Custom Commissions',
        body: 'Custom artwork requests are confirmed once scope, dimensions, and timeline are agreed with the studio.',
      },
    ],
  },
};

export const PolicyPage: React.FC<{ kind: PolicyKind }> = ({ kind }) => {
  const data = POLICY_CONTENT[kind];

  return (
    <PageTransition className="py-12 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-2 pb-6 border-b border-[#EAE3D5]">
          <p className="text-xs text-[#6E655F]">{data.updated}</p>
          <h1 className="font-display text-3xl sm:text-4xl font-medium text-[#2B2623]">
            {data.title}
          </h1>
          <p className="text-sm sm:text-base text-[#6E655F] leading-relaxed pt-1">{data.intro}</p>
        </div>

        <div className="space-y-6">
          {data.sections.map((section) => (
            <section key={section.heading} className="space-y-2">
              <h2 className="font-display text-xl font-medium text-[#2B2623]">
                {section.heading}
              </h2>
              <p className="text-sm text-[#6E655F] leading-relaxed">{section.body}</p>
            </section>
          ))}
        </div>

        <div className="pt-6 border-t border-[#EAE3D5] flex flex-wrap items-center justify-between gap-3 text-xs text-[#6E655F]">
          <span>Questions about this policy?</span>
          <Link to="/contact" className="font-medium text-[#C86D51] hover:text-[#B2593E]">
            Write to our studio →
          </Link>
        </div>
      </div>
    </PageTransition>
  );
};
