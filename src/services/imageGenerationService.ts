import { OPENAI_API_KEY } from '../constants/config';

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

// Helper function to get correct API dimensions (OpenAI supported sizes only)
const getFormatDimensions = (format: string): { width: number; height: number } => {
  const dimensions = {
    'stories': { width: 1024, height: 1792 }, // Vertical format for stories
    'reels': { width: 1024, height: 1792 },   // Vertical format for reels  
    'feed': { width: 1024, height: 1024 },    // Square format for feed
    'default': { width: 1024, height: 1024 }
  };
  
  return dimensions[format as keyof typeof dimensions] || dimensions.default;
};

// Enhanced prompt creation with better content relevance
const createImagePrompt = (text: string, style: string, format: string = 'feed', contentType: string = 'educational'): string => {
  // Extract key concepts from the text for better image relevance
  const cleanText = text.replace(/[🧵📊💡⚡🔥✨💰📈📉🎯🚀]/g, '').trim();
  const lowerText = cleanText.toLowerCase();
  
  // Analyze content to create relevant visual elements
  let visualElements = '';
  let backgroundStyle = '';
  let colorScheme = '';
  
  // Content-specific visual elements
  if (lowerText.includes('dinheiro') || lowerText.includes('renda') || lowerText.includes('financeiro')) {
    visualElements = 'elementos visuais de crescimento financeiro, gráficos ascendentes, ícones de dinheiro';
    colorScheme = 'tons de verde e dourado';
  } else if (lowerText.includes('negócio') || lowerText.includes('empresa') || lowerText.includes('vendas')) {
    visualElements = 'elementos corporativos, gráficos de performance, ícones de crescimento empresarial';
    colorScheme = 'azul profissional e cinza elegante';
  } else if (lowerText.includes('saúde') || lowerText.includes('exercício') || lowerText.includes('bem-estar')) {
    visualElements = 'elementos de saúde e vitalidade, ícones de wellness, símbolos de energia';
    colorScheme = 'verde natural e azul wellness';
  } else if (lowerText.includes('tecnologia') || lowerText.includes('digital') || lowerText.includes('ia')) {
    visualElements = 'elementos tecnológicos, circuitos, ícones digitais, formas geométricas modernas';
    colorScheme = 'azul tech e roxo futurista';
  } else if (lowerText.includes('educação') || lowerText.includes('aprender') || lowerText.includes('curso')) {
    visualElements = 'elementos educacionais, livros estilizados, ícones de conhecimento, símbolos de aprendizado';
    colorScheme = 'azul conhecimento e laranja energia';
  } else {
    // Generic but engaging elements based on actual text content
    const keyWords = cleanText.split(' ').slice(0, 3).join(' ');
    visualElements = `elementos visuais modernos representando especificamente: ${keyWords}`;
    colorScheme = 'cores vibrantes e harmoniosas';
  }
  
  // Format-specific background and composition
  if (format === 'stories') {
    backgroundStyle = 'fundo vertical elegante, composição para stories 9:16';
  } else {
    backgroundStyle = 'fundo quadrado moderno, composição equilibrada';
  }
  
  // Enhanced prompt with specific content relevance
  const prompt = `Design moderno para Instagram ${format}, ${backgroundStyle}, ${visualElements}, ${colorScheme}, tipografia bold e limpa, estilo ${style || 'profissional'}, alta qualidade, tendências design 2024, relacionado especificamente ao tema: "${cleanText.substring(0, 100)}", sem texto no design, foco visual no conceito apresentado`;
  
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