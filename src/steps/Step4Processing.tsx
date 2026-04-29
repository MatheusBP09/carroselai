import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Bot, CheckCircle, AlertCircle, Image, Bug, Zap, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCarousel } from '@/context/CarouselContext';
import { generateCarousel } from '@/utils/aiService';
import { convertProfileImageToUrl } from '@/services/imageGenerationService';
import { enhancedImageService } from '@/services/enhancedImageService';
import { generateContextualImage } from '@/services/contextualImageService';
import { monitoringService } from '@/services/monitoringService';

// Helper functions for enhanced image generation (100% coverage)
const getImagePromptVariations = (slideIndex: number, totalSlides: number): string[] => {
  const position = slideIndex / (totalSlides - 1);
  
  if (position === 0) {
    // First slide - impactful opener
    return [
      'Design de capa impactante com tipografia bold e gradiente vibrante',
      'Layout moderno de abertura com elementos visuais chamativo',
      'Composição minimalista e profissional para slide inicial'
    ];
  } else if (position > 0.8) {
    // Final slides - call to action
    return [
      'Design de call-to-action com elementos direcionais e cores vibrantes',
      'Layout de conclusão com elementos inspiracionais',
      'Composição final com destaque para próximos passos'
    ];
  } else {
    // Middle slides - content variety
    const variations = [
      'Gráfico moderno e minimalista com dados estatísticos',
      'Diagrama de processo com fluxo visual claro',
      'Ilustração conceitual moderna e profissional',
      'Infográfico com elementos visuais organizados',
      'Design tipográfico com citação destacada',
      'Comparação visual lado a lado com design limpo',
      'Processo step-by-step com numeração visual',
      'Conceito abstrato com formas geométricas modernas'
    ];
    return [variations[slideIndex % variations.length]];
  }
};

const generateEnhancedImagePrompt = (text: string, slideIndex: number, totalSlides: number): string => {
  const cleanText = text.replace(/[🧵📊💡⚡🔥✨💰📈📉🎯🚀]/g, '').trim();
  
  // Extract key concepts from the text for more relevant prompts
  const lowerText = cleanText.toLowerCase();
  
  // Expanded keyword detection for better content categorization
  const keywords = {
    financeiro: ['dinheiro', 'renda', 'financeiro', 'investir', 'lucro', 'ganhar', 'economia', 'patrimônio', 'poupança', 'orçamento'],
    negocio: ['negócio', 'empresa', 'vendas', 'cliente', 'marketing', 'empreender', 'startup', 'produto', 'serviço', 'mercado'],
    saude: ['saúde', 'exercício', 'bem-estar', 'energia', 'fitness', 'treino', 'alimentação', 'dieta', 'nutrição', 'vida'],
    tecnologia: ['tecnologia', 'digital', 'ia', 'inovação', 'software', 'app', 'programação', 'internet', 'código', 'dados'],
    educacao: ['educação', 'aprender', 'curso', 'conhecimento', 'estudar', 'ensino', 'formação', 'desenvolvimento', 'skill', 'capacitação'],
    produtividade: ['processo', 'passo', 'etapa', 'método', 'organização', 'planejamento', 'produtividade', 'gestão', 'tempo', 'eficiência'],
    lifestyle: ['casa', 'família', 'vida', 'pessoal', 'relacionamento', 'hobbies', 'lazer', 'qualidade', 'felicidade', 'rotina'],
    crescimento: ['crescimento', 'desenvolvimento', 'melhoria', 'evolução', 'progresso', 'meta', 'objetivo', 'sucesso', 'conquista', 'resultado']
  };
  
  // Enhanced keyword matching
  let category = 'geral';
  let photoSubject = '';
  let photoContext = '';
  
  for (const [cat, words] of Object.entries(keywords)) {
    if (words.some(word => lowerText.includes(word))) {
      category = cat;
      break;
    }
  }
  
  // Generate more specific and relevant image prompts based on category
  switch (category) {
    case 'financeiro':
      photoSubject = 'profissional analisando gráficos financeiros em tablet';
      photoContext = 'ambiente de trabalho moderno, iluminação profissional';
      break;
    case 'negocio':
      photoSubject = 'empresário apresentando ideias em reunião';
      photoContext = 'escritório corporativo contemporâneo, luz natural';
      break;
    case 'saude':
      photoSubject = 'pessoa ativa praticando exercícios ou se alimentando bem';
      photoContext = 'ambiente saudável, academia ou cozinha moderna, luz natural';
      break;
    case 'tecnologia':
      photoSubject = 'desenvolvedor trabalhando com múltiplas telas';
      photoContext = 'setup tech moderno, iluminação LED, ambiente inovador';
      break;
    case 'educacao':
      photoSubject = 'estudante ou professor com materiais de estudo';
      photoContext = 'biblioteca moderna ou workspace educacional organizado';
      break;
    case 'produtividade':
      photoSubject = 'pessoa organizando tarefas e planejamentos';
      photoContext = 'escritório limpo e organizado, materiais de produtividade';
      break;
    case 'lifestyle':
      photoSubject = 'pessoa em momento de bem-estar no dia a dia';
      photoContext = 'ambiente doméstico aconchegante e moderno';
      break;
    default:
      // Enhanced semantic analysis for generic content
      const mainWords = cleanText.split(' ').slice(0, 3).join(' ');
      photoSubject = `cena realista que representa: ${mainWords}`;
      photoContext = 'ambiente contemporâneo e bem iluminado';
  }
  
  // Simplified and more consistent prompt structure
  return `Fotografia realista: ${photoSubject}, ${photoContext}, foto profissional, cores naturais, sem texto na imagem`;
};
import { StepProps } from '@/types/carousel';
import { toast } from 'sonner';

