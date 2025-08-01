/**
 * Alternative image loading strategies for handling CORS issues
 */
import { generateTwitterStylePlaceholder } from '@/utils/enhancedFallbackGenerator';

export interface ProxyImageOptions {
  width?: number;
  height?: number;
  quality?: number;
}

/**
 * Create a CORS proxy URL for images using a public proxy service
 */
export const createProxyImageUrl = (imageUrl: string, options: ProxyImageOptions = {}): string => {
  try {
    // Use allorigins.win as a CORS proxy
    const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(imageUrl);
    console.log('Created proxy URL:', proxyUrl);
    return proxyUrl;
  } catch (error) {
    console.error('Failed to create proxy URL:', error);
    return imageUrl; // Fallback to original URL
  }
};

/**
 * Generate a fallback image as data URL when all other methods fail
 */
export const generateFallbackImage = (
  type: 'profile' | 'content', 
  text?: string
): string => {
  console.log(`🎨 Generating enhanced ${type} fallback image...`);
  
  try {
    return generateTwitterStylePlaceholder(type, text, {
      width: type === 'profile' ? 400 : 800,
      height: type === 'profile' ? 400 : 600,
      quality: 1.0
    });
  } catch (error) {
    console.error('Enhanced fallback generation failed, using simple fallback:', error);
    
    // Simple fallback as backup
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Canvas context not available');
    }

    if (type === 'profile') {
      canvas.width = 100;
      canvas.height = 100;
      
      ctx.fillStyle = '#1DA1F2';
      ctx.beginPath();
      ctx.arc(50, 50, 50, 0, 2 * Math.PI);
      ctx.fill();
      
      if (text) {
        const initials = text.substring(0, 2).toUpperCase();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(initials, 50, 50);
      }
    } else {
      canvas.width = 600;
      canvas.height = 400;
      
      ctx.fillStyle = '#f7f9fa';
      ctx.fillRect(0, 0, 600, 400);
      
      ctx.strokeStyle = '#e1e8ed';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, 598, 398);
      
      ctx.fillStyle = '#657786';
      ctx.font = '48px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🖼️', 300, 180);
      
      ctx.font = '16px system-ui';
      ctx.fillText('Image unavailable', 300, 240);
    }
    
    return canvas.toDataURL('image/png');
  }
};

/**
 * Convert image to base64 with fallbacks
 */
const convertToBase64 = async (imageUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }
        
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);
        
        const dataUrl = canvas.toDataURL('image/png', 1.0);
        resolve(dataUrl);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => reject(new Error('Image failed to load for base64 conversion'));
    img.src = imageUrl;
    
    // Timeout after 10 seconds
    setTimeout(() => reject(new Error('Base64 conversion timeout')), 10000);
  });
};

/**
 * Enhanced image loading with multiple fallback strategies and validation
 */
export const loadImageWithFallbacks = async (
  imageUrl: string,
  type: 'profile' | 'content' = 'content',
  username?: string
): Promise<string> => {
  console.log(`🔄 Loading image with enhanced fallbacks: ${imageUrl}`);
  
  const strategies = [
    {
      name: 'Original URL',
      execute: async () => {
        console.log(`📡 Trying original URL...`);
        await validateImageLoad(imageUrl);
        return imageUrl;
      }
    },
    {
      name: 'Base64 Conversion',
      execute: async () => {
        console.log(`🔄 Converting to base64...`);
        return await convertToBase64(imageUrl);
      }
    },
    {
      name: 'CORS Proxy',
      execute: async () => {
        console.log(`🌐 Trying CORS proxy...`);
        const proxyUrl = createProxyImageUrl(imageUrl);
        await validateImageLoad(proxyUrl);
        return proxyUrl;
      }
    },
    {
      name: 'Proxy + Base64',
      execute: async () => {
        console.log(`🔄🌐 Trying proxy with base64 conversion...`);
        const proxyUrl = createProxyImageUrl(imageUrl);
        return await convertToBase64(proxyUrl);
      }
    },
    {
      name: 'Generated Fallback',
      execute: async () => {
        console.log(`🎨 Generating fallback image...`);
        return generateFallbackImage(type, username);
      }
    }
  ];
  
  for (const [index, strategy] of strategies.entries()) {
    try {
      console.log(`🔄 Strategy ${index + 1}/${strategies.length}: ${strategy.name}`);
      
      const result = await strategy.execute();
      
      // Final validation for non-fallback strategies
      if (index < strategies.length - 1) {
        await validateImageLoad(result);
      }
      
      console.log(`✅ Strategy ${index + 1} (${strategy.name}) succeeded`);
      return result;
      
    } catch (error) {
      console.warn(`❌ Strategy ${index + 1} (${strategy.name}) failed:`, error);
      
      // If this is the last strategy, force return the fallback
      if (index === strategies.length - 1) {
        console.log('🚨 All strategies failed, forcing fallback generation');
        return generateFallbackImage(type, username);
      }
    }
  }
  
  // Absolute fallback - should never reach here
  console.error('🚨 Critical: All strategies failed, using emergency fallback');
  return generateFallbackImage(type, username);
};

/**
 * Validate that an image URL can be loaded
 */
const validateImageLoad = async (imageUrl: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        resolve();
      } else {
        reject(new Error('Image loaded but has invalid dimensions'));
      }
    };
    
    img.onerror = () => reject(new Error('Image failed to load'));
    
    // Set up image source with appropriate CORS handling
    if (imageUrl.startsWith('data:')) {
      img.src = imageUrl;
    } else {
      img.crossOrigin = 'anonymous';
      img.src = imageUrl;
    }
    
    // Timeout after 8 seconds
    setTimeout(() => reject(new Error('Image validation timeout')), 8000);
  });
};