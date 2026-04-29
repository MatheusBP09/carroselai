/**
 * Contextual Image Generation Service
 * Creates relevant images based on slide content using intelligent prompt generation
 */

import { ImageStyle } from '@/types/carousel';

interface ContentAnalysis {
  themes: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  contentType: 'educational' | 'motivational' | 'business' | 'personal' | 'technical' | 'general';
  visualElements: string[];
  tone: 'professional' | 'casual' | 'formal' | 'creative';
}

interface ContextualImageOptions {
  slideIndex: number;
  totalSlides: number;
  username: string;
  slidePosition: 'intro' | 'development' | 'conclusion';
  imageStyle?: ImageStyle;
  customPrompt?: string;
  gptImagePrompt?: string;
}

/**
 * Analyze slide content to understand themes and context
 */
export const analyzeSlideContent = (text: string): ContentAnalysis => {
  const lowerText = text.toLowerCase();
  
  // Theme detection based on keywords and context
  const themes: string[] = [];
  const visualElements: string[] = [];
  
  // Business/Professional themes
  if (/\b(sucesso|crescimento|estratégia|negócio|empresa|vendas|marketing|produtividade|liderança|gestão)\b/.test(lowerText)) {
    themes.push('business');
    visualElements.push('modern office', 'business graphics', 'growth charts');
  }
  
  // Educational themes
  if (/\b(aprender|ensinar|conhecimento|educação|estudo|curso|dica|tutorial|método|técnica)\b/.test(lowerText)) {
    themes.push('education');
    visualElements.push('learning icons', 'educational graphics', 'knowledge symbols');
  }
  
  // Technology themes
  if (/\b(tecnologia|digital|inteligência artificial|ia|código|programação|software|app|sistema)\b/.test(lowerText)) {
    themes.push('technology');
    visualElements.push('tech icons', 'digital elements', 'futuristic design');
  }
  
  // Health/Wellness themes
  if (/\b(saúde|bem-estar|exercício|fitness|mental|físico|alimentação|cuidado)\b/.test(lowerText)) {
    themes.push('wellness');
    visualElements.push('wellness icons', 'health symbols', 'nature elements');
  }
  
  // Creative/Design themes
  if (/\b(design|criatividade|arte|criativo|inovação|inspiração|ideia)\b/.test(lowerText)) {
    themes.push('creative');
    visualElements.push('creative elements', 'artistic design', 'inspiration symbols');
  }
  
  // Social/Communication themes
  if (/\b(relacionamento|comunicação|social|pessoas|equipe|colaboração|networking)\b/.test(lowerText)) {
    themes.push('social');
    visualElements.push('people icons', 'communication symbols', 'social graphics');
  }
  
  // Fallback to general if no specific theme detected
  if (themes.length === 0) {
    themes.push('general');
    visualElements.push('abstract graphics', 'modern design elements');
  }
  
  // Sentiment analysis
  let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
  
  const positiveWords = /\b(sucesso|conquista|vitória|crescimento|oportunidade|excelente|ótimo|melhor|incrível|fantástico|positivo|benefício|vantagem|solução)\b/;
  const negativeWords = /\b(problema|dificuldade|erro|falha|desafio|obstáculo|negativo|ruim|difícil|complicado|impossível)\b/;
  
  if (positiveWords.test(lowerText)) sentiment = 'positive';
  else if (negativeWords.test(lowerText)) sentiment = 'negative';
  
  // Content type classification
  let contentType: ContentAnalysis['contentType'] = 'general';
  
  if (themes.includes('business')) contentType = 'business';
  else if (themes.includes('education')) contentType = 'educational';
  else if (themes.includes('technology')) contentType = 'technical';
  else if (/\b(motivação|inspiração|objetivo|meta|sonho|conquista)\b/.test(lowerText)) contentType = 'motivational';
  else if (/\b(eu|minha|pessoal|vida|experiência|história)\b/.test(lowerText)) contentType = 'personal';
  
  // Tone detection
  let tone: ContentAnalysis['tone'] = 'casual';
  
  if (/\b(dados|análise|pesquisa|estudo|relatório|estratégia|empresa|corporativo)\b/.test(lowerText)) tone = 'professional';
  else if (/\b(prezado|cordialmente|atenciosamente|sr\.|sra\.|vossa)\b/.test(lowerText)) tone = 'formal';
  else if (themes.includes('creative') || /\b(criativo|inovador|diferente|único|especial)\b/.test(lowerText)) tone = 'creative';
  
  return {
    themes,
    sentiment,
    contentType,
    visualElements,
    tone
  };
};

// Style prompts for predefined image styles (in English for best model performance)
const stylePrompts: Record<ImageStyle, string> = {
  photography:
    'Professional editorial photography, ultra-realistic, natural lighting, shallow depth of field, cinematic composition, vibrant true-to-life colors, 8k quality',
  notebook_sketch:
    'Hand-drawn illustration on a lined spiral notebook page, top-down flat lay view, colored pencil and marker style, playful cartoon characters and objects (houses, money bags, coins, arrows, stairs, buildings, people), bold hand-lettered title at the top in dark blue and red marker with yellow highlighter underline, curved colored arrows (green, yellow, red) connecting elements, small doodled icons, soft pastel paper texture with subtle blue grid lines, red margin line on the left, yellow sticky note with red pushpin in the top-left corner, two pencils with erasers at the bottom-right corner, warm and educational infographic feel, vibrant but soft colors, casual didactic style',
  custom: '',
};

// Style-specific constraints (in English)
const styleConstraints: Record<ImageStyle, string> = {
  photography:
    'Strictly no text overlays, no typography, no logos, no watermarks.',
  notebook_sketch:
    'Short hand-lettered labels in Portuguese are allowed and encouraged (max 2-4 words per label, written in marker style). Title at the top must reflect the slide topic in Portuguese. Leave the bottom-right corner clean (no signature, watermark or username).',
  custom: '',
};

