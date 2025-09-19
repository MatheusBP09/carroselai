import { supabase } from '@/integrations/supabase/client';

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
  console.log('🚀 Calling Supabase edge function for carousel generation...');
  
  try {
    const { data, error } = await supabase.functions.invoke('generate-carousel', {
      body: params
    });

    if (error) {
      console.error('❌ Supabase function error:', error);
      throw new Error(error.message || 'Erro na geração do carrossel');
    }

    if (!data) {
      throw new Error('Nenhum dado retornado pela função');
    }

    console.log('✅ Carousel generated successfully');
    return data;
    
  } catch (error: any) {
    console.error('🚨 Error in generateCarousel:', error);
    throw new Error(error.message || 'Erro desconhecido na geração do carrossel');
  }
};