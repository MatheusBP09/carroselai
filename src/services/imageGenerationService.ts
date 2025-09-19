import { OPENAI_CONFIG } from '../constants/config';

console.log('🔧 Image Generation Service loaded with Supabase config');

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
  success: boolean;
  error?: string;
}

export const generateContentImage = async (params: ImageGenerationParams): Promise<ImageGenerationResponse> => {
  const { text, style = 'modern', aspectRatio = '1:1', contentFormat = 'feed', contentType = 'educational', width, height } = params;

  console.log('🎨 Starting image generation with params:', {
    contentType,
    textLength: text?.length || 0,
    contentFormat,
    style
  });

  // No need to check API key since we're using Supabase Edge Functions
  console.log('🎨 Using secure Supabase Edge Functions for image generation');

  // Get exact dimensions based on format
  const dimensions = width && height ? { width, height } : getFormatDimensions(contentFormat);
  
  const optimizedPrompt = createImagePrompt(text, style, contentFormat, contentType);
  
  console.log('📝 Generated prompt:', optimizedPrompt.substring(0, 150) + '...');
  console.log('📏 Using dimensions:', dimensions);

  try {
    const requestBody = {
      model: 'gpt-image-1',
      prompt: optimizedPrompt,
      n: 1,
      size: `${dimensions.width}x${dimensions.height}`,
      quality: 'high',
      output_format: 'png'
    };

    console.log('🚀 Making OpenAI API request via Supabase Edge Function...');
    const response = await fetch(OPENAI_CONFIG.imageEndpoint, {
      method: 'POST',
      headers: OPENAI_CONFIG.headers,
      body: JSON.stringify({
        prompt: optimizedPrompt,
        model: 'gpt-image-1',
        size: `${dimensions.width}x${dimensions.height}`,
        quality: 'high',
      }),
    });

    console.log('📡 OpenAI response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      console.error('❌ OpenAI API error:', errorData);
      
      if (response.status === 401) {
        throw new Error('OpenAI API key is invalid or missing. Please check your Supabase secrets configuration.');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      } else if (response.status === 400) {
        const errorMsg = errorData.error?.message || 'Invalid request parameters';
        throw new Error(`Request error: ${errorMsg}`);
      } else {
        throw new Error(`API failure: ${response.status} ${response.statusText}`);
      }
    }

    const data = await response.json();
    console.log('✅ OpenAI response received:', {
      hasData: !!data.data,
      dataLength: data.data?.length || 0
    });
    
    if (!data.data || data.data.length === 0) {
      throw new Error('No image data returned from OpenAI API');
    }

    // For gpt-image-1, the response contains base64 data, not URLs
    const imageData = data.data[0];
    let imageUrl = '';
    
    if (imageData.b64_json) {
      // Convert base64 to data URL
      imageUrl = `data:image/png;base64,${imageData.b64_json}`;
      console.log('🖼️ Image generated successfully (base64)');
    } else if (imageData.url) {
      imageUrl = imageData.url;
      console.log('🖼️ Image generated successfully (URL)');
    } else {
      throw new Error('No image data found in OpenAI response');
    }

    console.log('✅ Image generation completed successfully');
    
    return {
      imageUrl,
      success: true
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred during image generation';
    console.error('❌ Error generating content image:', errorMessage);
    
    return {
      imageUrl: '',
      success: false,
      error: errorMessage
    };
  }
};

// Helper function to get correct API dimensions (OpenAI supported sizes only)
const getFormatDimensions = (format: string): { width: number; height: number } => {
  const dimensions = {
    'stories': { width: 1024, height: 1792 }, // Vertical format for stories
    'reels': { width: 1024, height: 1792 },   // Vertical format for reels  
    'feed': { width: 1024, height: 1024 },    // Square format (DALL-E supported)
    'default': { width: 1024, height: 1024 }  // Square format (DALL-E supported)
  };
  
  return dimensions[format as keyof typeof dimensions] || dimensions.default;
};

// Enhanced prompt creation focused on realistic photography
const createImagePrompt = (text: string, style: string, format: string = 'feed', contentType: string = 'educational'): string => {
  // Extract key concepts from the text for better image relevance
  const cleanText = text.replace(/[🧵📊💡⚡🔥✨💰📈📉🎯🚀]/g, '').trim();
  const lowerText = cleanText.toLowerCase();
  
  // Analyze content to create realistic photo subjects
  let photoSubject = '';
  let photoContext = '';
  let photographyStyle = '';
  
  // Content-specific realistic photography elements
  if (lowerText.includes('dinheiro') || lowerText.includes('renda') || lowerText.includes('financeiro') || lowerText.includes('investir')) {
    photoSubject = 'pessoa profissional analisando gráficos financeiros em escritório moderno';
    photoContext = 'ambiente corporativo com computadores, documentos financeiros, atmosfera de sucesso';
    photographyStyle = 'fotografia corporativa profissional, iluminação natural';
  } else if (lowerText.includes('negócio') || lowerText.includes('empresa') || lowerText.includes('vendas') || lowerText.includes('empreend')) {
    photoSubject = 'empreendedor ou executivo em ambiente de negócios';
    photoContext = 'escritório moderno, reunião de negócios, apresentação profissional';
    photographyStyle = 'fotografia corporate, luz profissional, ambiente business';
  } else if (lowerText.includes('saúde') || lowerText.includes('exercício') || lowerText.includes('bem-estar') || lowerText.includes('energia')) {
    photoSubject = 'pessoa praticando atividade saudável ou em ambiente wellness';
    photoContext = 'academia, parque, consultório médico, ambiente de bem-estar';
    photographyStyle = 'fotografia lifestyle saudável, luz natural, atmosfera positiva';
  } else if (lowerText.includes('tecnologia') || lowerText.includes('digital') || lowerText.includes('ia') || lowerText.includes('inovação')) {
    photoSubject = 'profissional trabalhando com tecnologia, programador ou analista';
    photoContext = 'escritório tech, telas de computador, ambiente inovador e moderno';
    photographyStyle = 'fotografia tech moderna, iluminação LED, ambiente futurista';
  } else if (lowerText.includes('educação') || lowerText.includes('aprender') || lowerText.includes('curso') || lowerText.includes('estud')) {
    photoSubject = 'estudante ou professor em ambiente educacional';
    photoContext = 'biblioteca, sala de aula, workspace de estudos, livros e materiais';
    photographyStyle = 'fotografia educacional, luz suave, ambiente acadêmico';
  } else if (lowerText.includes('casa') || lowerText.includes('família') || lowerText.includes('vida') || lowerText.includes('pessoal')) {
    photoSubject = 'pessoa em ambiente doméstico confortável e organizado';
    photoContext = 'casa moderna, ambiente familiar acolhedor, decoração contemporânea';
    photographyStyle = 'fotografia lifestyle, luz natural aconchegante';
  } else if (lowerText.includes('trabalho') || lowerText.includes('carreira') || lowerText.includes('profiss')) {
    photoSubject = 'profissional competente em seu ambiente de trabalho';
    photoContext = 'escritório, co-working, ambiente profissional organizado';
    photographyStyle = 'fotografia profissional, iluminação corporativa';
  } else {
    // Generic realistic photo based on actual text content
    const keyWords = cleanText.split(' ').slice(0, 4).join(' ');
    photoSubject = `pessoa real em situação relacionada a: ${keyWords}`;
    photoContext = 'ambiente moderno e profissional adequado ao contexto';
    photographyStyle = 'fotografia realista de alta qualidade, iluminação natural';
  }
  
  // Enhanced prompt focused on realistic photography
  const prompt = `Fotografia profissional realista, alta resolução, ${photoSubject}, ${photoContext}, ${photographyStyle}, cores naturais e harmoniosas, composição bem balanceada, luz natural ou profissional, estilo fotojornalístico moderno, relacionado especificamente ao tema: "${cleanText.substring(0, 80)}", sem texto na imagem, foco na autenticidade e realismo`;
  
  return prompt;
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