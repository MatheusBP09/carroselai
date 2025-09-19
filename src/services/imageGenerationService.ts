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