import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Bot, CheckCircle, AlertCircle, Image, Bug } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCarousel } from '@/context/CarouselContext';
import { generateCarousel } from '@/utils/aiService';
import { generateContentImage, convertProfileImageToUrl } from '@/services/imageGenerationService';

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
  
  // Get position-based variations first
  const positionVariations = getImagePromptVariations(slideIndex, totalSlides);
  
  // Content-based detection with enhanced prompts
  if (cleanText.includes('estatística') || cleanText.includes('dados') || cleanText.includes('%')) {
    return `${positionVariations[0]} com foco em dados estatísticos, cores vibrantes e tipografia moderna`;
  }
  
  if (cleanText.includes('processo') || cleanText.includes('passo') || cleanText.includes('etapa')) {
    return `${positionVariations[0]} representando fluxo de processo, elementos conectados e design profissional`;
  }
  
  if (cleanText.includes('comparação') || cleanText.includes('vs') || cleanText.includes('diferença')) {
    return `${positionVariations[0]} mostrando comparação visual, layout balanceado e cores contrastantes`;
  }
  
  if (cleanText.includes('dica') || cleanText.includes('estratégia') || cleanText.includes('método')) {
    return `${positionVariations[0]} representando conceito de estratégia, elementos inspiracionais e design moderno`;
  }
  
  // Fallback with enhanced prompt based on position
  return `${positionVariations[0]} relacionado ao conteúdo: ${cleanText.substring(0, 80)}, design 2024 com gradientes suaves`;
};
import { StepProps } from '@/types/carousel';
import { toast } from 'sonner';

type ProcessingStatus = 'processing' | 'completed' | 'error';

const Step4Processing = ({ data, onNext, onBack }: StepProps) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<ProcessingStatus>('processing');
  const [error, setError] = useState<string>('');
  const [currentStep, setCurrentStep] = useState('');
  const { updateData } = useCarousel();

  useEffect(() => {
    processCarousel();
  }, []);

  const processCarousel = async () => {
    try {
      setStatus('processing');
      setError('');
      
      // Passo 1: Gerar conteúdo com IA
      setCurrentStep('Gerando tweets com IA...');
      setProgress(10);
      
      const slideCount = data.slideCount || 10;
      
      const result = await generateCarousel({
        title: data.title,
        username: data.username || data.instagramHandle.replace('@', ''),
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

      // Passo 3: Gerar imagens para TODAS as slides (100% coverage)
      setCurrentStep('Gerando imagens para todas as slides...');
      const slidesWithImages = [];
      const totalSlides = result.slides.length;
      let generatedImagesCount = 0;
      
      for (let i = 0; i < totalSlides; i++) {
        const slide = result.slides[i];
        setProgress(30 + (i / totalSlides) * 60);
        setCurrentStep(`Gerando imagem para slide ${i + 1} de ${totalSlides}...`);
        
        let contentImageUrls: string[] = [];
        
        // ALWAYS generate images for 100% coverage
        const needsImage = true;
        const imagePrompt = (slide as any).imagePrompt || generateEnhancedImagePrompt(slide.text, i, totalSlides);
        
        // Generate image for every slide
        try {
          // Generate content image with enhanced retry logic
          let retryCount = 0;
          const maxRetries = 3; // Increased retries for 100% success rate
          
          while (retryCount <= maxRetries) {
            try {
              const contentImage = await generateContentImage({
                text: imagePrompt,
                style: 'modern',
                contentFormat: data.contentFormat,
                contentType: data.contentType
              });
              
              contentImageUrls = [contentImage.imageUrl];
              generatedImagesCount++;
              console.log(`✅ Imagem ${i + 1}/${totalSlides} gerada com sucesso! Prompt: "${imagePrompt.substring(0, 50)}..."`);
              break;
            } catch (retryError) {
              retryCount++;
              console.warn(`⚠️ Tentativa ${retryCount}/${maxRetries + 1} falhou para slide ${i + 1}:`, retryError);
              
              if (retryCount > maxRetries) {
                // Final fallback with simple prompt
                try {
                  const fallbackImage = await generateContentImage({
                    text: `Design minimalista moderno para slide ${i + 1}, cores vibrantes e tipografia bold`,
                    style: 'modern',
                    contentFormat: data.contentFormat,
                    contentType: data.contentType
                  });
                  contentImageUrls = [fallbackImage.imageUrl];
                  generatedImagesCount++;
                  console.log(`✅ Imagem ${i + 1} gerada com prompt de fallback`);
                  break;
                } catch (fallbackError) {
                  throw fallbackError;
                }
              }
              
              // Progressive wait time
              await new Promise(resolve => setTimeout(resolve, retryCount * 1000));
            }
          }
        } catch (imageError) {
          console.error(`❌ Erro crítico ao gerar imagem ${i + 1} após todas as tentativas:`, imageError);
          toast.error(`Falha na geração da imagem ${i + 1}. Tentando novamente...`);
          // Continue without image as last resort
        }
        
        slidesWithImages.push({
          ...slide,
          needsImage,
          imagePrompt,
          contentImageUrls,
          profileImageUrl
        });
      }

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

      // Auto-avançar após 2 segundos
      setTimeout(() => {
        onNext({
          slides: slidesWithImages,
          caption: result.caption,
          hashtags: result.hashtags
        });
      }, 2000);

    } catch (error: any) {
      console.error('Erro na geração do carrossel:', error);
      setError(error.message || 'Erro desconhecido na geração do carrossel');
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
                Seu carrossel foi gerado com sucesso! Redirecionando para revisão...
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
            <Image className="w-5 h-5" />
            Processo de geração
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <span>✨ Analisando conteúdo com IA</span>
              <span className={progress >= 10 ? 'text-green-600' : 'text-muted-foreground'}>
                {progress >= 10 ? '✓' : '⏳'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <span>📝 Criando {data.slideCount || 10} tweets otimizados</span>
              <span className={progress >= 30 ? 'text-green-600' : 'text-muted-foreground'}>
                {progress >= 30 ? '✓' : '⏳'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <span>🎨 Gerando imagens para todas as {data.slideCount || 10} slides</span>
              <span className={progress >= 90 ? 'text-green-600' : 'text-muted-foreground'}>
                {progress >= 90 ? '✓' : '⏳'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <span>🎯 Finalizando carrossel</span>
              <span className={progress >= 100 ? 'text-green-600' : 'text-muted-foreground'}>
                {progress >= 100 ? '✓' : '⏳'}
              </span>
            </div>
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