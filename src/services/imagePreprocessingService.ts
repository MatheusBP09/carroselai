/**
 * Enhanced image preprocessing service for reliable downloads
 * Converts all images to base64 before rendering to avoid CORS and loading issues
 */

import { generateTwitterStylePlaceholder } from '@/utils/enhancedFallbackGenerator';

export interface ImageProcessingResult {
  url: string;
  isOriginal: boolean;
  isFallback: boolean;
  method: 'original' | 'base64' | 'proxy' | 'fallback';
}

/**
 * Enhanced image cache for storing processed images
 */
class ImageCache {
  private cache = new Map<string, ImageProcessingResult>();
  private maxSize = 50; // Limit cache size

  set(key: string, value: ImageProcessingResult) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  get(key: string): ImageProcessingResult | undefined {
    return this.cache.get(key);
  }

  clear() {
    this.cache.clear();
  }
}

const imageCache = new ImageCache();

/**
 * Fetch image as Data URL (CORS-safe) using fetch -> blob -> FileReader
 */
const fetchImageAsDataUrl = async (
  imageUrl: string,
  timeout = 12000
): Promise<string> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(imageUrl, { mode: 'cors', credentials: 'omit', signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const blob = await res.blob();
    if (!blob || blob.size === 0) throw new Error('Empty blob received');

    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to convert blob to data URL'));
      reader.readAsDataURL(blob);
    });
  } finally {
    clearTimeout(timer);
  }
};

/**
 * Fetch image via proxy and return Data URL
 */
const fetchViaProxyAsDataUrl = async (
  imageUrl: string,
  timeout = 12000
): Promise<string> => {
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(imageUrl)}`;
  return fetchImageAsDataUrl(proxyUrl, timeout);
};

/**
 * Convert image to base64 with increased timeout and better error handling
 */
const convertImageToBase64 = async (
  imageUrl: string, 
  timeout = 15000
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context unavailable'));
      return;
    }

    const timeoutId = setTimeout(() => {
      reject(new Error(`Image loading timeout after ${timeout}ms`));
    }, timeout);

    img.onload = () => {
      clearTimeout(timeoutId);
      try {
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/png', 0.9);
        resolve(dataUrl);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      clearTimeout(timeoutId);
      reject(new Error('Failed to load image'));
    };

    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
  });
};

/**
 * Process a single image with multiple fallback strategies
 */
export const processImage = async (
  imageUrl: string,
  type: 'profile' | 'content' = 'content',
  username?: string
): Promise<ImageProcessingResult> => {
  // Check cache first
  const cacheKey = `${imageUrl}-${type}-${username || ''}`;
  const cached = imageCache.get(cacheKey);
  if (cached) {
    console.log(`📦 Using cached image for ${type}:`, imageUrl);
    return cached;
  }

  console.log(`🔄 Processing ${type} image:`, imageUrl);

  // Strategy 1: Try original URL if it's a data URL
  if (imageUrl.startsWith('data:')) {
    const result: ImageProcessingResult = {
      url: imageUrl,
      isOriginal: true,
      isFallback: false,
      method: 'original'
    };
    imageCache.set(cacheKey, result);
    return result;
  }

  // Strategy 2A: Fetch -> Blob -> DataURL (CORS-safe)
  try {
    console.log(`🔄 Fetching ${type} image as data URL (CORS-safe)...`);
    const dataUrl = await fetchImageAsDataUrl(imageUrl, 12000);
    const result: ImageProcessingResult = {
      url: dataUrl,
      isOriginal: false,
      isFallback: false,
      method: 'base64'
    };
    imageCache.set(cacheKey, result);
    console.log(`✅ ${type} image fetched and converted successfully`);
    return result;
  } catch (error) {
    console.warn(`⚠️ Fetch->DataURL failed for ${type} image:`, error);
  }

  // Strategy 2B: Proxy fetch -> DataURL
  try {
    console.log(`🔄 Fetching via proxy for ${type} image...`);
    const proxyDataUrl = await fetchViaProxyAsDataUrl(imageUrl, 12000);
    const result: ImageProcessingResult = {
      url: proxyDataUrl,
      isOriginal: false,
      isFallback: false,
      method: 'proxy'
    };
    imageCache.set(cacheKey, result);
    console.log(`✅ ${type} image loaded via proxy (fetch) successfully`);
    return result;
  } catch (error) {
    console.warn(`⚠️ Proxy fetch method failed for ${type} image:`, error);
  }

  // Strategy 3: Convert to base64 via canvas
  try {
    console.log(`🔄 Converting ${type} image to base64 via canvas...`);
    const base64Url = await convertImageToBase64(imageUrl, 10000);
    const result: ImageProcessingResult = {
      url: base64Url,
      isOriginal: false,
      isFallback: false,
      method: 'base64'
    };
    imageCache.set(cacheKey, result);
    console.log(`✅ ${type} image converted to base64 (canvas) successfully`);
    return result;
  } catch (error) {
    console.warn(`⚠️ Canvas base64 conversion failed for ${type} image:`, error);
  }

  // Strategy 4: Try proxy URL via canvas
  try {
    console.log(`🔄 Trying proxy via canvas for ${type} image...`);
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(imageUrl)}`;
    const base64Url = await convertImageToBase64(proxyUrl, 8000);
    const result: ImageProcessingResult = {
      url: base64Url,
      isOriginal: false,
      isFallback: false,
      method: 'proxy'
    };
    imageCache.set(cacheKey, result);
    console.log(`✅ ${type} image loaded via proxy (canvas) successfully`);
    return result;
  } catch (error) {
    console.warn(`⚠️ Proxy canvas method failed for ${type} image:`, error);
  }

  // Strategy 5: Generate elegant fallback
  console.log(`🎨 Generating elegant fallback for ${type} image...`);
  const fallbackUrl = generateTwitterStylePlaceholder(type, username, {
    width: type === 'profile' ? 400 : 800,
    height: type === 'profile' ? 400 : 600,
    quality: 1.0
  });

  const result: ImageProcessingResult = {
    url: fallbackUrl,
    isOriginal: false,
    isFallback: true,
    method: 'fallback'
  };
  imageCache.set(cacheKey, result);
  console.log(`✅ Elegant ${type} fallback generated`);
  return result;
};

