import { OPENAI_API_KEY } from '../constants/config';

interface ImageGenerationParams {
  text: string;
  style?: 'professional' | 'modern' | 'minimalist' | 'creative';
  aspectRatio?: '1:1' | '16:9' | '9:16';
  contentFormat?: 'feed' | 'stories' | 'reels';
  contentType?: string;
  width?: number;
  height?: number;
}

interface ImageGenerationResponse {
  imageUrl: string;
}

export const generateContentImage = async (params: ImageGenerationParams): Promise<ImageGenerationResponse> => {
  const { text, style = 'modern', aspectRatio = '1:1', contentFormat = 'feed', contentType = 'educational', width, height } = params;

  // Get exact dimensions based on format
  const dimensions = width && height ? { width, height } : getFormatDimensions(contentFormat);
  
  const optimizedPrompt = createImagePrompt(text, style, contentFormat, contentType);

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: optimizedPrompt,
        n: 1,
        size: `${dimensions.width}x${dimensions.height}` as any,
        quality: 'hd',
        response_format: 'url'
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

// Get exact dimensions for each format to avoid cropping
const getFormatDimensions = (format: string): { width: number; height: number } => {
  switch (format) {
    case 'stories':
    case 'reels':
      return { width: 1080, height: 1920 };
    case 'feed':
    default:
      return { width: 1080, height: 1080 };
  }
};

const createImagePrompt = (text: string, style: string, format: string = 'feed', contentType: string = 'educational'): string => {
  const styleEnhancements = {
    professional: 'clean corporate design, professional color palette, high-quality business aesthetic',
    modern: 'contemporary design, vibrant colors, sleek minimalist layout, trending 2024 Instagram style',
    minimalist: 'simple clean design, white space, subtle colors, elegant typography, minimal elements',
    creative: 'artistic composition, bold gradients, creative typography, unique visual elements, expressive design'
  };

  const formatOptimizations = {
    feed: 'square composition, centered focal point, readable thumbnail text',
    stories: 'vertical layout, top-heavy composition, large text for mobile viewing',
    reels: 'vertical composition, dynamic elements, attention-grabbing design for video thumbnails'
  };

  const contentTypeStyles = {
    educational: 'infographic style, data visualization, clear hierarchy, instructional design',
    motivational: 'inspiring imagery, uplifting colors, empowering composition, success themes',
    tutorial: 'step-by-step visual, process flow, clear instructions, practical design',
    storytelling: 'narrative imagery, emotional composition, cinematic style, character-focused',
    business: 'professional charts, corporate colors, data-driven visuals, success metrics',
    lifestyle: 'lifestyle photography style, natural lighting, aspirational imagery, trendy aesthetics',
    tips: 'practical visuals, numbered elements, quick-tip design, actionable content',
    personal: 'authentic imagery, personal touch, relatable visuals, human connection'
  };

  const instagramTrends2024 = 'Instagram 2024 trends: bold typography, gradient overlays, 3D elements, neon accents, glass morphism effects, authentic photography, inclusive representation';
  
  const enhancement = styleEnhancements[style as keyof typeof styleEnhancements] || styleEnhancements.modern;
  const formatOpt = formatOptimizations[format as keyof typeof formatOptimizations] || formatOptimizations.feed;
  const contentStyle = contentTypeStyles[contentType as keyof typeof contentTypeStyles] || contentTypeStyles.educational;
  
  return `Create a stunning Instagram ${format} image with ${enhancement}. ${formatOpt}. Content style: ${contentStyle}. Focus: "${text}". 
  
  Design requirements: ${instagramTrends2024}. Perfect ${format === 'feed' ? '1080x1080' : '1080x1920'} dimensions. High contrast, mobile-optimized readability. No text overlay (text will be added separately). Ultra high resolution, professional quality.`;
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