/**
 * Generate contextual image prompt based on content analysis
 */
export const generateContextualImagePrompt = (
  text: string, 
  options: ContextualImageOptions
): string => {
  const analysis = analyzeSlideContent(text);
  const { slideIndex, totalSlides, slidePosition, imageStyle, customPrompt, gptImagePrompt } = options;
  
  console.log('🎨 Content analysis for slide', slideIndex + 1, ':', analysis);
  
  const style = imageStyle || 'photography';
  const baseStyle = stylePrompts[style];
  const constraints = styleConstraints[style];

  // Custom style (or extra instructions): user prompt is the driver
  if (style === 'custom') {
    const subject = gptImagePrompt?.trim() || text.slice(0, 200);
    const userInstr = customPrompt?.trim() || 'High quality, visually engaging composition';
    const finalPrompt = `${userInstr}. Subject: ${subject}. Instagram carousel slide, 1080x1350 vertical aspect ratio.`;
    console.log('✨ Custom prompt for slide', slideIndex + 1, ':', finalPrompt.substring(0, 200));
    return finalPrompt;
  }

  // Subject: prefer the GPT-generated imagePrompt (already targeted to the slide).
  // Fallback to extracted keywords + slide text.
  let subject = gptImagePrompt?.trim() || '';
  if (!subject) {
    const keyWords = extractKeyVisualizableWords(text);
    const kw = keyWords.length > 0 ? `${keyWords.slice(0, 3).join(', ')}. ` : '';
    subject = `${kw}Scene relevant to: ${text.slice(0, 180)}`;
  }

  // Position hint (kept light, no style override)
  let positionHint = '';
  if (slidePosition === 'intro' && slideIndex === 0) {
    positionHint = 'Strong opening visual that hooks the viewer.';
  } else if (slidePosition === 'conclusion' && slideIndex === totalSlides - 1) {
    positionHint = 'Conclusive, summarizing visual.';
  } else {
    positionHint = 'Supporting visual that reinforces the message.';
  }

  // Mood from sentiment (color guidance only, doesn't override style)
  const mood =
    analysis.sentiment === 'positive'
      ? 'optimistic, uplifting mood'
      : analysis.sentiment === 'negative'
      ? 'thoughtful, problem-solving mood'
      : 'balanced, confident mood';

  // Optional user extra instructions
  const userExtra = customPrompt?.trim() ? ` Additional direction: ${customPrompt.trim()}.` : '';

  const finalPrompt = `${baseStyle}. Subject: ${subject}. ${mood}. ${positionHint} ${constraints}${userExtra} Instagram carousel slide, 1080x1350 vertical aspect ratio.`;

  console.log('✨ Generated prompt for slide', slideIndex + 1, `(${style}):`, finalPrompt.substring(0, 200) + '...');

  return finalPrompt;
};

/**
 * Extract key words that can be visualized from text content
 */
const extractKeyVisualizableWords = (text: string): string[] => {
  const words = text.toLowerCase().split(/\s+/);
  const visualizableWords: string[] = [];
  
  // Categories of words that translate well to visuals
  const visualCategories = {
    business: ['sucesso', 'crescimento', 'vendas', 'lucro', 'cliente', 'mercado', 'estratégia', 'meta', 'resultado'],
    education: ['aprendizado', 'conhecimento', 'habilidade', 'método', 'técnica', 'curso', 'estudo', 'ensino'],
    technology: ['tecnologia', 'digital', 'sistema', 'software', 'dados', 'automação', 'inovação'],
    wellness: ['saúde', 'bem-estar', 'exercício', 'alimentação', 'mental', 'físico', 'equilíbrio'],
    creative: ['design', 'arte', 'criatividade', 'ideia', 'inspiração', 'projeto', 'criação'],
    social: ['relacionamento', 'comunicação', 'equipe', 'pessoas', 'networking', 'colaboração'],
    general: ['processo', 'sistema', 'método', 'ferramenta', 'solução', 'problema', 'objetivo']
  };
  
  // Find words that match visual categories
  for (const [category, categoryWords] of Object.entries(visualCategories)) {
    for (const word of categoryWords) {
      if (words.some(w => w.includes(word)) && !visualizableWords.includes(word)) {
        visualizableWords.push(word);
        if (visualizableWords.length >= 5) break;
      }
    }
    if (visualizableWords.length >= 5) break;
  }
  
  return visualizableWords;
};

/**
 * Determine slide position based on index and total slides
 */
export const getSlidePosition = (index: number, total: number): 'intro' | 'development' | 'conclusion' => {
  if (index === 0) return 'intro';
  if (index === total - 1 && total > 1) return 'conclusion';
  return 'development';
};

/**
 * Generate contextual image for a specific slide
 */
export const generateContextualImage = async (
  text: string,
  slideIndex: number,
  totalSlides: number,
  username: string,
  imageStyle?: ImageStyle,
  customPrompt?: string,
  gptImagePrompt?: string
): Promise<string> => {
  const slidePosition = getSlidePosition(slideIndex, totalSlides);
  
  const options: ContextualImageOptions = {
    slideIndex,
    totalSlides,
    username,
    slidePosition,
    imageStyle,
    customPrompt,
    gptImagePrompt,
  };
  
  const prompt = generateContextualImagePrompt(text, options);
  
  console.log(`🎨 Generating contextual image for slide ${slideIndex + 1}/${totalSlides} (${slidePosition}) with style: ${imageStyle || 'photography'}`);
  
  // Return the prompt - the actual image generation will be handled by the image generation service
  return prompt;
};