/**
 * Batch process multiple images
 */
export const batchProcessImages = async (
  images: Array<{ url: string; type: 'profile' | 'content'; username?: string }>
): Promise<ImageProcessingResult[]> => {
  console.log('🔄 Batch processing images...', images.length);
  
  const results = await Promise.allSettled(
    images.map(img => processImage(img.url, img.type, img.username))
  );

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      console.error(`Failed to process image ${index}:`, result.reason);
      // Return fallback
      return {
        url: generateTwitterStylePlaceholder(images[index].type, images[index].username),
        isOriginal: false,
        isFallback: true,
        method: 'fallback'
      };
    }
  });
};

/**
 * Clear the image cache
 */
export const clearImageCache = () => {
  imageCache.clear();
  console.log('🗑️ Image cache cleared');
};

/**
 * Pre-load images for a slide to ensure they're ready for download
 */
export const preloadSlideImages = async (slideData: {
  profileImageUrl?: string;
  contentImageUrl?: string;
  username: string;
}): Promise<{
  profileImageUrl?: string;
  contentImageUrl?: string;
}> => {
  console.log('🚀 Pre-loading slide images...');
  
  const imagesToProcess = [];
  
  if (slideData.profileImageUrl) {
    imagesToProcess.push({
      url: slideData.profileImageUrl,
      type: 'profile' as const,
      username: slideData.username
    });
  }
  
  if (slideData.contentImageUrl) {
    imagesToProcess.push({
      url: slideData.contentImageUrl,
      type: 'content' as const
    });
  }

  if (imagesToProcess.length === 0) {
    return {};
  }

  const results = await batchProcessImages(imagesToProcess);
  
  const processedData: { profileImageUrl?: string; contentImageUrl?: string } = {};
  
  let resultIndex = 0;
  if (slideData.profileImageUrl) {
    processedData.profileImageUrl = results[resultIndex].url;
    resultIndex++;
  }
  
  if (slideData.contentImageUrl) {
    processedData.contentImageUrl = results[resultIndex].url;
  }

  console.log('✅ Slide images pre-loaded successfully');
  return processedData;
};