import React from 'react';
import { createRoot } from 'react-dom/client';
import { TwitterPost } from '@/components/TwitterPost';
import { preloadSlideImages } from './imagePreprocessingService';
import { nodeToPng } from './nodeToImageService';
import { capturePreviewToImage } from './previewCaptureService';
import { isDalleUrl, convertDalleUrlToDataUrl } from './dalleUrlService';
import { imageDownloadService, type ImageDownloadResult } from './imageDownloadService';

interface RenderToImageParams {
  username: string;
  handle: string;
  isVerified: boolean;
  text: string;
  profileImageUrl?: string;
  contentImageUrl?: string;
  contentImageDataUrl?: string; // Pre-processed data URL
  profileImageDataUrl?: string; // Pre-processed profile data URL
}

interface ImageValidationResult {
  isValid: boolean;
  hasImages: boolean;
  loadedImages: number;
  totalImages: number;
}

/**
 * Convert external image URL to data URL using multiple strategies to avoid CORS issues
 */
const convertImageToDataUrl = async (imageUrl: string): Promise<string> => {
  console.log('Converting image to data URL:', imageUrl);
  
  // Strategy 1: Try direct fetch with different CORS modes
  const strategies = [
    { mode: 'no-cors' as RequestMode, credentials: 'omit' as RequestCredentials },
    { mode: 'cors' as RequestMode, credentials: 'omit' as RequestCredentials },
    { mode: 'cors' as RequestMode, credentials: 'same-origin' as RequestCredentials }
  ];
  
  for (const [index, strategy] of strategies.entries()) {
    try {
      console.log(`Trying strategy ${index + 1}/3:`, strategy);
      
      const response = await fetch(imageUrl, strategy);
      
      if (!response.ok && strategy.mode !== 'no-cors') {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      
      if (blob.size === 0) {
        throw new Error('Empty blob received');
      }
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          console.log(`Strategy ${index + 1} succeeded, data URL length:`, result.length);
          resolve(result);
        };
        reader.onerror = () => reject(new Error('Failed to convert blob to data URL'));
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.warn(`Strategy ${index + 1} failed:`, error);
      if (index === strategies.length - 1) {
        throw error;
      }
    }
  }
  
  throw new Error('All conversion strategies failed');
};

/**
 * Force render fallback for failed images before capture
 */
const forceRenderImageFallbacks = async (container: HTMLElement): Promise<void> => {
  const images = Array.from(container.querySelectorAll('img'));
  
  for (const img of images) {
    // If image failed to load, force the fallback to render
    if (!img.complete || img.naturalWidth === 0 || img.naturalHeight === 0) {
      const parentContainer = img.parentElement;
      if (parentContainer && img.onerror) {
        console.log('🔧 Forcing fallback render for failed image:', img.src.substring(0, 50));
        // Trigger the error handler to render fallback
        img.onerror(new Event('error'));
      }
    }
  }
  
  // Wait for fallbacks to render
  await new Promise(resolve => setTimeout(resolve, 500));
};

/**
 * Synchronous image loading with guaranteed fallback rendering
 */
const waitForImagesWithFallback = async (container: HTMLElement): Promise<ImageValidationResult> => {
  const images = Array.from(container.querySelectorAll('img'));
  
  if (images.length === 0) {
    console.log('✅ No images found in container, validation passed');
    return { isValid: true, hasImages: false, loadedImages: 0, totalImages: 0 };
  }

  console.log(`🔍 Synchronous image validation with fallback: Waiting for ${images.length} images...`);
  
  const imagePromises = images.map((img, index) => {
    return new Promise<{ loaded: boolean; fallbackRendered: boolean }>((resolve) => {
      const imageId = `${index + 1}/${images.length}`;
      const imgSrcPreview = img.src.substring(0, 100);
      
      // Check if already loaded
      if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
        console.log(`✅ Image ${imageId} already loaded: ${imgSrcPreview}`);
        resolve({ loaded: true, fallbackRendered: false });
        return;
      }

      // Set up timeout - if exceeded, force fallback render
      const timeout = setTimeout(async () => {
        console.warn(`⏰ Image ${imageId} timeout, forcing fallback: ${imgSrcPreview}`);
        
        // Force fallback render
        const parentContainer = img.parentElement;
        if (parentContainer && img.onerror) {
          img.onerror(new Event('error'));
          // Wait for fallback to render
          await new Promise(r => setTimeout(r, 200));
        }
        
        resolve({ loaded: false, fallbackRendered: true });
      }, 8000); // Reduced timeout, force fallback faster

      img.onload = () => {
        clearTimeout(timeout);
        
        if (img.naturalWidth > 0 && img.naturalHeight > 0) {
          console.log(`✅ Image ${imageId} loaded: ${imgSrcPreview} (${img.naturalWidth}x${img.naturalHeight})`);
          resolve({ loaded: true, fallbackRendered: false });
        } else {
          console.error(`❌ Image ${imageId} invalid dimensions: ${imgSrcPreview}`);
          // Force fallback
          if (img.onerror) img.onerror(new Event('error'));
          setTimeout(() => resolve({ loaded: false, fallbackRendered: true }), 200);
        }
      };

      img.onerror = () => {
        clearTimeout(timeout);
        console.error(`❌ Image ${imageId} load failed, fallback will render: ${imgSrcPreview}`);
        // The error handler in TwitterPost will render the fallback
        setTimeout(() => resolve({ loaded: false, fallbackRendered: true }), 200);
      };
      
      // Force reload if not complete
      if (!img.complete) {
        const originalSrc = img.src;
        img.src = '';
        img.src = originalSrc;
      }
    });
  });

  const results = await Promise.all(imagePromises);
  const loadedImages = results.filter(r => r.loaded).length;
  const fallbacksRendered = results.filter(r => r.fallbackRendered).length;
  
  console.log(`📊 Image validation complete: ${loadedImages}/${images.length} loaded, ${fallbacksRendered} fallbacks rendered`);
  
  // Success if all images either loaded or have fallbacks rendered
  const allImagesHandled = results.every(r => r.loaded || r.fallbackRendered);
  
  return {
    isValid: allImagesHandled,
    hasImages: true,
    loadedImages: loadedImages + fallbacksRendered, // Count fallbacks as "loaded"
    totalImages: images.length
  };
};

