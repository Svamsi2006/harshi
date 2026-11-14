import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ShoppingBag, Zap, ShieldCheck, Package, Sparkles } from 'lucide-react';
import { PRODUCTS, getProductBySlug } from '../../data/products';
import { formatINR } from '../../utils/format';
import { useStore } from '../../context/StoreContext';
import { PageTransition } from '../../components/common/PageTransition';
import { EmptyState } from '../../components/common/EmptyState';
import { ProductGallery } from '../../components/product/ProductGallery';
import { ProductBadge } from '../../components/product/ProductBadge';
import { QuantitySelector } from '../../components/product/QuantitySelector';
import { WishlistButton } from '../../components/product/WishlistButton';
import { ProductSpecifications } from '../../components/product/ProductSpecifications';
import { ProductGrid } from '../../components/product/ProductGrid';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useStore();
  const product = slug ? getProductBySlug(slug) : undefined;
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setQuantity(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (!product) {
    return (
      <PageTransition className="py-16 px-4 max-w-3xl mx-auto">
        <EmptyState
          title="Artwork not found"
          description="This piece may have moved or found a collector's wall. Explore our available studio works below."
          actionLabel="Explore the Collection"
          actionTo="/shop"
        />
      </PageTransition>
    );
  }

  const related = PRODUCTS.filter(
    (p) => p.id !== product.id && (p.category === product.category || p.routeGroup === product.routeGroup)
  ).slice(0, 4);

  const handleAddToCart = () => {
    addToCart(product.id, quantity, true);
  };

  const handleBuyNow = () => {
    const ok = addToCart(product.id, quantity, false);
    if (ok) {
      navigate('/checkout');
    }
  };

  return (
    <PageTransition className="py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-xs text-[#6E655F] flex flex-wrap items-center gap-2">
          <Link to="/" className="hover:text-[#C86D51]">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <Link to={`/shop/${product.routeGroup}`} className="hover:text-[#C86D51] capitalize">
            {product.routeGroup}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-[#2B2623]">{product.name}</span>
        </nav>

        {/* Main 2-Column Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Sticky Gallery */}
          <div className="lg:col-span-6 lg:sticky lg:top-24">
            <ProductGallery images={product.images} productName={product.name} />
          </div>

          {/* Right Contiguous Purchase Module & Specs */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3 pb-5 border-b border-[#EAE3D5]">
              <div className="flex flex-wrap items-center gap-2.5">
                <ProductBadge badge={product.badge} />
                <span className="text-xs text-[#6E655F]">
                  {product.productType} ·{' '}
                  <span
                    className={
                      product.stock <= 1
                        ? 'text-[#B2593E] font-medium'
                        : 'text-[#7A9178] font-medium'
                    }
                  >
                    {product.stock === 1
                      ? 'Only 1 original left'
                      : `${product.stock} available in studio`}
                  </span>
                </span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl font-medium text-[#2B2623]">
                {product.name}
              </h1>
              <p className="text-sm text-[#6E655F]">{product.subtitle}</p>

              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-2xl sm:text-3xl font-semibold text-[#2B2623] tabular-nums">
                  {formatINR(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-base text-[#6E655F] line-through tabular-nums">
                    {formatINR(product.originalPrice)}
                  </span>
                )}
                <span className="text-xs text-[#6E655F]">Inclusive of studio taxes</span>
              </div>
            </div>

            <p className="text-sm sm:text-base text-[#2B2623]/90 leading-relaxed">
              {product.description}
            </p>

            {/* Quantity & Action Buttons */}
            <div className="space-y-3 pt-1">
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <span className="block text-xs font-medium text-[#6E655F] mb-1.5">
                    Quantity (max {product.stock})
                  </span>
                  <QuantitySelector
                    value={quantity}
                    max={product.stock}
                    onChange={setQuantity}
                  />
                </div>
                <div className="flex-1 min-w-[200px] pt-5">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0}
                    className="w-full py-3 px-6 rounded-xl bg-[#C86D51] hover:bg-[#B2593E] text-white text-sm font-medium inline-flex items-center justify-center gap-2 shadow-warm transition-colors disabled:opacity-50"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={product.stock <= 0}
                  className="py-3 px-5 rounded-xl bg-[#2B2623] hover:bg-[#3f3834] text-white text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors"
                >
                  <Zap className="w-4 h-4 text-[#E6B86A]" />
                  <span>Buy Now</span>
                </button>
                <WishlistButton
                  productId={product.id}
                  productName={product.name}
                  variant="full"
                />
              </div>
            </div>

            {/* Artist Note */}
            <div className="bg-[#F3EDE2]/75 border border-[#EAE3D5] rounded-2xl p-4 sm:p-5">
              <p className="font-handwritten text-xl text-[#C86D51] leading-none mb-1.5">
                Artist&apos;s Note ♡
              </p>
              <p className="text-sm text-[#2B2623] leading-relaxed">{product.artistNote}</p>
            </div>

            {/* Craft Specifications */}
            <ProductSpecifications specs={product.specifications} />

            {/* Story, Packaging & Shipping */}
            <div className="space-y-4 pt-2">
              <div>
                <h2 className="font-display text-lg font-medium text-[#2B2623] mb-1.5">
                  The Story Behind This Piece
                </h2>
                <p className="text-sm text-[#6E655F] leading-relaxed">{product.story}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-4 rounded-xl bg-white border border-[#EAE3D5] space-y-1">
                  <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2B2623]">
                    <Package className="w-4 h-4 text-[#C86D51]" />
                    <span>Plastic-Free Packing</span>
                  </p>
                  <p className="text-xs text-[#6E655F] leading-relaxed">
                    Cushioned in biodegradable honeycomb wrap, acid-free tissue, and gift twine.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-[#EAE3D5] space-y-1">
                  <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2B2623]">
                    <ShieldCheck className="w-4 h-4 text-[#7A9178]" />
                    <span>Safe Arrival Promise</span>
                  </p>
                  <p className="text-xs text-[#6E655F] leading-relaxed">
                    Free shipping above ₹999. Insured dispatch across India within 2–5 days.
                  </p>
                </div>
              </div>
            </div>

            {/* Custom Commission Callout */}
            <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D5]">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-[#C86D51] shrink-0" />
                <p className="text-xs sm:text-sm text-[#2B2623]">
                  Want a similar piece in a custom size or palette?
                </p>
              </div>
              <Link
                to="/commission"
                className="text-xs font-semibold text-[#C86D51] hover:text-[#B2593E] whitespace-nowrap"
              >
                Request Custom →
              </Link>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="pt-8 border-t border-[#EAE3D5] space-y-6">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-medium text-[#2B2623]">
                You May Also Love
              </h2>
              <p className="text-sm text-[#6E655F] mt-1">
                More handcrafted works from the studio shelf.
              </p>
            </div>
            <ProductGrid products={related} columns={4} />
          </section>
        )}
      </div>
    </PageTransition>
  );
};
