/**
 * Contextual Image Generation Service
 * Creates relevant images based on slide content using intelligent prompt generation
 */

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

/**
 * Generate contextual image prompt based on content analysis
 */
export const generateContextualImagePrompt = (
  text: string, 
  options: ContextualImageOptions
): string => {
  const analysis = analyzeSlideContent(text);
  const { slideIndex, totalSlides, slidePosition } = options;
  
  console.log('🎨 Content analysis for slide', slideIndex + 1, ':', analysis);
  
  // Base style and quality settings
  const baseStyle = "Ultra high resolution, professional digital illustration, clean modern design, vibrant colors, high contrast, detailed";
  
  // Position-specific elements
  let positionElements = "";
  if (slidePosition === 'intro' && slideIndex === 0) {
    positionElements = "eye-catching hero style, bold typography elements, engaging opening visual";
  } else if (slidePosition === 'conclusion' && slideIndex === totalSlides - 1) {
    positionElements = "conclusive design, call-to-action elements, summary visualization";
  } else {
    positionElements = "content-focused design, informational layout, supporting visual elements";
  }
  
  // Theme-specific visual elements
  let themePrompt = "";
  
  if (analysis.themes.includes('business')) {
    themePrompt = "Modern business infographic style, corporate colors (blues, grays, whites), growth arrows, success symbols, professional charts and graphs, business icons";
  } else if (analysis.themes.includes('education')) {
    themePrompt = "Educational infographic design, learning icons, book symbols, lightbulb ideas, knowledge representation, academic color scheme (blues, greens, oranges)";
  } else if (analysis.themes.includes('technology')) {
    themePrompt = "Tech-focused design, digital interface elements, circuit patterns, futuristic colors (blues, purples, cyans), technology icons, data visualization";
  } else if (analysis.themes.includes('wellness')) {
    themePrompt = "Health and wellness design, natural colors (greens, blues, earth tones), wellness icons, balance symbols, organic shapes";
  } else if (analysis.themes.includes('creative')) {
    themePrompt = "Creative and artistic design, vibrant color palette, artistic elements, inspiration symbols, creative tools icons, innovative layouts";
  } else if (analysis.themes.includes('social')) {
    themePrompt = "Social media style design, people icons, communication symbols, network graphics, community elements, social colors";
  } else {
    themePrompt = "Clean minimalist design, geometric shapes, balanced composition, modern color palette, abstract visual elements";
  }
  
  // Sentiment-based color adjustments
  let sentimentColors = "";
  if (analysis.sentiment === 'positive') {
    sentimentColors = "bright optimistic colors, energetic tones, uplifting color palette";
  } else if (analysis.sentiment === 'negative') {
    sentimentColors = "problem-solving colors, solution-focused palette, constructive tones";
  } else {
    sentimentColors = "balanced neutral colors, professional color scheme";
  }
  
  // Content-specific elements
  let contentElements = "";
  
  // Extract key concepts from the text for visual representation
  const keyWords = extractKeyVisualizableWords(text);
  if (keyWords.length > 0) {
    contentElements = `Visual representation of: ${keyWords.slice(0, 3).join(', ')}, `;
  }
  
  // Tone-specific styling
  let toneStyle = "";
  if (analysis.tone === 'professional') {
    toneStyle = "corporate professional style, business presentation layout";
  } else if (analysis.tone === 'formal') {
    toneStyle = "formal document style, academic presentation layout";
  } else if (analysis.tone === 'creative') {
    toneStyle = "creative artistic style, innovative design layout";
  } else {
    toneStyle = "approachable casual style, friendly design layout";
  }
  
  // Combine all elements into final prompt
  const finalPrompt = `${baseStyle}. ${themePrompt}. ${contentElements}${toneStyle}. ${positionElements}. ${sentimentColors}. Instagram carousel slide format, 1080x1350 aspect ratio. No text overlays, focus on visual impact and relevance to content themes. Modern, engaging, professional quality.`;
  
  console.log('✨ Generated contextual prompt for slide', slideIndex + 1, ':', finalPrompt.substring(0, 150) + '...');
  
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
  username: string
): Promise<string> => {
  const slidePosition = getSlidePosition(slideIndex, totalSlides);
  
  const options: ContextualImageOptions = {
    slideIndex,
    totalSlides,
    username,
    slidePosition
  };
  
  const prompt = generateContextualImagePrompt(text, options);
  
  console.log(`🎨 Generating contextual image for slide ${slideIndex + 1}/${totalSlides} (${slidePosition})`);
  
  // Return the prompt - the actual image generation will be handled by the image generation service
  return prompt;
};