type ProcessingStatus = 'processing' | 'completed' | 'error';

const Step4Processing = ({ data, onNext, onBack }: StepProps) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<ProcessingStatus>('processing');
  const [error, setError] = useState<string>('');
  const [currentStep, setCurrentStep] = useState('');
  const [imageStats, setImageStats] = useState({ generated: 0, fallbacks: 0, total: 0 });
  const { updateData } = useCarousel();

  useEffect(() => {
    processCarousel();
  }, []);

  const processCarousel = async () => {
    const sessionId = monitoringService.startSession(data.slideCount || 10);
    const startTime = Date.now();
    let modelUsed = 'unknown';
    
    try {
      setStatus('processing');
      setError('');
      
      // Passo 1: Gerar conteúdo com IA otimizada
      setCurrentStep('Gerando conteúdo com IA avançada...');
      setProgress(10);
      
      const slideCount = data.slideCount || 10;
      
      const result = await generateCarousel({
        title: data.title,
        username: data.username || data.instagramHandle,
        content: data.content,
        instagramHandle: data.instagramHandle,
        isVerified: data.isVerified,
        slideCount,
        contentType: data.contentType,
        contentFormat: data.contentFormat,
        callToAction: data.callToAction,
        customCTA: data.customCTA,
        copywritingFramework: data.copywritingFramework,
        targetAudience: data.targetAudience
      });

      modelUsed = 'gpt-4o-cascade'; // Indicates successful cascade

      setProgress(30);
      setCurrentStep('Preparando geração de imagens...');

      // Passo 2: Converter profile image se existir
      let profileImageUrl: string | undefined;
      if (data.profileImage) {
        try {
          profileImageUrl = await convertProfileImageToUrl(data.profileImage);
        } catch (error) {
          console.warn('Failed to convert profile image:', error);
        }
      }

      // Passo 3: Gerar imagens APENAS para slides com needsImage === true (regra do backend)
      setCurrentStep('Preparando geração inteligente de imagens...');
      const totalSlides = result.slides.length;

      // Identificar quais slides precisam de imagem segundo a regra do backend
      const slidesNeedingImage = result.slides
        .map((slide, i) => ({ slide, i }))
        .filter(({ slide }) => slide.needsImage === true);
      const totalImagesToGenerate = slidesNeedingImage.length;

      console.log(`📊 Backend rules: ${totalImagesToGenerate} de ${totalSlides} slides precisam de imagem`);
      setImageStats({ generated: 0, fallbacks: 0, total: totalImagesToGenerate });

      // Construir requests apenas para os slides que precisam de imagem
      const imageRequests = await Promise.all(
        slidesNeedingImage.map(async ({ slide, i }) => {
          console.log(`🎨 Generating contextual prompt for slide ${i + 1} (needsImage)`);
          const contextualPrompt = await generateContextualImage(
            slide.text,
            i,
            totalSlides,
            data.username,
            data.imageStyle,
            data.customImagePrompt
          );
          return {
            params: {
              text: contextualPrompt,
              style: 'modern' as const,
              contentFormat: data.contentFormat,
              contentType: data.contentType
            },
            slideIndex: i,
            username: data.username
          };
        })
      );

      setCurrentStep('Gerando imagens com sistema adaptativo...');

      // Batch só com slides que precisam — pode ficar vazio
      const batchResults = totalImagesToGenerate > 0
        ? await enhancedImageService.generateBatch(
            imageRequests,
            totalImagesToGenerate,
            (progressPercent, currentIndex) => {
              setProgress(30 + (progressPercent / 100) * 60);
              setCurrentStep(`Processando imagem ${currentIndex} de ${totalImagesToGenerate}`);
              const processedCount = Math.min(currentIndex, totalImagesToGenerate);
              const estimatedGenerated = Math.floor(processedCount * 0.7);
              const estimatedFallbacks = processedCount - estimatedGenerated;
              setImageStats({
                generated: estimatedGenerated,
                fallbacks: estimatedFallbacks,
                total: totalImagesToGenerate
              });
            }
          )
        : [];

      // Mapear resultados de volta para o índice original do slide
      const resultsBySlideIndex = new Map<number, any>();
      slidesNeedingImage.forEach(({ i }, batchIdx) => {
        if (batchResults[batchIdx]) {
          resultsBySlideIndex.set(i, batchResults[batchIdx]);
        }
      });

      // Pré-processar profile image (uma vez)
      setCurrentStep('Pré-processando imagens para download...');
      let profileDataUrl: string | undefined;
      if (profileImageUrl) {
        try {
          const { convertDalleUrlToDataUrl, isDalleUrl } = await import('../services/dalleUrlService');
          if (isDalleUrl(profileImageUrl)) {
            console.log('🔄 Pré-processando imagem de perfil...');
            const profileResult = await convertDalleUrlToDataUrl(profileImageUrl);
            if (profileResult.success) {
              profileDataUrl = profileResult.url;
              console.log('✅ Imagem de perfil pré-processada com sucesso');
            }
          }
        } catch (error) {
          console.warn('⚠️ Falha no pré-processamento da imagem de perfil:', error);
        }
      }

      // Montar slidesWithImages respeitando needsImage do backend
      const slidesWithImages = result.slides.map((slide, i) => {
        const imageResult = resultsBySlideIndex.get(i);
        const slideHasImage = slide.needsImage === true && !!imageResult;
        const promptForSlide = imageRequests.find(r => r.slideIndex === i)?.params.text || '';

        return {
          ...slide,
          needsImage: slide.needsImage === true, // preserva regra do backend
          hasImage: slideHasImage,               // controla visualização inicial no Step5
          imagePrompt: slideHasImage ? promptForSlide : '',
          contentImageUrls: slideHasImage ? [imageResult.imageUrl] : [],
          contentImageDataUrls: [] as string[],
          profileImageUrl,
          profileImageDataUrl: i === 0 ? profileDataUrl : undefined,
          imageGenerated: slideHasImage ? !!imageResult?.generated : false,
          fallbackUsed: slideHasImage ? !!imageResult?.fallbackUsed : false,
          customImageUrl: slideHasImage ? imageResult.imageUrl : undefined
        };
      });

      // Final stats — baseado apenas nos slides que precisavam de imagem
      const finalGenerated = batchResults.filter(r => r?.generated).length;
      const finalFallbacks = batchResults.filter(r => r?.fallbackUsed).length;
      setImageStats({ generated: finalGenerated, fallbacks: finalFallbacks, total: totalImagesToGenerate });
      
      console.log(`📊 Estatísticas finais: ${finalGenerated} geradas, ${finalFallbacks} fallbacks de ${totalSlides} total`);

      setProgress(95);
      setCurrentStep('Finalizando...');

      // Atualizar dados no contexto
      updateData({
        slides: slidesWithImages,
        caption: result.caption,
        hashtags: result.hashtags
      });

      setProgress(100);
      setCurrentStep('Carrossel gerado com sucesso!');
      setStatus('completed');

      // Log successful generation
      const duration = Math.round((Date.now() - startTime) / 1000);
      monitoringService.logGenerationComplete(sessionId, {
        timestamp: Date.now(),
        totalSlides: slideCount,
        imagesGenerated: finalGenerated,
        fallbacksUsed: finalFallbacks,
        duration,
        errors: [],
        modelUsed,
        success: true
      });

      // Auto-avançar após 1.5 segundos (otimizado)
      setTimeout(() => {
        onNext({
          slides: slidesWithImages,
          caption: result.caption,
          hashtags: result.hashtags
        });
      }, 1500);

    } catch (error: any) {
      console.error('🚨 Erro na geração do carrossel:', error);
      
      // Enhanced error categorization and logging
      const duration = Math.round((Date.now() - startTime) / 1000);
      const errorMsg = error.message || 'Erro desconhecido na geração do carrossel';
      
      // Categorize and log error
      if (errorMsg.includes('quota') || errorMsg.includes('billing')) {
        monitoringService.logError('quotaErrors', errorMsg);
      } else if (errorMsg.includes('timeout')) {
        monitoringService.logError('timeoutErrors', errorMsg);
      } else if (errorMsg.includes('JSON') || errorMsg.includes('parse')) {
        monitoringService.logError('parseErrors', errorMsg);
      } else if (errorMsg.includes('network') || errorMsg.includes('fetch')) {
        monitoringService.logError('networkErrors', errorMsg);
      }

      monitoringService.logGenerationComplete(sessionId, {
        timestamp: Date.now(),
        totalSlides: data.slideCount || 10,
        imagesGenerated: 0,
        fallbacksUsed: 0,
        duration,
        errors: [errorMsg],
        modelUsed,
        success: false
      });

      setError(errorMsg);
      setStatus('error');
      setProgress(0);
      toast.error('Erro ao gerar carrossel');
    }
  };

  const handleRetry = () => {
    processCarousel();
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <Bot className="w-8 h-8 text-primary animate-pulse" />;
      case 'completed':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-8 h-8 text-red-500" />;
    }
  };

  const getStatusMessage = () => {
    if (status === 'error') return 'Erro no processamento';
    if (status === 'completed') {
      const slideCount = data.slideCount || 10;
      return `Carrossel de ${slideCount} slide${slideCount > 1 ? 's' : ''} gerado com sucesso!`;
    }
    return currentStep || 'Processando...';
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="p-8 text-center">
        <div className="flex flex-col items-center space-y-6">
          {getStatusIcon()}
          
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-2xl font-bold">
                {status === 'processing' && 'Gerando seu carrossel...'}
                {status === 'completed' && 'Carrossel pronto!'}
                {status === 'error' && 'Algo deu errado'}
              </h2>
              <Badge variant="secondary" className="text-xs">
                {data.slideCount || 10} slide{(data.slideCount || 10) > 1 ? 's' : ''}
              </Badge>
            </div>
            
            <p className="text-muted-foreground">
              {getStatusMessage()}
            </p>
          </div>

          {status === 'processing' && (
            <div className="w-full space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                {progress}% concluído
              </p>
            </div>
          )}

          {status === 'completed' && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Carrossel otimizado gerado! {imageStats.generated} imagens AI + {imageStats.fallbacks} fallbacks inteligentes. Redirecionando...
              </AlertDescription>
            </Alert>
          )}

          {status === 'error' && (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </Card>

      {status === 'processing' && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-500" />
            Sistema IA Avançado v2.0
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <span>🤖 IA multi-modelo com fallback automático</span>
              <span className={progress >= 10 ? 'text-green-600' : 'text-muted-foreground'}>
                {progress >= 10 ? '✓' : '⏳'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <span>📝 Texto otimizado (máx 180 chars) + prompts inteligentes</span>
              <span className={progress >= 30 ? 'text-green-600' : 'text-muted-foreground'}>
                {progress >= 30 ? '✓' : '⏳'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-500" />
                <span>🎨 Geração inteligente com fallbacks ({imageStats.generated + imageStats.fallbacks}/{imageStats.total})</span>
              </div>
              <span className={progress >= 90 ? 'text-green-600' : 'text-muted-foreground'}>
                {progress >= 90 ? '✓' : '⏳'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <span>📊 Monitoramento em tempo real</span>
              <span className={progress >= 100 ? 'text-green-600' : 'text-muted-foreground'}>
                {progress >= 100 ? '✓' : '⏳'}
              </span>
            </div>
            
            {imageStats.total > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-xs text-blue-800 space-y-1">
                  <div className="flex justify-between">
                    <span>Imagens AI geradas:</span>
                    <span className="font-semibold">{imageStats.generated}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fallbacks inteligentes:</span>
                    <span className="font-semibold">{imageStats.fallbacks}</span>
                  </div>
                  <div className="flex justify-between border-t border-blue-300 pt-1">
                    <span>Total processado:</span>
                    <span className="font-semibold">{imageStats.generated + imageStats.fallbacks}/{imageStats.total}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Voltar
        </Button>
        
        {status === 'error' && (
          <Button onClick={handleRetry}>
            Tentar Novamente
          </Button>
        )}
      </div>
    </div>
  );
};

export default Step4Processing;