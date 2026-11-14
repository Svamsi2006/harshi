import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import type { Product, ProductWorkType } from '../../types';
import { useStore } from '../../context/StoreContext';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { STUDIO_MEDIA } from '../../data/studioImages';

const CATEGORY_OPTIONS = [
  { key: 'sketches', label: 'Pencil & Charcoal Sketches', group: 'sketches' },
  { key: 'clay-terracotta', label: 'Clay & Terracotta', group: 'handicrafts' },
  { key: 'wood-woven', label: 'Wood & Woven Crafts', group: 'handicrafts' },
  { key: 'paintings', label: 'Original Paintings', group: 'paintings' },
  { key: 'prints', label: 'Watercolor Prints', group: 'prints' },
] as const;

const SAMPLE_IMAGE_OPTIONS = [
  { label: 'Village Sketch', url: STUDIO_MEDIA.sketchVillageLife },
  { label: 'Terracotta Ganesha', url: STUDIO_MEDIA.terracottaGanesha },
  { label: 'Serene Lake Print', url: STUDIO_MEDIA.watercolorSereneLake },
  { label: 'Jute Basket', url: STUDIO_MEDIA.wovenJuteBasket },
  { label: 'Banyan Tree Sketch', url: STUDIO_MEDIA.sketchOldBanyan },
  { label: 'Monsoon Painting', url: STUDIO_MEDIA.paintingMonsoonCourtyard },
  { label: 'Marigold Print', url: STUDIO_MEDIA.printBotanicalMarigold },
  { label: 'Wood Tray', url: STUDIO_MEDIA.woodCarvedTrivet },
];

