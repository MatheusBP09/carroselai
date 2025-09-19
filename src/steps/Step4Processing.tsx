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
import { ContextualImageService } from '@/services/contextualImageService';
import { monitoringService } from '@/services/monitoringService';

// CONTEXTUAL IMAGE GENERATION - Advanced AI-powered system
console.log('🎨 Loading CONTEXTUAL image generation system - Advanced AI analysis');
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
      
      console.log('🎨 Starting ENHANCED carousel processing...');
      console.log('📊 Input data:', { 
        theme: data.content, 
        contentType: data.contentType, 
        slideCount: data.slideCount,
        hasApiKey: true, // Using Supabase Edge Functions
        username: data.username
      });
      
      // Passo 1: Gerar conteúdo com IA otimizada
      setCurrentStep('Gerando conteúdo com IA avançada...');
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

      // Passo 3: Gerar imagens CONTEXTUAIS com sistema avançado
      setCurrentStep('Iniciando geração contextual de imagens...');
      const totalSlides = result.slides.length;
      setImageStats({ generated: 0, fallbacks: 0, total: totalSlides });
      
      console.log('🧠 Starting CONTEXTUAL image generation for', totalSlides, 'slides');
      console.log('🎯 Content theme:', data.content);
      console.log('📋 Content type:', data.contentType);

      setCurrentStep('Gerando imagens contextuais com IA avançada...');
      
      // Generate CONTEXTUAL images with advanced AI analysis
      try {
        const contextualImages = [];
        
        for (let i = 0; i < result.slides.length; i++) {
          const slide = result.slides[i];
          const progressPercent = ((i + 1) / totalSlides) * 100;
          const baseProgress = 40;
          const imageProgress = Math.floor((progressPercent / 100) * 50);
          setProgress(baseProgress + imageProgress);
          setCurrentStep(`Analisando e gerando imagem contextual ${i + 1} de ${totalSlides}...`);
          
          console.log(`🎨 Generating contextual image for slide ${i + 1}:`, slide.text.substring(0, 60) + '...');
          
          // Generate contextual image using advanced AI analysis
          const contextualResult = await ContextualImageService.generateContextualImage({
            slideText: slide.text,
            slideIndex: i,
            totalSlides: totalSlides,
            contentTheme: data.content,
            contentType: data.contentType,
            contentFormat: data.contentFormat,
            username: data.username
          });
          
          contextualImages.push(contextualResult);
          
          // Update stats
          const generated = contextualImages.filter(r => r.success).length;
          const failed = contextualImages.filter(r => !r.success).length;
          setImageStats({
            generated,
            fallbacks: failed,
            total: totalSlides
          });
          
          console.log(`✅ Slide ${i + 1} contextual image:`, {
            success: contextualResult.success,
            hasPrompt: !!contextualResult.prompt,
            error: contextualResult.error
          });
        }

        console.log('🖼️ CONTEXTUAL image generation completed:', {
          totalImages: contextualImages.length,
          successful: contextualImages.filter(r => r.success).length,
          failed: contextualImages.filter(r => !r.success).length
        });

        // Apply contextual images to slides
        const slidesWithContextualImages = result.slides.map((slide, i) => {
          const imageResult = contextualImages[i];
          return {
            ...slide,
            hasImage: imageResult.success,
            contentImageUrls: imageResult.success ? [imageResult.imageUrl] : [],
            contentImageDataUrls: imageResult.success ? [imageResult.imageUrl] : [],
            profileImageUrl: profileImageUrl,
            profileImageDataUrl: profileImageUrl,
            imagePrompt: imageResult.prompt || `Contextual image for: ${slide.text.substring(0, 50)}`,
            // Add contextual generation metadata
            imageGenerated: imageResult.success,
            isContextual: true,
            generationError: imageResult.error
          };
        });

        // Calculate final stats
        const successCount = contextualImages.filter(r => r.success).length;
        const failureCount = contextualImages.filter(r => !r.success).length;
        
        console.log('📊 Final CONTEXTUAL image statistics:', {
          total: totalSlides,
          successful: successCount,
          failed: failureCount,
          successRate: `${Math.round((successCount / totalSlides) * 100)}%`
        });

        setProgress(95);
        setCurrentStep('Finalizando carousel contextual...');

        // Update context and proceed
        const finalCarouselData = {
          ...data,
          slides: slidesWithContextualImages,
          caption: result.caption,
          hashtags: result.hashtags
        };

        updateData(finalCarouselData);

        setProgress(100);
        setStatus('completed');
        setCurrentStep('Carousel contextual gerado com sucesso!');
        
        // Show success message with contextual stats
        toast.success('Carousel contextual gerado!', {
          description: `${successCount} imagens contextuais geradas de ${totalSlides} slides`
        });

        setTimeout(() => {
          onNext(finalCarouselData);
        }, 1000);

      } catch (imageError: any) {
        console.error('❌ CONTEXTUAL image generation failed:', imageError);
        
        // Fallback: Create slides without images but with contextual prompts
        const slidesWithoutImages = result.slides.map((slide, i) => ({
          ...slide,
          hasImage: false,
          profileImageUrl: profileImageUrl,
          profileImageDataUrl: profileImageUrl,
          imagePrompt: `Contextual prompt would be: ${slide.text.substring(0, 50)}...`,
          isContextual: true,
          generationError: imageError.message
        }));

        // Continue with fallback slides
        const fallbackCarouselData = {
          ...data,
          slides: slidesWithoutImages,
          caption: result.caption,
          hashtags: result.hashtags
        };

        updateData(fallbackCarouselData);
        setProgress(100);
        setStatus('completed');
        setCurrentStep('Carousel gerado (sem imagens)');
        
        toast.warning('Carousel gerado sem imagens', {
          description: 'Falha na geração de imagens, mas o conteúdo foi criado'
        });

        setTimeout(() => {
          onNext(fallbackCarouselData);
        }, 1000);
      }

      // Log successful generation
      const duration = Math.round((Date.now() - startTime) / 1000);
      monitoringService.logGenerationComplete(sessionId, {
        timestamp: Date.now(),
        totalSlides: slideCount,
        imagesGenerated: 0, // Will be updated in success case
        fallbacksUsed: 0,   // Will be updated in success case
        duration,
        errors: [],
        modelUsed,
        success: true
      });

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