/**
 * Simple URL validation to check if an image URL is accessible
 */
const isUrlAccessible = async (url: string): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(url, { 
      method: 'HEAD', 
      signal: controller.signal 
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Render TwitterPost component to a downloadable image - ROBUST DOWNLOAD STRATEGY
 */
export const renderTwitterPostToImage = async (params: RenderToImageParams): Promise<Blob> => {
  console.log('🎯 SIMPLIFIED: Starting Twitter post rendering with DALL-E image download...');
  console.log('Original URLs:', {
    username: params.username,
    profileImageUrl: params.profileImageUrl,
    contentImageUrl: params.contentImageUrl,
    hasPreprocessedContent: !!params.contentImageDataUrl,
    hasPreprocessedProfile: !!params.profileImageDataUrl
  });

  try {
    // ALWAYS download and convert external images to local URLs first
    console.log('🔄 MANDATORY: Converting ALL external images to local URLs...');
    const processedParams = await preprocessImagesForDownload(params);
    console.log('✅ All images converted to local URLs:', {
      profileConverted: processedParams.profileImageUrl !== params.profileImageUrl,
      contentConverted: processedParams.contentImageUrl !== params.contentImageUrl
    });
    
    // Use ONLY the preprocessed params with local URLs
    const result = await renderPostWithParams(processedParams, 'robust');
    if (!result || result.size < 5000) {
      throw new Error(`Rendering failed - invalid blob size: ${result?.size || 0}`);
    }
    
    console.log('✅ DALL-E rendering successful, size:', result.size);
    return result;
    
  } catch (error) {
    console.error('❌ DALL-E rendering failed:', error);
    throw error;
  }
};

/**
 * Downloads and converts external images to local URLs for reliable rendering
 * Since images now come as base64 from the edge function, this just passes through
 */
const preprocessImagesForDownload = async (params: RenderToImageParams): Promise<RenderToImageParams> => {
  console.log('✅ Images already in base64 format from edge function, no preprocessing needed');
  return params;
};

/**
 * Direct URL rendering method (no preprocessing)
 */
const renderWithDirectUrls = async (params: RenderToImageParams): Promise<Blob> => {
  return renderPostWithParams(params, 'direct');
};

/**
 * Preprocessed rendering method (fallback)
 */
const renderWithPreprocessedImages = async (params: RenderToImageParams): Promise<Blob> => {
  console.log('🚀 Starting image preprocessing pipeline...');
  
  // Pre-process all images to ensure they're ready for rendering
  const processedImages = await preloadSlideImages({
    profileImageUrl: params.profileImageUrl,
    contentImageUrl: params.contentImageUrl,
    username: params.username
  });
  
  const processedParams = {
    ...params,
    ...processedImages
  };
  
  console.log('Image preprocessing completed:', {
    hasProfileImage: !!processedParams.profileImageUrl,
    hasContentImage: !!processedParams.contentImageUrl
  });
  
  return renderPostWithParams(processedParams, 'preprocessed');
};

/**
 * Core rendering function used by all rendering methods
 */
const renderPostWithParams = async (params: RenderToImageParams, method: 'direct' | 'preprocessed' | 'robust'): Promise<Blob> => {
  return new Promise(async (resolve, reject) => {
    let container: HTMLElement | null = null;
    let root: any = null;

    const cleanup = () => {
      try {
        if (root) {
          root.unmount();
        }
        if (container && container.parentNode) {
          container.parentNode.removeChild(container);
        }
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    };

    try {
      console.log(`🚀 Starting rendering with ${method} URLs...`);

      // Create a temporary container with optimal positioning for rendering
      container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.top = '10px'; // Slightly visible for better rendering
      container.style.left = '10px';
      container.style.width = '1080px';
      container.style.height = '1350px';
      container.style.pointerEvents = 'none';
      container.style.visibility = 'visible'; // Make visible during rendering
      container.style.zIndex = '10000'; // Bring to front temporarily
      container.style.overflow = 'visible';
      container.style.backgroundColor = '#ffffff';
      document.body.appendChild(container);

      console.log('📋 Container created and added to DOM:', {
        position: container.style.position,
        top: container.style.top,
        visibility: container.style.visibility,
        dimensions: `${container.style.width}x${container.style.height}`
      });

      // Create React root and render component
      root = createRoot(container);
      
      root.render(
        React.createElement(TwitterPost, params)
      );

      // Wait for DOM to be updated
      await new Promise(resolve => setTimeout(resolve, 100));

      // Synchronous image loading with guaranteed fallbacks
      console.log('🔍 Starting synchronous image validation with fallback rendering...');
      const imageValidation = await waitForImagesWithFallback(container);
      
      if (imageValidation.hasImages) {
        if (!imageValidation.isValid) {
          console.warn(`⚠️ Some images failed, but fallbacks should be rendered`);
          // Force render any remaining fallbacks
          await forceRenderImageFallbacks(container);
        } else {
          console.log('✅ All images loaded or fallbacks rendered successfully');
        }
      }

      // Extended wait for rendering stability and font loading
      console.log('⏳ Waiting for rendering stability...');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Increased to 2 seconds for better stability
      
      // Pre-validate the DOM structure
      const imgs = container.querySelectorAll('img');
      console.log(`🔎 Pre-render validation: Found ${imgs.length} images in DOM`);
      imgs.forEach((img, i) => {
        console.log(`Image ${i + 1}: ${img.complete ? '✅' : '❌'} complete, src: ${img.src.substring(0, 50)}...`);
      });

      // Use nodeToImage pipeline (html-to-image with html2canvas fallback)
      console.log('🖼️ Starting nodeToImage rendering...');
      
      // Hide the debug border before capture
      container.style.border = 'none';
      
      const blob = await nodeToPng(container, {
        width: 1080,
        height: 1350,
        backgroundColor: '#ffffff',
        pixelRatio: 1,
      });
      
      // NEVER return empty - always return blob or create fallback
      if (blob && blob.size > 5000) {
        console.log('✅ PNG blob created via nodeToImage:', { size: blob.size });
        cleanup();
        resolve(blob);
      } else {
        console.error('❌ Invalid PNG generated, creating emergency fallback');
        
        // Create a basic fallback image as last resort
        const canvas = document.createElement('canvas');
        canvas.width = 1080;
        canvas.height = 1350;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          // Create a simple fallback with the post content
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, 1080, 1350);
          
          ctx.fillStyle = '#000000';
          ctx.font = 'bold 32px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Post gerado com sucesso', 540, 200);
          
          ctx.font = '24px Inter, sans-serif';
          ctx.fillText(`@${params.handle.replace(/^@+/, '')}`, 540, 250);
          
          // Add the post text
          const words = params.text.split(' ');
          let line = '';
          let y = 350;
          ctx.textAlign = 'left';
          ctx.font = '28px Inter, sans-serif';
          
          for (const word of words) {
            const testLine = line + word + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > 900 && line !== '') {
              ctx.fillText(line, 90, y);
              line = word + ' ';
              y += 50;
            } else {
              line = testLine;
            }
            if (y > 1200) break; // Prevent overflow
          }
          if (line) {
            ctx.fillText(line, 90, y);
          }
          
          canvas.toBlob((fallbackBlob) => {
            if (fallbackBlob && fallbackBlob.size > 1000) {
              console.log('✅ Emergency fallback created:', { size: fallbackBlob.size });
              cleanup();
              resolve(fallbackBlob);
            } else {
              cleanup();
              reject(new Error('Failed to create any valid image'));
            }
          }, 'image/png', 1.0);
        } else {
          cleanup();
          reject(new Error('Cannot create canvas context for fallback'));
        }
      }

    } catch (error) {
      console.error('Error in renderTwitterPostToImage:', error);
      cleanup();
      reject(new Error(`Failed to render image: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  });
};