export const AdminProductFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { products, addProduct, updateProduct } = useStore();

  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [story, setStory] = useState('');
  const [artistNote, setArtistNote] = useState('');
  const [category, setCategory] = useState<Exclude<Product['category'], 'all'>>('sketches');
  const [price, setPrice] = useState(1499);
  const [originalPrice, setOriginalPrice] = useState<number | undefined>(undefined);
  const [stock, setStock] = useState(1);
  const [productType, setProductType] = useState<ProductWorkType>('Original 1-of-1');
  const [medium, setMedium] = useState('Graphite on Paper');
  const [dimensions, setDimensions] = useState('8 × 10 inches');
  const [material, setMaterial] = useState('Cotton Rag Paper');
  const [badge, setBadge] = useState<Product['badge']>('Only 1 Left');
  const [imageUrl, setImageUrl] = useState(STUDIO_MEDIA.sketchVillageLife);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing && id) {
      const found = products.find((p) => p.id === id);
      if (found) {
        setName(found.name);
        setSubtitle(found.subtitle);
        setDescription(found.description);
        setStory(found.story);
        setArtistNote(found.artistNote);
        setCategory(found.category);
        setPrice(found.price);
        setOriginalPrice(found.originalPrice);
        setStock(found.stock);
        setProductType(found.productType);
        setMedium(found.medium);
        setDimensions(found.dimensions);
        setMaterial(found.specifications.material);
        setBadge(found.badge);
        setImageUrl(found.images[0] || STUDIO_MEDIA.sketchVillageLife);
      }
    }
  }, [isEditing, id, products]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim() || price <= 0) {
      setError('Please provide a valid product name, description, and price.');
      return;
    }
    setError('');

    const catObj = CATEGORY_OPTIONS.find((c) => c.key === category);
    const categoryLabel = catObj ? catObj.label : 'Sketches';
    const routeGroup = catObj ? catObj.group : 'sketches';
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const productPayload = {
      slug,
      name: name.trim(),
      subtitle: subtitle.trim() || name.trim(),
      description: description.trim(),
      story: story.trim() || description.trim(),
      artistNote: artistNote.trim() || 'Signed on reverse by the artist.',
      category,
      categoryLabel,
      routeGroup,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      images: [imageUrl, imageUrl],
      medium: medium.trim(),
      dimensions: dimensions.trim(),
      stock: Number(stock),
      productType,
      availabilityLabel: (stock > 0 ? 'In Stock' : 'Last Piece') as any,
      badge,
      isBestseller: true,
      isPublished: true,
      specifications: {
        medium: medium.trim(),
        dimensions: dimensions.trim(),
        material: material.trim(),
        availability: 'In Studio',
        care: 'Frame behind UV glass; keep dry',
        shipping: 'Ships in 3–5 business days',
      },
    };

    if (isEditing && id) {
      updateProduct({
        ...productPayload,
        id,
        createdAt: products.find((p) => p.id === id)?.createdAt ?? new Date().toISOString().split('T')[0],
      });
    } else {
      addProduct(productPayload);
    }
    navigate('/admin/products');
  };

  const inputClass =
    'w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EAE3D5] text-sm text-[#2B2623] focus:outline-none focus:border-[#C86D51]';

  return (
    <AdminLayout title={isEditing ? 'Edit / Replace Product' : 'Add New Artwork'}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6E655F] hover:text-[#C86D51]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Products</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-[#EAE3D5] rounded-3xl p-7 sm:p-9 shadow-warm space-y-6">
          {error && (
            <p className="text-xs text-[#B94F45] bg-[#B94F45]/10 border border-[#B94F45]/25 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-[#6E655F] mb-1.5">Product Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                placeholder="Village Courtyard Study"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6E655F] mb-1.5">Subtitle</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className={inputClass}
                placeholder="Quiet morning study"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-medium text-[#6E655F] mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className={inputClass}
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6E655F] mb-1.5">Product Type</label>
              <select
                value={productType}
                onChange={(e) => setProductType(e.target.value as ProductWorkType)}
                className={inputClass}
              >
                <option value="Original 1-of-1">Original 1-of-1</option>
                <option value="Limited Edition Print">Limited Edition Print</option>
                <option value="Handmade Craft">Handmade Craft</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6E655F] mb-1.5">Badge</label>
              <select
                value={badge ?? ''}
                onChange={(e) => setBadge((e.target.value as any) || undefined)}
                className={inputClass}
              >
                <option value="">None</option>
                <option value="Only 1 Left">Only 1 Left</option>
                <option value="Bestseller">Bestseller</option>
                <option value="Handmade">Handmade</option>
                <option value="Limited Run">Limited Run</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-medium text-[#6E655F] mb-1.5">Price (₹ INR) *</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6E655F] mb-1.5">Compare Price (₹)</label>
              <input
                type="number"
                value={originalPrice ?? ''}
                onChange={(e) => setOriginalPrice(e.target.value ? Number(e.target.value) : undefined)}
                className={inputClass}
                placeholder="Optional strike price"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6E655F] mb-1.5">Stock Quantity *</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className={inputClass}
                min={0}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-medium text-[#6E655F] mb-1.5">Medium</label>
              <input
                type="text"
                value={medium}
                onChange={(e) => setMedium(e.target.value)}
                className={inputClass}
                placeholder="Graphite on Paper"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6E655F] mb-1.5">Dimensions</label>
              <input
                type="text"
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
                className={inputClass}
                placeholder="8 × 10 inches"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6E655F] mb-1.5">Material</label>
              <input
                type="text"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className={inputClass}
                placeholder="300 GSM Cotton Paper"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6E655F] mb-1.5">Artwork Image URL / Preset</label>
            <div className="flex gap-3 mb-3">
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className={inputClass}
                placeholder="/src/assets/images/... or https://..."
              />
            </div>
            <p className="text-xs text-[#6E655F] mb-2">Or select a studio asset preset:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {SAMPLE_IMAGE_OPTIONS.map((img) => (
                <button
                  key={img.label}
                  type="button"
                  onClick={() => setImageUrl(img.url)}
                  className={`p-2 rounded-xl border text-xs text-left truncate transition-colors ${
                    imageUrl === img.url
                      ? 'bg-[#C86D51]/15 border-[#C86D51] font-medium text-[#2B2623]'
                      : 'bg-[#FAF7F2] border-[#EAE3D5] text-[#6E655F]'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5 mb-1 text-[#C86D51]" />
                  <span className="truncate block">{img.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6E655F] mb-1.5">Description *</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputClass}
              placeholder="Detailed artwork description..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6E655F] mb-1.5">Studio Story</label>
            <textarea
              rows={2}
              value={story}
              onChange={(e) => setStory(e.target.value)}
              className={inputClass}
              placeholder="Inspiration and creation process..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6E655F] mb-1.5">Artist&apos;s Note</label>
            <input
              type="text"
              value={artistNote}
              onChange={(e) => setArtistNote(e.target.value)}
              className={inputClass}
              placeholder="Signed on reverse..."
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-6 rounded-xl bg-[#C86D51] hover:bg-[#B2593E] text-white text-sm font-medium inline-flex items-center justify-center gap-2 shadow-warm transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{isEditing ? 'Save Product Changes' : 'Publish Product to Storefront'}</span>
          </button>
        </form>
      </div>
    </AdminLayout>
  );
};
