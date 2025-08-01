import React from 'react';
import { createRoot } from 'react-dom/client';
import { TwitterPost } from '@/components/TwitterPost';
import { loadImageWithFallbacks } from './proxyImageService';

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
      console.log('🚀 Starting enhanced image processing pipeline...');
      
      // Use enhanced fallback system directly for all external images
      const processedParams = { ...params };
      
      // Process profile image with enhanced fallbacks
      if (params.profileImageUrl && params.profileImageUrl.startsWith('http')) {
        console.log('🖼️ Processing profile image with enhanced fallbacks...');
        try {
          processedParams.profileImageUrl = await loadImageWithFallbacks(
            params.profileImageUrl, 
            'profile', 
            params.username
          );
          console.log('✅ Profile image processing successful');
        } catch (error) {
          console.error('❌ Profile image processing failed completely:', error);
          processedParams.profileImageUrl = undefined;
        }
      }

      // Process content image with enhanced fallbacks
      if (params.contentImageUrl && params.contentImageUrl.startsWith('http')) {
        console.log('🖼️ Processing content image with enhanced fallbacks...');
        try {
          processedParams.contentImageUrl = await loadImageWithFallbacks(
            params.contentImageUrl, 
            'content'
          );
          console.log('✅ Content image processing successful');
        } catch (error) {
          console.error('❌ Content image processing failed completely:', error);
          processedParams.contentImageUrl = undefined;
        }
      }
      
      console.log('Image conversion completed:', {
        hasProfileImage: !!processedParams.profileImageUrl,
        hasContentImage: !!processedParams.contentImageUrl,
        profileImageType: processedParams.profileImageUrl?.substring(0, 30),
        contentImageType: processedParams.contentImageUrl?.substring(0, 30)
      });

      // Create a temporary container with improved visibility
      container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.top = '-2000px'; // Closer to viewport for better rendering
      container.style.left = '-2000px';
      container.style.width = '1080px';
      container.style.height = '1350px';
      container.style.pointerEvents = 'none';
      container.style.opacity = '0'; // Use opacity instead of visibility hidden
      container.style.zIndex = '-9999';
      container.style.overflow = 'visible';
      document.body.appendChild(container);

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

      console.log('Starting html2canvas rendering...');

      // Enhanced html2canvas configuration
      console.log('🎨 Starting html2canvas with enhanced configuration...');
      const html2canvas = await import('html2canvas');
      const canvas = await html2canvas.default(container, {
        width: 1080,
        height: 1350,
        scale: 1,
        useCORS: false, // Disabled since we pre-processed images
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: true, // Enable logging for debugging
        imageTimeout: 0, // Disabled since images are pre-validated
        foreignObjectRendering: true, // Enable for better text rendering
        removeContainer: false, // Keep container for debugging
        scrollX: 0,
        scrollY: 0,
        ignoreElements: (element) => {
          // Skip any elements that might cause issues
          return element.tagName === 'SCRIPT' || element.tagName === 'STYLE';
        },
        onclone: (clonedDoc) => {
          console.log('🔧 html2canvas clone setup: Configuring fonts and images...');
          
          // Add comprehensive font and image styles
          const style = clonedDoc.createElement('style');
          style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            * { 
              font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif !important;
              box-sizing: border-box !important;
              -webkit-font-smoothing: antialiased !important;
              -moz-osx-font-smoothing: grayscale !important;
            }
            img {
              max-width: 100% !important;
              height: auto !important;
              display: block !important;
              object-fit: cover !important;
              border: none !important;
              outline: none !important;
            }
            .rounded-full img {
              border-radius: 50% !important;
            }
            .rounded-2xl img {
              border-radius: 1rem !important;
            }
          `;
          clonedDoc.head.appendChild(style);
          
          // Validate and fix images in cloned document
          const images = clonedDoc.querySelectorAll('img');
          console.log(`🔍 Clone validation: Found ${images.length} images`);
          
          let validImages = 0;
          images.forEach((img, index) => {
            const isDataUrl = img.src.startsWith('data:');
            const isProxyUrl = img.src.includes('allorigins.win');
            const isValid = isDataUrl || isProxyUrl || img.src.startsWith('blob:');
            
            if (isValid) {
              validImages++;
              console.log(`✅ Image ${index + 1} validated: ${img.src.substring(0, 50)}...`);
            } else {
              console.warn(`⚠️ Image ${index + 1} may cause issues: ${img.src}`);
            }
          });
          
          console.log(`📊 Clone image validation: ${validImages}/${images.length} images ready for rendering`);
        }
      });

      console.log('html2canvas rendering completed, canvas size:', canvas.width, 'x', canvas.height);

      // Validate canvas content
      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error('Generated canvas has invalid dimensions');
      }

      // Convert canvas to blob with validation
      canvas.toBlob((blob) => {
        if (blob && blob.size > 5000) { // Increased minimum size requirement
          console.log('Image blob created successfully, size:', blob.size, 'bytes');
          cleanup();
          resolve(blob);
        } else {
          console.error('Generated blob is too small or invalid:', { 
            blob: !!blob, 
            size: blob?.size,
            canvasWidth: canvas.width,
            canvasHeight: canvas.height,
            canvasData: canvas.getContext('2d')?.getImageData(0, 0, 100, 100).data.slice(0, 20)
          });
          cleanup();
          reject(new Error(`Generated image is too small or invalid: ${blob?.size || 0} bytes (minimum 5000 required)`));
        }
      }, 'image/png', 1.0);

    } catch (error) {
      console.error('Error in renderTwitterPostToImage:', error);
      cleanup();
      reject(new Error(`Failed to render image: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  });
};