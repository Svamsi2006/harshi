import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Image as ImageIcon, Upload, Loader2 } from 'lucide-react';
import type { Product, ProductWorkType } from '../../types';
import { useStore } from '../../context/StoreContext';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { STUDIO_MEDIA } from '../../data/studioImages';
import { ResilientImage } from '../../components/common/ResilientImage';
import { uploadStudioPhoto } from '../../utils/imageUpload';

const SAMPLE_IMAGE_OPTIONS = [
  { label: 'Resin Coasters', url: STUDIO_MEDIA.resinFloralKeepsake },
  { label: 'Pipe Cleaner Bouquet', url: STUDIO_MEDIA.clayPipecleanerBouquet },
  { label: 'LED Memory Frame', url: STUDIO_MEDIA.ledMemoryFrame },
  { label: 'Paper & Photo Box', url: STUDIO_MEDIA.paperPhotoKeepsake },
  { label: 'Embroidery Hoop', url: STUDIO_MEDIA.textileEmbroideryHoop },
  { label: 'Personalized Charm', url: STUDIO_MEDIA.personalizedAccessoriesCharm },
  { label: 'Portrait Keepsake', url: STUDIO_MEDIA.artPortraitKeepsake },
  { label: 'Studio Desk', url: STUDIO_MEDIA.artistStudioDesk },
];

