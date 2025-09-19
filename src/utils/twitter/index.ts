  import { TwitterImageParams } from './types';
  import { DEFAULT_METRICS, CANVAS_DIMENSIONS } from './constants';
  import { wrapText, generateRealisticMetrics } from './textUtils';
  import { createProfileImage } from './profileUtils';
  import { createEngagementMetrics } from './engagementUtils';
  import { createContentImage } from './imageUtils';
  import { TwitterImageDebugger } from './debugUtils';
  import {
    createCanvas,
    createTweetContainer,
    createUsernameText,
    createVerifiedBadge,
    createHandleAndTime,
    createTweetText,
  } from './layoutUtils';

  /**
   * Generate high-quality Twitter-style image for Instagram carousel
   */
  export const generateTwitterImage = async (params: TwitterImageParams): Promise<string> => {
    const { text, username, handle, isVerified, profileImageUrl, contentImageUrl } = params;

    let canvas: any = null;
    let canvasElement: HTMLCanvasElement | null = null;

    try {
      TwitterImageDebugger.clearLogs();
      TwitterImageDebugger.log('Starting Twitter image generation', { username, handle, hasContent: !!contentImageUrl });

      // Create canvas and basic layout
      canvas = createCanvas();
      canvasElement = canvas.getElement();

      // Validate initial canvas setup
      if (!TwitterImageDebugger.validateCanvas(canvas)) {
        throw new Error('Canvas validation failed');
      }

      console.log('📐 Canvas created:', { width: canvas.width, height: canvas.height, bg: canvas.backgroundColor });

      // Add tweet container
      const tweetContainer = createTweetContainer();
      canvas.add(tweetContainer);
      console.log('📦 Tweet container added');

      // Add profile image
      const profileImage = await createProfileImage(profileImageUrl);
      canvas.add(profileImage);
      console.log('👤 Profile image added');

      // Add username
      const usernameText = createUsernameText(username);
      canvas.add(usernameText);
      console.log('📝 Username added:', username);

      // Add verified badge if needed
      if (isVerified) {
        const [badge, checkmark] = createVerifiedBadge(usernameText);
        canvas.add(badge);
        canvas.add(checkmark);
        console.log('✅ Verified badge added');
      }

      // Add handle without timestamp
      const handleAndTime = createHandleAndTime(handle, '');
      canvas.add(handleAndTime);
      console.log('🏷️ Handle added:' , handle);

      // Add tweet text with dynamic sizing and proper wrapping
      const maxWidth = CANVAS_DIMENSIONS.width - (LAYOUT.margin * 2) - 40;
      const textLength = text.length;
      let fontSize = 40;

      // Dynamic font sizing based on content length
      if (textLength > 300) {
        fontSize = 28;
      } else if (textLength > 200) {
        fontSize = 32;
      } else if (textLength > 100) {
        fontSize = 36;
      }

      const wrappedText = wrapText(text, maxWidth, fontSize);
      const tweetText = createTweetText(wrappedText);

      // Calculate text metrics for better positioning
      const textHeight = tweetText.height || 0;
      const textLines = wrappedText.split('\n').length;
      console.log('📏 Text metrics:', { textHeight, textLines, fontSize, wrappedLength: wrappedText.length });

      canvas.add(tweetText);
      console.log('💬 Tweet text added with dynamic sizing, length:', text.length);

      // Add content image or placeholder if provided
      if (contentImageUrl) {
        console.log('🖼️ Processing content image:' , contentImageUrl);
        const contentResult = await createContentImage(contentImageUrl);
        if (contentResult) {
          // Add background first if it exists
          if (contentResult.background) {
            canvas.add(contentResult.background);
            console.log('🎨 Content background added');
          }

          // Add actual image or placeholder
          if (contentResult.image) {
            canvas.add(contentResult.image);
            console.log('✅ Actual content image loaded and added');
          } else if (contentResult.placeholder) {
            canvas.add(contentResult.placeholder);
            console.log('📝 Content placeholder added');
          }

          console.log('✅ Content processing completed successfully');
        } else {
          console.warn('⚠️ Content processing failed completely');
        }
      }

      // Get layout metrics for debugging
      const layoutMetrics = TwitterImageDebugger.getLayoutMetrics(canvas, text, fontSize);

      // Wait for all elements to be fully rendered
      TwitterImageDebugger.log('Waiting for rendering to complete');
      await new Promise(resolve => {
        canvas.renderAll();
        // Give extra time for any async operations and image loading
        setTimeout(resolve, 200); // Increased timeout for better stability
      });

      // Final validation before image generation
      if (!TwitterImageDebugger.validateCanvas(canvas)) {
        throw new Error('Final canvas validation failed');
      }

      TwitterImageDebugger.log('Canvas rendering completed', { objectCount: canvas.getObjects().length, metrics: layoutMetrics });

      // Generate high-quality image with improved settings
      TwitterImageDebugger.log('Generating high-quality dataURL');
      const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 2, // Higher resolution for Instagram quality
        enableRetinaScaling: false // Prevent double scaling
      });

      // Validate generated image
      if (!dataURL || !dataURL.startsWith('data:image/png')) {
        throw new Error('Generated dataURL is invalid');
      }

      TwitterImageDebugger.log('DataURL generated successfully', {
        length: dataURL.length,
        size: `${Math.round(dataURL.length / 1024)}KB`
      });

      return dataURL;
    } catch (error) {
      TwitterImageDebugger.error('Failed to generate Twitter image', error);
      // In development, download debug log for troubleshooting
      if (process.env.NODE_ENV === 'development') {
        TwitterImageDebugger.downloadDebugLog();
      }
      throw new Error(`Failed to generate Twitter image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      // Cleanup canvas and remove DOM element
      if (canvas) {
        canvas.dispose();
        TwitterImageDebugger.log('Canvas disposed');
      }
      if (canvasElement && canvasElement.parentNode) {
        canvasElement.parentNode.removeChild(canvasElement);
        TwitterImageDebugger.log('DOM element removed');
      }
    }
  };

  // Re-export types for convenience
  export type { TwitterImageParams } from './types';