import { TwitterImageParams } from './types';
import { DEFAULT_METRICS } from './constants';
import { wrapText, generateRealisticMetrics } from './textUtils';
import { createProfileImage } from './profileUtils';
import { createEngagementMetrics } from './engagementUtils';
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
  const { text, username, handle, isVerified, profileImageUrl } = params;

  try {
    // Create canvas and basic layout
    const canvas = createCanvas();
    
    // Add tweet container
    const tweetContainer = createTweetContainer();
    canvas.add(tweetContainer);

    // Add profile image
    const profileImage = await createProfileImage(profileImageUrl);
    canvas.add(profileImage);

    // Add username
    const usernameText = createUsernameText(username);
    canvas.add(usernameText);

    // Add verified badge if needed
    if (isVerified) {
      const [badge, checkmark] = createVerifiedBadge(usernameText);
      canvas.add(badge);
      canvas.add(checkmark);
    }

    // Add handle without timestamp
    const handleAndTime = createHandleAndTime(handle, '');
    canvas.add(handleAndTime);

    // Add tweet text with proper wrapping
    const maxWidth = 820;
    const wrappedText = wrapText(text, maxWidth, 28);
    const tweetText = createTweetText(wrappedText);
    canvas.add(tweetText);

    // Generate high-quality image
    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2, // Higher resolution for better quality
    });

    // Cleanup
    canvas.dispose();
    
    return dataURL;
  } catch (error) {
    console.error('Error generating Twitter image:', error);
    throw new Error('Failed to generate Twitter image');
  }
};

// Re-export types for convenience
export type { TwitterImageParams } from './types';