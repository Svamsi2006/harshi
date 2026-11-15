/**
 * Compresses an uploaded image file to a lightweight JPEG data URL and attempts
 * to persist it into Supabase Storage via `/api/uploads/photo`.
 * Falls back cleanly to the compressed data URL if offline or storage isn't ready.
 */
async function compressImageToDataUrl(file: File, maxDim = 1100, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read selected file.'));
    reader.onload = () => {
      const rawUrl = typeof reader.result === 'string' ? reader.result : '';
      if (!rawUrl) {
        reject(new Error('Empty image file.'));
        return;
      }

      const img = new Image();
      img.onerror = () => resolve(rawUrl);
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const targetW = Math.max(1, Math.round(img.width * scale));
        const targetH = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(rawUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, targetW, targetH);
        try {
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        } catch {
          resolve(rawUrl);
        }
      };
      img.src = rawUrl;
    };
    reader.readAsDataURL(file);
  });
}

export async function uploadStudioPhoto(
  file: File,
  folder: 'custom-orders' | 'products' = 'custom-orders'
): Promise<{ url: string; storedInSupabase: boolean }> {
  const compressedDataUrl = await compressImageToDataUrl(file);

  try {
    const res = await fetch('/api/uploads/photo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: file.name,
        dataUrl: compressedDataUrl,
        folder,
      }),
    });
    if (res.ok) {
      const json = await res.json();
      if (json?.ok && typeof json.url === 'string' && json.url.startsWith('http')) {
        return { url: json.url, storedInSupabase: true };
      }
    }
  } catch {
    // Fall back to compressed data URL
  }

  return { url: compressedDataUrl, storedInSupabase: false };
}
