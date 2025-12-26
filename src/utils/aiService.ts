import { supabase } from '@/integrations/supabase/client';
import { withRetry, classifyError, formatErrorForUser } from '@/services/edgeFunctionRetryService';

interface GenerateCarouselParams {
  title?: string;
  username: string;
  content: string;
  instagramHandle: string;
  isVerified: boolean;
  slideCount?: number;
  contentType: string;
  contentFormat: string;
  callToAction: string;
  customCTA?: string;
  copywritingFramework: string;
  targetAudience?: string;
}

interface GenerateCarouselResponse {
  slides: Array<{
    id: number;
    text: string;
    isEdited: boolean;
    originalText: string;
    needsImage?: boolean;
    imagePrompt?: string;
  }>;
  caption: string;
  hashtags: string[];
}

export const generateCarousel = async (params: GenerateCarouselParams): Promise<GenerateCarouselResponse> => {
  console.log('🚀 [generate-carousel] Starting carousel generation...');
  console.log('📊 [generate-carousel] Params:', {
    username: params.username,
    slideCount: params.slideCount,
    contentType: params.contentType
  });
  
  try {
    // Use retry wrapper for automatic retries with exponential backoff
    const result = await withRetry(
      'generate-carousel',
      async () => {
        const { data, error } = await supabase.functions.invoke('generate-carousel', {
          body: params
        });

        if (error) {
          console.error('❌ [generate-carousel] Supabase function error:', error);
          throw error;
        }

        if (!data) {
          throw new Error('Nenhum dado retornado pela função');
        }

        return data;
      },
      { maxRetries: 2, baseDelayMs: 2000 }
    );

    console.log('✅ [generate-carousel] Carousel generated successfully');
    return result;
    
  } catch (error: any) {
    const classifiedError = classifyError(error, 'generate-carousel');
    console.error('🚨 [generate-carousel] Final error:', {
      type: classifiedError.errorType,
      message: classifiedError.message,
      userMessage: formatErrorForUser(classifiedError)
    });
    
    // Re-throw with user-friendly message
    throw new Error(formatErrorForUser(classifiedError));
  }
};