import React from 'react';
import { createRoot } from 'react-dom/client';
import { TwitterPost } from '@/components/TwitterPost';
import { preloadSlideImages } from './imagePreprocessingService';
import { nodeToPng } from './nodeToImageService';

interface RenderToImageParams {
  username: string;
  handle: string;
  isVerified: boolean;
  text: string;
  profileImageUrl?: string;
  contentImageUrl?: string;
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
 * Enhanced validation for image loading with better error handling
 */
const waitForImages = async (container: HTMLElement): Promise<ImageValidationResult> => {
  const images = Array.from(container.querySelectorAll('img'));
  
  if (images.length === 0) {
    console.log('✅ No images found in container, validation passed');
    return { isValid: true, hasImages: false, loadedImages: 0, totalImages: 0 };
  }

  console.log(`🔍 Enhanced image validation: Waiting for ${images.length} images to load...`);
  
  const imagePromises = images.map((img, index) => {
    return new Promise<{ loaded: boolean; error?: string }>((resolve) => {
      const imageId = `${index + 1}/${images.length}`;
      const imgSrcPreview = img.src.substring(0, 100);
      
      // Check if already loaded
      if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
        console.log(`✅ Image ${imageId} already loaded: ${imgSrcPreview}`);
        resolve({ loaded: true });
        return;
      }

      // Set up timeout with longer duration for external images
      const timeout = setTimeout(() => {
        console.warn(`⏰ Image ${imageId} loading timeout: ${imgSrcPreview}`);
        resolve({ loaded: false, error: 'timeout' });
      }, 15000); // Increased to 15 seconds

      img.onload = () => {
        clearTimeout(timeout);
        
        // Validate image dimensions
        if (img.naturalWidth > 0 && img.naturalHeight > 0) {
          console.log(`✅ Image ${imageId} loaded successfully: ${imgSrcPreview} (${img.naturalWidth}x${img.naturalHeight})`);
          resolve({ loaded: true });
        } else {
          console.error(`❌ Image ${imageId} loaded but has invalid dimensions: ${imgSrcPreview}`);
          resolve({ loaded: false, error: 'invalid_dimensions' });
        }
      };

      img.onerror = (error) => {
        clearTimeout(timeout);
        console.error(`❌ Image ${imageId} failed to load: ${imgSrcPreview}`, error);
        resolve({ loaded: false, error: 'load_failed' });
      };
      
      // Force image reload if it's not already loading
      if (!img.complete) {
        const originalSrc = img.src;
        img.src = '';
        img.src = originalSrc;
      }
    });
  });

  const results = await Promise.all(imagePromises);
  const loadedImages = results.filter(r => r.loaded).length;
  const failedImages = results.filter(r => !r.loaded);
  
  console.log(`📊 Image validation complete: ${loadedImages}/${images.length} images loaded successfully`);
  
  if (failedImages.length > 0) {
    console.warn(`⚠️ Failed images breakdown:`, {
      timeout: failedImages.filter(r => r.error === 'timeout').length,
      loadFailed: failedImages.filter(r => r.error === 'load_failed').length,
      invalidDimensions: failedImages.filter(r => r.error === 'invalid_dimensions').length
    });
  }
  
  return {
    isValid: loadedImages === images.length,
    hasImages: true,
    loadedImages,
    totalImages: images.length
  };
};

/**
 * Render TwitterPost component to a downloadable image
 */
export const renderTwitterPostToImage = async (params: RenderToImageParams): Promise<Blob> => {
  console.log('Starting image rendering for:', { 
    username: params.username, 
    hasProfileImage: !!params.profileImageUrl,
    hasContentImage: !!params.contentImageUrl 
  });

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
      console.log('🚀 Starting enhanced image preprocessing pipeline...');
      
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
      
      console.log('Image conversion completed:', {
        hasProfileImage: !!processedParams.profileImageUrl,
        hasContentImage: !!processedParams.contentImageUrl,
        profileImageType: processedParams.profileImageUrl?.substring(0, 30),
        contentImageType: processedParams.contentImageUrl?.substring(0, 30)
      });

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
      container.style.border = '1px solid red'; // Debug border
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
        React.createElement(TwitterPost, processedParams)
      );

      // Wait for DOM to be updated
      await new Promise(resolve => setTimeout(resolve, 100));

      // Enhanced image loading validation
      console.log('🔍 Starting comprehensive image validation...');
      const imageValidation = await waitForImages(container);
      
      if (imageValidation.hasImages) {
        if (!imageValidation.isValid) {
          console.warn(`⚠️ Image validation incomplete: ${imageValidation.loadedImages}/${imageValidation.totalImages} images loaded`);
          
          // If critical images failed, attempt to force fallbacks
          if (imageValidation.loadedImages === 0) {
            throw new Error('Critical error: No images loaded successfully. Cannot proceed with rendering.');
          }
        } else {
          console.log('✅ All images validated successfully');
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
      
      if (blob && blob.size > 5000) {
        console.log('✅ PNG blob created via nodeToImage:', { size: blob.size });
        cleanup();
        resolve(blob);
      } else {
        console.error('❌ Invalid PNG generated by nodeToImage', { size: blob?.size || 0 });
        cleanup();
        reject(new Error(`Invalid PNG generated: ${blob?.size || 0} bytes (minimum 5000 required)`));
      }

    } catch (error) {
      console.error('Error in renderTwitterPostToImage:', error);
      cleanup();
      reject(new Error(`Failed to render image: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  });
};