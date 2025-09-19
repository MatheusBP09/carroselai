import { FabricImage, Circle } from "fabric";
import { LAYOUT, TWITTER_COLORS } from './constants';

/**
 * Create and configure profile image with proper circular clipping
 */
export const createProfileImage = async (profileImageUrl?: string): Promise<FabricImage | Circle> => {
  const { profileSize } = LAYOUT;
  const { profile } = LAYOUT.positions;
  
  if (profileImageUrl) {
    try {
      const profileImage = await FabricImage.fromURL(profileImageUrl, {
        crossOrigin: 'anonymous',
      });
      
      // Create circular clip path
      const clipPath = new Circle({
        radius: profileSize / 2,
        originX: 'center',
        originY: 'center',
      });
      
      // Calculate scale to ensure image fills the circle
      const imageSize = Math.max(profileImage.width || 100, profileImage.height || 100);
      const scale = profileSize / imageSize;
      
      profileImage.set({
        left: profile.x,
        top: profile.y,
        originX: 'center',
        originY: 'center',
        scaleX: scale,
        scaleY: scale,
        clipPath: clipPath,
      });
      
      return profileImage;
    } catch (error) {
      console.warn('Failed to load profile image:', error);
    }
  }
  
  // Default profile circle with gradient-like effect
  return new Circle({
    left: profile.x,
    top: profile.y,
    radius: profileSize / 2,
    fill: TWITTER_COLORS.blue,
    originX: 'center',
    originY: 'center',
  });
};

/**
 * Generate a random avatar color for default profiles
 */
export const getRandomAvatarColor = (): string => {
  const colors = [
    TWITTER_COLORS.blue,
    '#7856FF', // Purple
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#45B7D1', // Light Blue
    '#96CEB4', // Green
    '#FFEAA7', // Yellow
    '#DDA0DD', // Plum
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
};