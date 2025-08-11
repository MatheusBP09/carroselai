/**
 * Service for downloading and converting external images to local URLs
 * Specifically designed to handle DALL-E and other CORS-restricted images
 */

interface ImageDownloadResult {
  success: boolean;
  localUrl?: string;
  dataUrl?: string;
  error?: string;
  method: 'fetch' | 'canvas' | 'proxy' | 'failed';
}

interface CacheEntry {
  localUrl: string;
  dataUrl: string;
  timestamp: number;
  originalUrl: string;
}

class ImageDownloadService {
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  /**
   * Downloads an external image and converts it to a local URL
   */
  async downloadAndConvertImage(imageUrl: string): Promise<ImageDownloadResult> {
    if (!imageUrl) {
      return { success: false, error: 'No image URL provided', method: 'failed' };
    }

    // Check cache first
    const cached = this.getFromCache(imageUrl);
    if (cached) {
      return {
        success: true,
        localUrl: cached.localUrl,
        dataUrl: cached.dataUrl,
        method: 'fetch'
      };
    }

    // Try direct fetch first
    try {
      const result = await this.downloadViaDirect(imageUrl);
      if (result.success) {
        this.addToCache(imageUrl, result.localUrl!, result.dataUrl!);
        return result;
      }
    } catch (error) {
      console.log('Direct download failed, trying canvas method:', error);
    }

    // Try canvas method
    try {
      const result = await this.downloadViaCanvas(imageUrl);
      if (result.success) {
        this.addToCache(imageUrl, result.localUrl!, result.dataUrl!);
        return result;
      }
    } catch (error) {
      console.log('Canvas download failed, trying proxy method:', error);
    }

    // Try proxy method
    try {
      const result = await this.downloadViaProxy(imageUrl);
      if (result.success) {
        this.addToCache(imageUrl, result.localUrl!, result.dataUrl!);
        return result;
      }
    } catch (error) {
      console.error('All download methods failed:', error);
    }

    return {
      success: false,
      error: 'All download methods failed',
      method: 'failed'
    };
  }

  /**
   * Direct fetch method - fastest when it works
   */
  private async downloadViaDirect(imageUrl: string): Promise<ImageDownloadResult> {
    const response = await fetch(imageUrl, {
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Accept': 'image/*'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const blob = await response.blob();
    if (blob.size < 100) {
      throw new Error('Downloaded blob too small, likely empty');
    }

    const localUrl = URL.createObjectURL(blob);
    const dataUrl = await this.blobToDataUrl(blob);

    return {
      success: true,
      localUrl,
      dataUrl,
      method: 'fetch'
    };
  }

  /**
   * Canvas method - draws image to canvas then extracts data URL
   */
  private async downloadViaCanvas(imageUrl: string): Promise<ImageDownloadResult> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          
          ctx.drawImage(img, 0, 0);
          
          const dataUrl = canvas.toDataURL('image/png', 1.0);
          
          // Convert data URL to blob then to object URL
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob from canvas'));
              return;
            }

            const localUrl = URL.createObjectURL(blob);
            
            resolve({
              success: true,
              localUrl,
              dataUrl,
              method: 'canvas'
            });
          }, 'image/png', 1.0);

        } catch (error) {
          reject(error);
        }
      };

      img.onerror = (error) => {
        reject(new Error(`Image load failed: ${error}`));
      };

      // Set crossOrigin before src to avoid CORS issues
      img.crossOrigin = 'anonymous';
      img.src = imageUrl;
    });
  }

  /**
   * Proxy method - uses a CORS proxy as fallback
   */
  private async downloadViaProxy(imageUrl: string): Promise<ImageDownloadResult> {
    const proxyUrls = [
      `https://cors-anywhere.herokuapp.com/${imageUrl}`,
      `https://api.allorigins.win/raw?url=${encodeURIComponent(imageUrl)}`,
      `https://proxy.cors.sh/${imageUrl}`
    ];

    for (const proxyUrl of proxyUrls) {
      try {
        const response = await fetch(proxyUrl, {
          headers: {
            'X-Requested-With': 'XMLHttpRequest'
          }
        });

        if (response.ok) {
          const blob = await response.blob();
          if (blob.size > 100) {
            const localUrl = URL.createObjectURL(blob);
            const dataUrl = await this.blobToDataUrl(blob);
            
            return {
              success: true,
              localUrl,
              dataUrl,
              method: 'proxy'
            };
          }
        }
      } catch (error) {
        console.log(`Proxy ${proxyUrl} failed:`, error);
        continue;
      }
    }

    throw new Error('All proxy methods failed');
  }

  /**
   * Converts blob to data URL
   */
  private async blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Cache management
   */
  private getFromCache(originalUrl: string): CacheEntry | null {
    const entry = this.cache.get(originalUrl);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > this.CACHE_DURATION;
    if (isExpired) {
      this.cache.delete(originalUrl);
      URL.revokeObjectURL(entry.localUrl);
      return null;
    }

    return entry;
  }

  private addToCache(originalUrl: string, localUrl: string, dataUrl: string): void {
    // Clean up old entry if exists
    const existing = this.cache.get(originalUrl);
    if (existing) {
      URL.revokeObjectURL(existing.localUrl);
    }

    this.cache.set(originalUrl, {
      localUrl,
      dataUrl,
      timestamp: Date.now(),
      originalUrl
    });
  }

  /**
   * Batch download multiple images
   */
  async downloadBatch(imageUrls: string[]): Promise<Map<string, ImageDownloadResult>> {
    const results = new Map<string, ImageDownloadResult>();
    
    const promises = imageUrls.map(async (url) => {
      const result = await this.downloadAndConvertImage(url);
      results.set(url, result);
      return { url, result };
    });

    await Promise.allSettled(promises);
    return results;
  }

  /**
   * Clean up cache and revoke object URLs
   */
  cleanup(): void {
    for (const entry of this.cache.values()) {
      URL.revokeObjectURL(entry.localUrl);
    }
    this.cache.clear();
  }
}

// Export singleton instance
export const imageDownloadService = new ImageDownloadService();
export type { ImageDownloadResult };