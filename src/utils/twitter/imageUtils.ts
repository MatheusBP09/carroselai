import { FabricImage, Rect, FabricText } from "fabric";
  import { CANVAS_DIMENSIONS, LAYOUT } from './constants';

  /**
   * Create content image with proper fallback handling
   */
  export const createContentImage = async (imageUrl: string): Promise<any> => {
    try {
      console.log('🖼️ Attempting to load content image:' , imageUrl);

      // Try to load the actual image first
      if (imageUrl && imageUrl !== '') {
        try {
          const contentImage = await FabricImage.fromURL(imageUrl, {
            crossOrigin: 'anonymous',
          });

          // Calculate optimal positioning and sizing
          const maxImageHeight = 300;
          const maxImageWidth = CANVAS_DIMENSIONS.width - (LAYOUT.margin * 2);
          const imageTop = LAYOUT.positions.tweet.y + 300; // Adjusted spacing below text

          // Calculate scale to fit within bounds
          const imageWidth = contentImage.width || 400;
          const imageHeight = contentImage.height || 300;
          const scaleX = maxImageWidth / imageWidth;
          const scaleY = maxImageHeight / imageHeight;
          const scale = Math.min(scaleX, scaleY, 1); // Don't upscale

          contentImage.set({
            left: LAYOUT.margin,
            top: imageTop,
            scaleX: scale,
            scaleY: scale,
            originX: 'left',
            originY: 'top',
          });

          console.log('✅ Content image loaded successfully', { scale, width: imageWidth * scale, height: imageHeight * scale });
          return { image: contentImage };

        } catch (imageError) {
          console.warn('Failed to load content image, using placeholder:', imageError);
          // Fall through to placeholder creation
        }
      }

      // Create improved placeholder for failed/missing images
      const placeholderText = new FabricText('🖼️ Imagem gerada por IA' , {
        left: CANVAS_DIMENSIONS.width / 2,
        top: LAYOUT.positions.tweet.y + 350,
        fontSize: 24,
        fontFamily: 'Inter, sans-serif',
        fill: '#6B7280',
        textAlign: 'center',
        fontStyle: 'italic',
        originX: 'center',
        originY: 'center',
      });

      // Improved background for placeholder
      const background = new Rect({
        left: LAYOUT.margin + 50,
        top: LAYOUT.positions.tweet.y + 320,
        width: CANVAS_DIMENSIONS.width - (LAYOUT.margin * 2) - 100,
        height: 80,
        fill: '#F9FAFB',
        stroke: '#E5E7EB',
        strokeWidth: 1,
        rx: 8,
        ry: 8,
      });

      console.log('✅ Placeholder created successfully');
      return { background, placeholder: placeholderText };

    } catch (error) {
      console.warn('Failed to create content image/placeholder:', error);
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