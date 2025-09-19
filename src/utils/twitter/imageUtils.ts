import { FabricImage, Rect, FabricText } from "fabric";
import { CANVAS_DIMENSIONS, LAYOUT } from './constants';

/**
 * Create content placeholder for failed image loads
 */
export const createContentImage = async (imageUrl: string): Promise<any> => {
  try {
    console.log('🖼️ Creating content placeholder for:', imageUrl);
    
    const placeholder = new FabricText('🖼️ Imagem gerada por IA', {
      left: LAYOUT.margin + 20,
      top: LAYOUT.positions.tweet.y + 400, // Below the text
      width: CANVAS_DIMENSIONS.width - (LAYOUT.margin * 2) - 40,
      fontSize: 28,
      fontFamily: 'Inter, sans-serif',
      fill: '#666666',
      textAlign: 'center',
      fontStyle: 'italic',
    });
    
    // Add background for the placeholder
    const background = new Rect({
      left: LAYOUT.margin,
      top: LAYOUT.positions.tweet.y + 380,
      width: CANVAS_DIMENSIONS.width - (LAYOUT.margin * 2),
      height: 100,
      fill: '#f8f9fa',
      stroke: '#e9ecef',
      strokeWidth: 2,
      rx: 12,
      ry: 12,
    });
    
    console.log('✅ Placeholder created successfully');
    return { background, placeholder };
    
  } catch (error) {
    console.warn('Failed to create content placeholder:', error);
    return null;
  }
};

/**
 * Create a background for content image area
 */
export const createContentImageBackground = (): Rect => {
  const containerWidth = CANVAS_DIMENSIONS.width - (LAYOUT.margin * 2);
  const containerHeight = 100;
  const containerTop = LAYOUT.positions.tweet.y + 380;
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