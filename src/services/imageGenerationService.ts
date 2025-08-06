import { OPENAI_API_KEY } from '../constants/config';

interface ImageGenerationParams {
  text: string;
  style?: 'photorealistic' | 'illustration' | 'minimal' | 'artistic';
  aspectRatio?: '16:9' | '1:1' | '4:3';
}

interface ImageGenerationResponse {
  imageUrl: string;
}

/**
 * Generate content image using OpenAI DALL-E
 */
export const generateContentImage = async (params: ImageGenerationParams): Promise<ImageGenerationResponse> => {
  const { text, style = 'photorealistic', aspectRatio = '16:9' } = params;

  try {
    // Create optimized prompt based on tweet text
    const prompt = createImagePrompt(text, style);

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: '1024x1024', // Will be resized to fit in Twitter post
        quality: 'hd',
        style: style === 'photorealistic' ? 'natural' : 'vivid',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      
      if (response.status === 401) {
        throw new Error('Invalid OpenAI API key. Please check your API key.');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (response.status === 400) {
        throw new Error(`Bad request: ${errorData.error?.message || 'Invalid request parameters'}`);
      } else {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
    }

    const data = await response.json();
    
    if (!data.data || !data.data[0] || !data.data[0].url) {
      throw new Error('Invalid response format from OpenAI API');
    }

    return {
      imageUrl: data.data[0].url
    };
  } catch (error) {
    console.error('Error generating content image:', error);
    throw error;
  }
};

/**
 * Create optimized prompt for image generation based on tweet content
 */
const createImagePrompt = (text: string, style: string): string => {
  // Extract key concepts and themes from the tweet text
  const basePrompt = `Create a high-quality ${style} image that visually represents: "${text}"`;
  
  // Add style-specific enhancements
  const styleEnhancements = {
    photorealistic: 'Professional photography, sharp focus, excellent lighting, high detail',
    illustration: 'Modern digital illustration, clean lines, vibrant colors, professional design',
    minimal: 'Minimalist design, clean composition, simple but impactful, professional',
    artistic: 'Artistic interpretation, creative composition, visually striking, unique perspective'
  };

  const enhancement = styleEnhancements[style as keyof typeof styleEnhancements] || styleEnhancements.photorealistic;

  // Optimize for social media
  const socialMediaOptimization = 'Optimized for social media, visually engaging, clear subject matter, good contrast';

  return `${basePrompt}. ${enhancement}. ${socialMediaOptimization}. Avoid text overlays or watermarks.`;
};

/**
 * Convert profile image file to URL for use in Twitter post
 */
export const convertProfileImageToUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Failed to convert image to URL'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
};