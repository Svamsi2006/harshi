import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(href: string) {
  let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

function upsertDynamicJsonLd(payload: Record<string, unknown> | null) {
  const existing = document.getElementById('varniks-dynamic-jsonld');
  if (!payload) {
    existing?.remove();
    return;
  }
  const script = existing || document.createElement('script');
  script.id = 'varniks-dynamic-jsonld';
  script.setAttribute('type', 'application/ld+json');
  script.textContent = JSON.stringify(payload);
  if (!existing) document.head.appendChild(script);
}

const GA4_ID_REGEX = /^G-[A-Z0-9]{4,20}$/i;

export const SeoManager: React.FC = () => {
  const { pathname } = useLocation();
  const { storeSettings, products, categories } = useStore();

  const storeName = storeSettings.storeName || 'varniks_atelier';
  const gaId = (
    storeSettings.gaMeasurementId ||
    (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined) ||
    ''
  ).trim();
  const siteVerification = (storeSettings.googleSiteVerification || '').trim();

  // Inject Google Search Console verification meta tag if configured
  useEffect(() => {
    if (!siteVerification) return;
    upsertMeta('name', 'google-site-verification', siteVerification);
  }, [siteVerification]);

  // Inject Google Analytics 4 (gtag.js) once a valid G-XXXXXXXXXX ID is configured
  useEffect(() => {
    if (!GA4_ID_REGEX.test(gaId)) return;
    const scriptId = 'varniks-ga4-script';
    if (!document.getElementById(scriptId)) {
      const s = document.createElement('script');
      s.id = scriptId;
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
      document.head.appendChild(s);

      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag(...args: unknown[]) {
        window.dataLayer?.push(args);
      };
      window.gtag('js', new Date());
      window.gtag('config', gaId, { send_page_view: false });
    }
  }, [gaId]);

  // Dynamic route-level SEO metadata, canonical URL, Product JSON-LD, and GA4 page_view
  useEffect(() => {
    const origin = window.location.origin;
    const canonicalUrl = `${origin}${pathname}`;
    const isAdminRoute = pathname.startsWith('/admin');

    let title = `${storeName} — Handmade Gifts, Resin Art & Custom Portraits`;
    let description =
      'We create what you imagine and turn cherished memories into handmade keepsakes you can feel in your hands. Shop resin art, LED frames, clay bouquets & custom portraits.';
    let ogImage = storeSettings.logoUrl || '';
    let jsonLd: Record<string, unknown> | null = null;

    if (pathname === '/shop') {
      title = `Shop Handmade Gifts & Keepsakes | ${storeName}`;
      description =
        'Browse handcrafted resin coasters, glowing LED photo frames, velvet pipe cleaner bouquets, embroidery hoops & custom portraits with pan-India delivery.';
    } else if (pathname.startsWith('/shop/category/')) {
      const slug = decodeURIComponent(pathname.replace('/shop/category/', '').split('/')[0] || '');
      const cat = categories.find((c) => c.slug === slug);
      if (cat) {
        title = `${cat.label} — Handmade Collection | ${storeName}`;
        description = `${cat.subtitle || `Explore handcrafted ${cat.label}`} lovingly made at ${storeName}. Free delivery on orders above ₹1,000.`;
      }
    } else if (pathname.startsWith('/product/')) {
      const slug = decodeURIComponent(pathname.replace('/product/', '').split('/')[0] || '');
      const product = products.find((p) => p.slug === slug);
      if (product) {
        title = `${product.name} | ${storeName}`;
        description = (product.description || product.subtitle || description).slice(0, 158);
        ogImage = product.images?.[0] || ogImage;
        jsonLd = {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          description: product.description,
          image: product.images,
          sku: product.sku || product.id,
          category: product.categoryLabel,
          brand: {
            '@type': 'Brand',
            name: storeName,
          },
          offers: {
            '@type': 'Offer',
            url: canonicalUrl,
            priceCurrency: 'INR',
            price: String(product.price),
            availability:
              product.stock > 0
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            seller: {
              '@type': 'Organization',
              name: storeName,
            },
          },
        };
      }
    } else if (pathname === '/custom-orders') {
      title = `Custom Handmade Orders & Personalized Gifts | ${storeName}`;
      description =
        'Upload your photo and custom idea to commission bespoke resin art, LED memory frames, flower bouquets, or portraits crafted by hand.';
    } else if (pathname === '/about-us') {
      title = `Our Story — Independent Handmade Crafts Studio | ${storeName}`;
      description =
        'Meet the makers behind varniks_atelier—turning your cherished memories into tangible, heartmade gifts and heirloom keepsakes.';
    } else if (pathname === '/faq') {
      title = `Shipping, Custom Orders & Care FAQ | ${storeName}`;
      description =
        'Answers on pan-India location-based delivery, free shipping above ₹1,000, custom portrait timelines, and archival care.';
    } else if (pathname === '/contact') {
      title = `Contact Our Studio | ${storeName}`;
      description =
        'Reach out to varniks_atelier for bespoke gifting, wedding favors, bulk keepsakes, or order support.';
    } else if (isAdminRoute) {
      title = `Admin Studio | ${storeName}`;
    }

    document.title = title;
    upsertMeta('name', 'description', description);
    upsertMeta('name', 'robots', isAdminRoute ? 'noindex, nofollow' : 'index, follow, max-image-preview:large');
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', canonicalUrl);
    upsertMeta('property', 'og:site_name', storeName);
    if (ogImage && /^https?:\/\//i.test(ogImage)) {
      upsertMeta('property', 'og:image', ogImage);
    }
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);
    upsertCanonical(canonicalUrl);
    upsertDynamicJsonLd(jsonLd);

    if (GA4_ID_REGEX.test(gaId) && typeof window.gtag === 'function' && !isAdminRoute) {
      window.gtag('event', 'page_view', {
        page_title: title,
        page_location: canonicalUrl,
        page_path: pathname,
      });
    }
  }, [pathname, storeName, storeSettings.logoUrl, products, categories, gaId]);

  return null;
};
