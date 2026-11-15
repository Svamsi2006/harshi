import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ShoppingBag, Zap, ShieldCheck, Package, Sparkles } from 'lucide-react';
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
  const { products, addToCart } = useStore();
  const product = slug ? products.find((p) => p.slug === slug) : undefined;
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setQuantity(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (!product) {
    return (
      <PageTransition className="py-16 px-4 max-w-3xl mx-auto">
        <EmptyState
          title="Creation not found"
          description="This piece may have found a loving home. Explore our available handmade creations below."
          actionLabel="Shop All Works"
          actionTo="/shop"
        />
      </PageTransition>
    );
  }

  const related = products
    .filter(
      (p) =>
        p.id !== product.id &&
        (p.category === product.category || p.routeGroup === product.routeGroup)
    )
    .slice(0, 4);

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
        <nav
          aria-label="Breadcrumb"
          className="text-xs text-[#7A655C] flex flex-wrap items-center gap-2"
        >
          <Link to="/" className="hover:text-[#6D1836]">
            Home Studio
          </Link>
          <span aria-hidden="true">/</span>
          <Link to={`/shop/category/${product.category}`} className="hover:text-[#6D1836]">
            {product.categoryLabel}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-[#3E2F27]">{product.name}</span>
        </nav>

        {/* Main 2-Column Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Sticky Gallery */}
          <div className="lg:col-span-6 lg:sticky lg:top-24">
            <ProductGallery images={product.images} productName={product.name} />
          </div>

          {/* Right Contiguous Purchase Module & Specs */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3 pb-5 border-b border-[#E7C7CC]/70">
              <div className="flex flex-wrap items-center gap-2.5">
                <ProductBadge badge={product.badge} />
                <span className="text-xs text-[#7A655C]">
                  {product.productType} ·{' '}
                  <span
                    className={
                      product.stock <= 1
                        ? 'text-[#6D1836] font-medium'
                        : 'text-[#8C6B3F] font-medium'
                    }
                  >
                    {product.stock === 1
                      ? 'Only 1 piece left'
                      : `${product.stock} available in studio`}
                  </span>
                </span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl font-medium text-[#3E2F27]">
                {product.name}
              </h1>
              <p className="text-sm text-[#7A655C]">{product.subtitle}</p>

              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-2xl sm:text-3xl font-semibold text-[#3E2F27] tabular-nums">
                  {formatINR(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-base text-[#7A655C] line-through tabular-nums">
                    {formatINR(product.originalPrice)}
                  </span>
                )}
                <span className="text-xs text-[#7A655C]">Inclusive of studio taxes</span>
              </div>
            </div>

            <p className="text-sm sm:text-base text-[#3E2F27]/90 leading-relaxed">
              {product.description}
            </p>

            {/* Quantity & Action Buttons */}
            <div className="space-y-3 pt-1">
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <span className="block text-xs font-medium text-[#7A655C] mb-1.5">
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
                    className="w-full py-3 px-6 rounded-xl bg-[#6D1836] hover:bg-[#541129] text-[#FFF9F5] text-sm font-medium inline-flex items-center justify-center gap-2 shadow-warm transition-colors disabled:opacity-50"
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
                  className="py-3 px-5 rounded-xl bg-[#3E2F27] hover:bg-[#524036] text-[#FFF9F5] text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors"
                >
                  <Zap className="w-4 h-4 text-[#C9A66B]" />
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
            <div className="bg-[#F8EFEA] border border-[#E7C7CC] rounded-2xl p-4 sm:p-5">
              <p className="font-handwritten text-xl text-[#6D1836] leading-none mb-1.5">
                Maker&apos;s Note ♡
              </p>
              <p className="text-sm text-[#3E2F27] leading-relaxed">{product.artistNote}</p>
            </div>

            {/* Craft Specifications */}
            <ProductSpecifications specs={product.specifications} />

            {/* Story, Packaging & Shipping */}
            <div className="space-y-4 pt-2">
              <div>
                <h2 className="font-display text-lg font-medium text-[#3E2F27] mb-1.5">
                  The Story Behind This Piece
                </h2>
                <p className="text-sm text-[#7A655C] leading-relaxed">{product.story}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-4 rounded-xl bg-white border border-[#E7C7CC] space-y-1">
                  <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3E2F27]">
                    <Package className="w-4 h-4 text-[#6D1836]" />
                    <span>Thoughtful Gift Packing</span>
                  </p>
                  <p className="text-xs text-[#7A655C] leading-relaxed">
                    Cushioned in blush tissue, honeycomb protective wrap, and satin gift ribbon.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-[#E7C7CC] space-y-1">
                  <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3E2F27]">
                    <ShieldCheck className="w-4 h-4 text-[#C9A66B]" />
                    <span>Safe Arrival Promise</span>
                  </p>
                  <p className="text-xs text-[#7A655C] leading-relaxed">
                    Free shipping above ₹999. Insured dispatch across India within 2–5 days.
                  </p>
                </div>
              </div>
            </div>

            {/* Custom Orders Callout */}
            <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-[#FFF9F5] border border-[#E7C7CC]">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-[#C9A66B] shrink-0" />
                <p className="text-xs sm:text-sm text-[#3E2F27]">
                  Want this customized with your own photo, quote, or colors?
                </p>
              </div>
              <Link
                to="/custom-orders"
                className="text-xs font-semibold text-[#6D1836] hover:text-[#541129] whitespace-nowrap"
              >
                Create Custom Order →
              </Link>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="pt-8 border-t border-[#E7C7CC]/70 space-y-6">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-medium text-[#3E2F27]">
                You May Also Love
              </h2>
              <p className="text-sm text-[#7A655C] mt-1">
                More heartmade creations from our studio shelf.
              </p>
            </div>
            <ProductGrid products={related} columns={4} />
          </section>
        )}
      </div>
    </PageTransition>
  );
};
