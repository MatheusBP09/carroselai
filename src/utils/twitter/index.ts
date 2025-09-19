import { TwitterImageParams } from './types';
import { DEFAULT_METRICS } from './constants';
import { wrapText, generateRealisticMetrics } from './textUtils';
import { createProfileImage } from './profileUtils';
import { createEngagementMetrics } from './engagementUtils';
import { createContentImage } from './imageUtils';
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
    console.log('🚀 Starting Twitter image generation:', { username, handle, hasContent: !!contentImageUrl });
    
    // Create canvas and basic layout
    canvas = createCanvas();
    canvasElement = canvas.getElement();
    
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
    console.log('🏷️ Handle added:', handle);

    // Add tweet text with automatic sizing for square format
    const maxWidth = 880; // Almost full width: 1080 - 200 (margins)
    const wrappedText = wrapText(text, maxWidth, 40); // Use optimized font size
    const tweetText = createTweetText(wrappedText);
    
    // Calculate text height and adjust layout if needed
    const textHeight = tweetText.height || 0;
    const textLines = wrappedText.split('\n').length;
    console.log('📏 Text metrics:', { textHeight, textLines, wrappedLength: wrappedText.length });
    
    canvas.add(tweetText);
    console.log('💬 Tweet text added, length:', text.length);

    // Add content image placeholder if provided
    if (contentImageUrl) {
      console.log('🖼️ Adding content placeholder');
      const contentPlaceholder = await createContentImage(contentImageUrl);
      if (contentPlaceholder) {
        if (contentPlaceholder.background) {
          canvas.add(contentPlaceholder.background);
        }
        if (contentPlaceholder.placeholder) {
          canvas.add(contentPlaceholder.placeholder);
        }
        console.log('✅ Content placeholder added successfully');
      } else {
        console.warn('⚠️ Content placeholder failed to create');
      }
    }

    // Wait for all elements to be fully rendered
    console.log('⏳ Waiting for rendering to complete...');
    await new Promise(resolve => {
      canvas.renderAll();
      // Give extra time for any async operations
      setTimeout(resolve, 100);
    });

    console.log('🎨 Canvas objects count:', canvas.getObjects().length);

    // Generate high-quality image
    console.log('📸 Generating dataURL...');
    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2, // Higher resolution for better quality
    });

    console.log('✅ DataURL generated, length:', dataURL.length);

    return dataURL;
  } catch (error) {
    console.error('❌ Error generating Twitter image:', error);
    throw new Error('Failed to generate Twitter image');
  } finally {
    // Cleanup canvas and remove DOM element
    if (canvas) {
      canvas.dispose();
      console.log('🧹 Canvas disposed');
    }
    if (canvasElement && canvasElement.parentNode) {
      canvasElement.parentNode.removeChild(canvasElement);
      console.log('🧹 DOM element removed');
    }
  }
};

// Re-export types for convenience
export type { TwitterImageParams } from './types';