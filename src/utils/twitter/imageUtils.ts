import { FabricImage, Rect } from "fabric";
import { CANVAS_DIMENSIONS, LAYOUT } from './constants';

/**
 * Create and position content image with proper aspect ratio and no distortion
 */
export const createContentImage = async (imageUrl: string): Promise<any> => {
  try {
    // Add timeout and better error handling
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Image load timeout')), 10000);
    });

    const imagePromise = FabricImage.fromURL(imageUrl, {
      crossOrigin: 'anonymous',
    });

    const contentImage = await Promise.race([imagePromise, timeoutPromise]);

    // Calculate container dimensions (below tweet text with better spacing)
    const containerWidth = CANVAS_DIMENSIONS.width - (LAYOUT.margin * 2);
    const containerHeight = 500; // Increased height for better image display
    const containerTop = LAYOUT.positions.tweet.y + 300; // More space below text for better layout
    const containerLeft = LAYOUT.margin;

    // Calculate scale to fit while maintaining aspect ratio
    const imageAspectRatio = (contentImage.width || 1) / (contentImage.height || 1);
    const containerAspectRatio = containerWidth / containerHeight;

    let finalWidth: number;
    let finalHeight: number;

    if (imageAspectRatio > containerAspectRatio) {
      // Image is wider - fit to width
      finalWidth = containerWidth;
      finalHeight = containerWidth / imageAspectRatio;
    } else {
      // Image is taller - fit to height
      finalHeight = containerHeight;
      finalWidth = containerHeight * imageAspectRatio;
    }

    // Center the image in the container
    const imageLeft = containerLeft + (containerWidth - finalWidth) / 2;
    const imageTop = containerTop + (containerHeight - finalHeight) / 2;

    contentImage.set({
      left: imageLeft,
      top: imageTop,
      width: finalWidth,
      height: finalHeight,
      originX: 'left',
      originY: 'top',
    });

    return contentImage;
  } catch (error) {
    console.warn('Failed to load content image:', error);
    
    // Create a placeholder rectangle instead of returning null
    const placeholder = new Rect({
      left: LAYOUT.margin,
      top: LAYOUT.positions.tweet.y + 300,
      width: CANVAS_DIMENSIONS.width - (LAYOUT.margin * 2),
      height: 300,
      fill: '#f0f0f0',
      stroke: '#e0e0e0',
      strokeWidth: 2,
      rx: 12,
      ry: 12,
    });
    
    return placeholder as any; // Return placeholder instead of null
  }
};

/**
 * Create a background for content image area
 */
export const createContentImageBackground = (): Rect => {
  const containerWidth = CANVAS_DIMENSIONS.width - (LAYOUT.margin * 2);
  const containerHeight = 400;
  const containerTop = LAYOUT.positions.tweet.y + 200;
  const containerLeft = LAYOUT.margin;

  return new Rect({
    left: containerLeft,
    top: containerTop,
    width: containerWidth,
    height: containerHeight,
    fill: 'transparent',
    stroke: 'transparent',
    strokeWidth: 0,
  });
};