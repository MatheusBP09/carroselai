import React from 'react';
import { nodeToPng } from './nodeToImageService';
import { TwitterPostPreview } from '@/components/TwitterPostPreview';
import { createRoot } from 'react-dom/client';

export interface PreviewCaptureParams {
  username: string;
  handle: string;
  isVerified: boolean;
  text: string;
  profileImageUrl?: string;
  contentImageUrl?: string;
}

/**
 * Captures the TwitterPostPreview component that's working in the UI
 * and converts it to an image blob for download
 */
export const capturePreviewToImage = async (params: PreviewCaptureParams): Promise<Blob> => {
  console.log('🎯 Starting preview capture approach...');
  
  // Create a temporary container
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '-9999px';
  container.style.left = '-9999px';
  container.style.width = '400px';
  container.style.height = 'auto';
  container.style.backgroundColor = 'white';
  container.style.padding = '0';
  container.style.margin = '0';
  container.style.zIndex = '-1000';
  
  document.body.appendChild(container);

  try {
    // Create React root and render the preview component
    const root = createRoot(container);
    
    // Use a promise to wait for render completion
    await new Promise<void>((resolve) => {
    root.render(
      React.createElement(TwitterPostPreview, {
        username: params.username,
        handle: params.handle,
        isVerified: params.isVerified,
        text: params.text,
        profileImageUrl: params.profileImageUrl,
        contentImageUrl: params.contentImageUrl,
        hasImage: !!params.contentImageUrl,
        imagePosition: 'center',
        imageScale: 1
      })
    );
      
      // Wait for render and image loading
      setTimeout(resolve, 1000);
    });

    // Wait for images to load
    await waitForImagesInContainer(container);

    console.log('📸 Capturing rendered preview...');
    
    // Capture the rendered preview
    const blob = await nodeToPng(container, {
      width: 1080,
      height: 1350,
      backgroundColor: '#ffffff',
      pixelRatio: 2
    });

    console.log('✅ Preview captured successfully, size:', blob.size);
    
    // Cleanup
    root.unmount();
    document.body.removeChild(container);
    
    return blob;
    
  } catch (error) {
    console.error('❌ Preview capture failed:', error);
    
    // Cleanup on error
    try {
      document.body.removeChild(container);
    } catch (cleanupError) {
      console.warn('Cleanup error:', cleanupError);
    }
    
    throw error;
  }
};

/**
 * Wait for all images in container to load
 */
const waitForImagesInContainer = async (container: HTMLElement): Promise<void> => {
  const images = container.querySelectorAll('img');
  
  if (images.length === 0) {
    console.log('No images to wait for');
    return;
  }

  console.log(`Waiting for ${images.length} images to load...`);
  
  const imagePromises = Array.from(images).map((img) => {
    return new Promise<void>((resolve) => {
      if (img.complete && img.naturalHeight !== 0) {
        console.log('Image already loaded:', img.src.substring(0, 50));
        resolve();
      } else {
        const handleLoad = () => {
          console.log('Image loaded:', img.src.substring(0, 50));
          img.removeEventListener('load', handleLoad);
          img.removeEventListener('error', handleError);
          resolve();
        };
        
        const handleError = () => {
          console.warn('Image failed to load:', img.src.substring(0, 50));
          img.removeEventListener('load', handleLoad);
          img.removeEventListener('error', handleError);
          resolve(); // Continue even if image fails
        };
        
        img.addEventListener('load', handleLoad);
        img.addEventListener('error', handleError);
        
        // Timeout after 3 seconds
        setTimeout(() => {
          console.warn('Image load timeout:', img.src.substring(0, 50));
          img.removeEventListener('load', handleLoad);
          img.removeEventListener('error', handleError);
          resolve();
        }, 3000);
      }
    });
  });

  await Promise.all(imagePromises);
  console.log('All images processed');
};