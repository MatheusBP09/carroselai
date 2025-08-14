import { FabricImage, Rect } from "fabric";
import { CANVAS_DIMENSIONS, LAYOUT } from './constants';

/**
 * Create and position content image with proper aspect ratio and no distortion
 */
export const createContentImage = async (imageUrl: string): Promise<FabricImage | null> => {
  try {
    const contentImage = await FabricImage.fromURL(imageUrl, {
      crossOrigin: 'anonymous',
    });

    // Calculate container dimensions (below tweet text)
    const containerWidth = CANVAS_DIMENSIONS.width - (LAYOUT.margin * 2);
    const containerHeight = 400; // Fixed height for image container
    const containerTop = LAYOUT.positions.tweet.y + 200; // Position below tweet text
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
    return null;
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