export const AdminProductFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { products, categories, addProduct, updateProduct } = useStore();
  const loadedIdRef = useRef<string | null>(null);

  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [story, setStory] = useState('');
  const [artistNote, setArtistNote] = useState('');
  const [category, setCategory] = useState<string>(categories[0]?.slug ?? 'resin-creations');
  const [price, setPrice] = useState('1499');
  const [originalPrice, setOriginalPrice] = useState('');
  const [stock, setStock] = useState('4');
  const [productType, setProductType] = useState<ProductWorkType>('Handmade Keepsake');
  const [medium, setMedium] = useState('Pressed Botanicals in Crystal Resin');
  const [dimensions, setDimensions] = useState('6 × 8 inches');
  const [material, setMaterial] = useState('Non-yellowing UV Resin & Gold Leaf');
  const [badge, setBadge] = useState<Product['badge']>('Handmade');
  const [imageUrl, setImageUrl] = useState(STUDIO_MEDIA.resinFloralKeepsake);
  const [secondaryImageUrl, setSecondaryImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEditing || !id) {
      loadedIdRef.current = null;
      return;
    }
    if (loadedIdRef.current === id) return;

    const found = products.find((p) => p.id === id);
    if (found) {
      loadedIdRef.current = id;
      setName(found.name);
      setSubtitle(found.subtitle);
      setDescription(found.description);
      setStory(found.story);
      setArtistNote(found.artistNote);
      setCategory(found.category);
      setPrice(String(found.price));
      setOriginalPrice(found.originalPrice ? String(found.originalPrice) : '');
      setStock(String(found.stock));
      setProductType(found.productType);
      setMedium(found.medium);
      setDimensions(found.dimensions);
      setMaterial(found.specifications?.material ?? '');
      setBadge(found.badge);
      setImageUrl(found.images[0] || STUDIO_MEDIA.resinFloralKeepsake);
      setSecondaryImageUrl(
        found.images[1] && found.images[1] !== found.images[0] ? found.images[1] : ''
      );
    }
  }, [isEditing, id, products]);

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    setError('');
    try {
      const { url } = await uploadStudioPhoto(file, 'products');
      setImageUrl(url);
    } catch {
      setError('Could not process the selected image file. Please try another photo or URL.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    const parsedPrice = Number(price);
    const parsedOriginal = originalPrice.trim() ? Number(originalPrice) : undefined;
    const parsedStock = Math.max(0, Math.floor(Number(stock) || 0));

    if (!name.trim()) {
      setError('Please enter a product name.');
      return;
    }
    if (!description.trim()) {
      setError('Please enter a product description.');
      return;
    }
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setError('Please enter a valid price greater than ₹0.');
      return;
    }
    if (!imageUrl.trim()) {
      setError('Please provide a valid primary photo URL or upload an image.');
      return;
    }

    setError('');
    setSaving(true);

    const catObj = categories.find((c) => c.slug === category) ?? categories[0];
    const categoryLabel = catObj ? catObj.label : category;
    const routeGroup = catObj ? catObj.slug : category;
    const existingProduct = isEditing && id ? products.find((p) => p.id === id) : undefined;
    const generatedSlug =
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || `creation-${Date.now()}`;

    const cleanPrimaryImg = imageUrl.trim();
    const cleanSecondaryImg = secondaryImageUrl.trim() || cleanPrimaryImg;

    const productPayload = {
      slug: generatedSlug,
      name: name.trim(),
      subtitle: subtitle.trim() || name.trim(),
      description: description.trim(),
      story: story.trim() || description.trim(),
      artistNote: artistNote.trim() || 'Crafted by hand in varniks_atelier.',
      category,
      categoryLabel,
      routeGroup,
      price: parsedPrice,
      originalPrice:
        parsedOriginal && Number.isFinite(parsedOriginal) && parsedOriginal > 0
          ? parsedOriginal
          : undefined,
      images: [cleanPrimaryImg, cleanSecondaryImg],
      medium: medium.trim() || 'Handcrafted Studio Piece',
      dimensions: dimensions.trim() || 'Standard Studio Size',
      stock: parsedStock,
      productType,
      availabilityLabel: (parsedStock === 0
        ? 'Sold Out'
        : parsedStock === 1
          ? 'Last Piece'
          : 'In Stock') as Product['availabilityLabel'],
      badge,
      isBestseller: existingProduct?.isBestseller ?? true,
      isPublished: existingProduct?.isPublished ?? true,
      specifications: {
        medium: medium.trim() || 'Handcrafted Studio Piece',
        dimensions: dimensions.trim() || 'Standard Studio Size',
        material: material.trim() || 'Archival Studio Materials',
        availability: parsedStock > 0 ? 'In Studio' : 'Made to Order',
        care:
          existingProduct?.specifications?.care ??
          'Keep away from harsh heat & wipe softly with microfiber',
        shipping: existingProduct?.specifications?.shipping ?? 'Ships in 2–5 business days',
      },
    };

    try {
      if (isEditing && id) {
        await updateProduct({
          ...productPayload,
          id,
          createdAt: existingProduct?.createdAt ?? new Date().toISOString().split('T')[0],
        });
      } else {
        await addProduct(productPayload);
      }
      navigate('/admin/products');
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E7C7CC] text-sm text-[#3E2F27] focus:outline-none focus:border-[#6D1836]';

  const hasCurrentCategoryInList = categories.some((c) => c.slug === category);

  return (
    <AdminLayout title={isEditing ? 'Edit / Replace Product' : 'Add New Creation'}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#7A655C] hover:text-[#6D1836]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Products</span>
          </button>
        </div>

        <form
          noValidate
          onSubmit={handleSubmit}
          className="bg-white border border-[#E7C7CC] rounded-3xl p-7 sm:p-9 shadow-warm space-y-6"
        >
          {error && (
            <p className="text-xs font-medium text-[#6D1836] bg-[#6D1836]/10 border border-[#6D1836]/25 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-[#7A655C] mb-1.5">
                Product Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                placeholder="Pressed Rose Resin Keepsake Tray"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#7A655C] mb-1.5">Subtitle</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className={inputClass}
                placeholder="Crystal resin & gold leaf accent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-medium text-[#7A655C] mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputClass}
              >
                {!hasCurrentCategoryInList && (
                  <option value={category}>{category}</option>
                )}
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#7A655C] mb-1.5">
                Product Type
              </label>
              <select
                value={productType}
                onChange={(e) => setProductType(e.target.value as ProductWorkType)}
                className={inputClass}
              >
                <option value="Handmade Keepsake">Handmade Keepsake</option>
                <option value="Custom Made">Custom Made</option>
                <option value="Original Artwork">Original Artwork</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#7A655C] mb-1.5">Badge</label>
              <select
                value={badge ?? ''}
                onChange={(e) => setBadge((e.target.value as Product['badge']) || undefined)}
                className={inputClass}
              >
                <option value="">None</option>
                <option value="Handmade">Handmade</option>
                <option value="Bestseller">Bestseller</option>
                <option value="Customizable">Customizable</option>
                <option value="Only 1 Left">Only 1 Left</option>
                <option value="Limited Run">Limited Run</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-medium text-[#7A655C] mb-1.5">
                Price (₹ INR) *
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={inputClass}
                min={1}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#7A655C] mb-1.5">
                Compare Price (₹)
              </label>
              <input
                type="number"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                className={inputClass}
                placeholder="Optional strike price"
                min={0}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#7A655C] mb-1.5">
                Stock Quantity *
              </label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className={inputClass}
                min={0}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-medium text-[#7A655C] mb-1.5">Medium</label>
              <input
                type="text"
                value={medium}
                onChange={(e) => setMedium(e.target.value)}
                className={inputClass}
                placeholder="Crystal Resin & Pressed Florals"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#7A655C] mb-1.5">Dimensions</label>
              <input
                type="text"
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
                className={inputClass}
                placeholder="6 × 8 inches"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#7A655C] mb-1.5">Material</label>
              <input
                type="text"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className={inputClass}
                placeholder="UV Resin, Gold Flakes"
              />
            </div>
          </div>

          <div className="space-y-4 bg-[#FFF9F5] border border-[#E7C7CC] rounded-2xl p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#3E2F27]">
                  Product Photo URL / Upload *
                </label>
                <p className="text-[11px] text-[#7A655C]">
                  Paste an image URL, upload a photo file directly to Supabase Storage, or choose a studio preset.
                </p>
              </div>
              <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#6D1836] hover:bg-[#541129] text-[#FFF9F5] text-xs font-medium cursor-pointer transition-colors shrink-0">
                {uploadingImage ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                <span>{uploadingImage ? 'Uploading...' : 'Upload Photo File'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileUpload}
                  className="sr-only"
                  disabled={uploadingImage}
                />
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="w-24 h-24 rounded-xl overflow-hidden border border-[#E7C7CC] bg-white shrink-0">
                <ResilientImage
                  src={imageUrl}
                  alt={name || 'Product photo preview'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 w-full space-y-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-[#7A655C] mb-1">
                    Primary Image URL
                  </label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className={inputClass}
                    placeholder="https://... or /assets/..."
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#7A655C] mb-1">
                    Secondary Hover Image URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={secondaryImageUrl}
                    onChange={(e) => setSecondaryImageUrl(e.target.value)}
                    className={inputClass}
                    placeholder="Leave blank to reuse primary image"
                  />
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs text-[#7A655C] mb-2">Or select a studio asset preset:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {SAMPLE_IMAGE_OPTIONS.map((img) => (
                  <button
                    key={img.label}
                    type="button"
                    onClick={() => setImageUrl(img.url)}
                    className={`p-2 rounded-xl border text-xs text-left truncate transition-colors ${
                      imageUrl === img.url
                        ? 'bg-[#6D1836]/10 border-[#6D1836] font-medium text-[#3E2F27]'
                        : 'bg-white border-[#E7C7CC] text-[#7A655C]'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5 mb-1 text-[#6D1836]" />
                    <span className="truncate block">{img.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#7A655C] mb-1.5">
              Description *
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputClass}
              placeholder="Detailed description of this handmade creation..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#7A655C] mb-1.5">Studio Story</label>
            <textarea
              rows={2}
              value={story}
              onChange={(e) => setStory(e.target.value)}
              className={inputClass}
              placeholder="Inspiration and crafting story..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#7A655C] mb-1.5">
              Maker&apos;s Note
            </label>
            <input
              type="text"
              value={artistNote}
              onChange={(e) => setArtistNote(e.target.value)}
              className={inputClass}
              placeholder="Crafted with thought, gifted with heart..."
            />
          </div>

          {error && (
            <p className="text-xs font-medium text-[#6D1836] bg-[#6D1836]/10 border border-[#6D1836]/25 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving || uploadingImage}
            className="w-full py-3.5 px-6 rounded-xl bg-[#6D1836] hover:bg-[#541129] disabled:opacity-60 text-[#FFF9F5] text-sm font-medium inline-flex items-center justify-center gap-2 shadow-warm transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>
              {saving
                ? 'Saving Changes...'
                : isEditing
                  ? 'Save Product Changes'
                  : 'Publish Product to Storefront'}
            </span>
          </button>
        </form>
      </div>
    </AdminLayout>
  );
};
