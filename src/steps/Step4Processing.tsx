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

// Helper functions for image generation fallback
const shouldGenerateImageForSlide = (text: string): boolean => {
  const imageKeywords = [
    'estatística', 'dados', 'número', 'gráfico', 'comparação', 'vs', 'processo',
    'passo', 'etapa', 'tutorial', 'como', 'exemplo', 'resultado', 'antes',
    'depois', 'diferença', 'tabela', 'lista', 'ranking', 'top', 'melhores',
    'piores', 'crescimento', 'diminuição', 'aumento', 'redução', '%', 'porcentagem'
  ];
  
  return imageKeywords.some(keyword => 
    text.toLowerCase().includes(keyword)
  );
};

const generateFallbackImagePrompt = (text: string): string => {
  const cleanText = text.replace(/[🧵📊💡⚡🔥✨💰📈📉🎯🚀]/g, '').trim();
  
  if (cleanText.includes('estatística') || cleanText.includes('dados') || cleanText.includes('%')) {
    return `Gráfico moderno e minimalista mostrando estatísticas, design clean e profissional`;
  }
  
  if (cleanText.includes('processo') || cleanText.includes('passo') || cleanText.includes('etapa')) {
    return `Diagrama de processo visual, design moderno e minimalista, cores suaves`;
  }
  
  if (cleanText.includes('comparação') || cleanText.includes('vs') || cleanText.includes('diferença')) {
    return `Comparação visual lado a lado, design limpo e profissional`;
  }
  
  return `Ilustração conceitual moderna relacionada ao texto: ${cleanText.substring(0, 100)}`;
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
        openaiApiKey: data.openaiApiKey || '',
        slideCount
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

      // Passo 3: Gerar imagens de conteúdo para slides que precisam
      setCurrentStep('Gerando imagens de conteúdo...');
      const slidesWithImages = [];
      const totalSlides = result.slides.length;
      
      for (let i = 0; i < totalSlides; i++) {
        const slide = result.slides[i];
        setProgress(30 + (i / totalSlides) * 60);
        setCurrentStep(`Processando slide ${i + 1} de ${totalSlides}...`);
        
        let contentImageUrls: string[] = [];
        
        // Check if slide needs image (from AI response or fallback logic)
        const needsImage = (slide as any).needsImage || shouldGenerateImageForSlide(slide.text);
        const imagePrompt = (slide as any).imagePrompt || generateFallbackImagePrompt(slide.text);
        
        if (needsImage && imagePrompt) {
          try {
            setCurrentStep(`Gerando imagem para slide ${i + 1} de ${totalSlides}...`);
            
            // Generate content image with retry logic
            let retryCount = 0;
            const maxRetries = 2;
            
            while (retryCount <= maxRetries) {
              try {
                const contentImage = await generateContentImage({
                  text: imagePrompt,
                  style: 'photorealistic',
                  apiKey: data.openaiApiKey || ''
                });
                
                contentImageUrls = [contentImage.imageUrl];
                console.log(`✅ Imagem gerada com sucesso para slide ${i + 1}`);
                break;
              } catch (retryError) {
                retryCount++;
                console.warn(`⚠️ Tentativa ${retryCount} falhou para slide ${i + 1}:`, retryError);
                
                if (retryCount > maxRetries) {
                  throw retryError;
                }
                
                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
            }
          } catch (imageError) {
            console.error(`❌ Erro ao gerar imagem ${i + 1} após 3 tentativas:`, imageError);
            toast.warning(`Slide ${i + 1} será criado sem imagem`);
          }
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
              <span>🎨 Gerando imagens estilo Twitter/X</span>
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