import { supabase } from '@/integrations/supabase/client';

export interface ImageGenerationParams {
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
    console.log('🎨 Generating image via Supabase edge function...');
    
    const { data, error } = await supabase.functions.invoke('generate-image', {
      body: {
        prompt: optimizedPrompt,
        size: `${dimensions.width}x${dimensions.height}`
      }
    });

    if (error) {
      console.error('❌ Supabase function error:', error);
      throw new Error(error.message || 'Erro na geração da imagem');
    }

    if (!data?.success) {
      throw new Error(data?.error || 'Falha na geração da imagem');
    }

    console.log('✅ Image generated successfully');
    return { imageUrl: data.imageUrl };

  } catch (error: any) {
    console.error('🚨 Image generation error:', error);
    
    // Return fallback image for better UX
    const fallbackUrl = getFallbackImage(contentType, contentFormat);
    console.log('🔄 Using fallback image:', fallbackUrl);
    
    return { imageUrl: fallbackUrl };
  }
};

// Helper functions
const getFormatDimensions = (format: string): { width: number; height: number } => {
  switch (format) {
    case 'stories':
      return { width: 1080, height: 1920 };
    case 'reels':
      return { width: 1080, height: 1920 };
    case 'feed':
    default:
      return { width: 1080, height: 1080 };
  }
};

const createImagePrompt = (text: string, style: string, format: string, type: string): string => {
  // Clean text for better prompt
  const cleanText = text.replace(/[🧵📊💡⚡🔥✨💰📈📉🎯🚀]/g, '').trim();
  
  const styleDescriptors = {
    professional: 'professional, clean, business-like',
    modern: 'modern, sleek, contemporary',
    minimalist: 'minimalist, simple, clean lines',
    creative: 'creative, artistic, dynamic'
  };

  const typeDescriptors = {
    educational: 'educational, informative, professional setting',
    motivational: 'inspiring, energetic, uplifting',
    tutorial: 'step-by-step, clear, instructional',
    business: 'corporate, professional, success-oriented',
    lifestyle: 'lifestyle, everyday, relatable'
  };

  const baseStyle = styleDescriptors[style as keyof typeof styleDescriptors] || styleDescriptors.modern;
  const typeStyle = typeDescriptors[type as keyof typeof typeDescriptors] || typeDescriptors.educational;

  return `High-quality photograph: ${typeStyle}, ${baseStyle}, realistic lighting, no text overlay, ${format === 'stories' ? 'vertical composition' : 'square composition'}, professional photography`;
};

const getFallbackImage = (contentType: string, format: string): string => {
  const baseUrl = 'https://images.unsplash.com';
  const dimensions = format === 'stories' ? '1080x1920' : '1080x1080';
  
  const fallbackCategories = {
    educational: 'study,learning,books',
    motivational: 'success,motivation,achievement',
    tutorial: 'workspace,computer,tutorial',
    business: 'business,office,professional',
    lifestyle: 'lifestyle,modern,clean',
    default: 'abstract,modern,minimal'
  };

  const category = fallbackCategories[contentType as keyof typeof fallbackCategories] || fallbackCategories.default;
  return `${baseUrl}/${dimensions}/?${category}&auto=format&fit=crop`;
};

// Profile image conversion utility
export const convertProfileImageToUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        resolve(result);
      } else {
        reject(new Error('Failed to convert file to URL'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};