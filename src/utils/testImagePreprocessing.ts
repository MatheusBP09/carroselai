/**
 * Test utility to verify image preprocessing works correctly
 */

import { preloadSlideImages } from '@/services/imagePreprocessingService';

export const testImagePreprocessing = async () => {
  console.log('🧪 Starting image preprocessing test...');
  
  // Test with sample URLs that might have CORS issues
  const testUrls = [
    'https://picsum.photos/400/400', // Profile image
    'https://picsum.photos/800/600'  // Content image
  ];

  try {
    const result = await preloadSlideImages({
      profileImageUrl: testUrls[0],
      contentImageUrl: testUrls[1],
      username: 'testuser'
    });

    console.log('✅ Image preprocessing test completed successfully:', {
      hasProcessedProfile: !!result.profileImageUrl,
      hasProcessedContent: !!result.contentImageUrl,
      profileUrlType: result.profileImageUrl?.startsWith('data:') ? 'base64' : 'original',
      contentUrlType: result.contentImageUrl?.startsWith('data:') ? 'base64' : 'original'
    });

    return result;
  } catch (error) {
    console.error('❌ Image preprocessing test failed:', error);
    throw error;
  }
};

// Simple console test runner
if (typeof window !== 'undefined') {
  (window as any).testImagePreprocessing = testImagePreprocessing;
  console.log('🔧 Image preprocessing test available at: window.testImagePreprocessing()');
}