/**
 * Specialized service for handling DALL-E image URLs with robust conversion to data URLs
 */

export interface DalleUrlResult {
  url: string;
  success: boolean;
  method: 'original' | 'fetch' | 'proxy' | 'fallback';
  error?: string;
}

/**
 * Detect if a URL is from DALL-E service
 */
export const isDalleUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  return url.includes('oaidalleapiprodscus.blob.core.windows.net') || 
         url.includes('dalle-api') ||
         url.includes('openai.com');
};

/**
 * Convert DALL-E URL to data URL with multiple strategies optimized for DALL-E
 */
export const convertDalleUrlToDataUrl = async (imageUrl: string): Promise<DalleUrlResult> => {
  console.log('🎨 Converting DALL-E URL to data URL:', imageUrl.substring(0, 100) + '...');
  
  // Strategy 1: Direct fetch with optimized CORS settings for DALL-E
  try {
    console.log('🔄 Trying direct fetch for DALL-E image...');
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(imageUrl, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
      signal: controller.signal,
      headers: {
        'Accept': 'image/*',
        'User-Agent': 'Mozilla/5.0 (compatible; carousel-generator)',
      }
    });
    
    clearTimeout(timeout);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    
    if (!blob || blob.size === 0) {
      throw new Error('Empty blob received from DALL-E');
    }
    
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to convert DALL-E blob to data URL'));
      reader.readAsDataURL(blob);
    });
    
    console.log('✅ DALL-E image converted successfully via direct fetch');
    return {
      url: dataUrl,
      success: true,
      method: 'fetch'
    };
    
  } catch (error) {
    console.warn('⚠️ Direct fetch failed for DALL-E image:', error);
  }
  
  // Strategy 2: Use CORS proxy specifically for DALL-E
  try {
    console.log('🔄 Trying CORS proxy for DALL-E image...');
    
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(imageUrl)}`;
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    
    const response = await fetch(proxyUrl, {
      signal: controller.signal,
      headers: {
        'Accept': 'image/*'
      }
    });
    
    clearTimeout(timeout);
    
    if (!response.ok) {
      throw new Error(`Proxy HTTP ${response.status}: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    
    if (!blob || blob.size === 0) {
      throw new Error('Empty blob received from proxy');
    }
    
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to convert proxy blob to data URL'));
      reader.readAsDataURL(blob);
    });
    
    console.log('✅ DALL-E image converted successfully via proxy');
    return {
      url: dataUrl,
      success: true,
      method: 'proxy'
    };
    
  } catch (error) {
    console.warn('⚠️ Proxy method failed for DALL-E image:', error);
  }
  
  // Strategy 3: Canvas-based conversion
  try {
    console.log('🔄 Trying canvas conversion for DALL-E image...');
    
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context unavailable'));
        return;
      }
      
      const timeout = setTimeout(() => {
        reject(new Error('Canvas conversion timeout for DALL-E image'));
      }, 12000);
      
      img.onload = () => {
        clearTimeout(timeout);
        try {
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          ctx.drawImage(img, 0, 0);
          const result = canvas.toDataURL('image/png', 0.95);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('Canvas image load failed'));
      };
      
      img.crossOrigin = 'anonymous';
      img.src = imageUrl;
    });
    
    console.log('✅ DALL-E image converted successfully via canvas');
    return {
      url: dataUrl,
      success: true,
      method: 'fetch'
    };
    
  } catch (error) {
    console.warn('⚠️ Canvas conversion failed for DALL-E image:', error);
  }
  
  // Strategy 4: Generate a simple fallback
  console.log('🎨 Generating fallback for failed DALL-E conversion...');
  
  // Create a simple gray placeholder as fallback
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    canvas.width = 800;
    canvas.height = 600;
    
    // Gray background
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, 800, 600);
    
    // Border
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, 798, 598);
    
    // Text
    ctx.fillStyle = '#6b7280';
    ctx.font = '24px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Image unavailable', 400, 300);
    
    const fallbackDataUrl = canvas.toDataURL('image/png');
    
    return {
      url: fallbackDataUrl,
      success: false,
      method: 'fallback',
      error: 'All conversion methods failed'
    };
  }
  
  throw new Error('Failed to convert DALL-E URL and could not generate fallback');
};

/**
 * Batch convert multiple DALL-E URLs
 */
export const batchConvertDalleUrls = async (urls: string[]): Promise<DalleUrlResult[]> => {
  console.log(`🔄 Batch converting ${urls.length} DALL-E URLs...`);
  
  const results = await Promise.allSettled(
    urls.map(url => convertDalleUrlToDataUrl(url))
  );
  
  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      console.error(`Failed to convert DALL-E URL ${index}:`, result.reason);
      return {
        url: '',
        success: false,
        method: 'fallback',
        error: result.reason instanceof Error ? result.reason.message : 'Unknown error'
      };
    }
  });
};