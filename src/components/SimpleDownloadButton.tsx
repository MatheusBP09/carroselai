import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Download, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { SimpleDownloadService, DownloadProgress } from '@/services/simpleDownloadService';
import { CarouselData } from '@/types/carousel';

interface SimpleDownloadButtonProps {
  data: CarouselData;
  slideIndex?: number; // If provided, downloads single slide, otherwise all slides
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
}

export const SimpleDownloadButton: React.FC<SimpleDownloadButtonProps> = ({
  data,
  slideIndex,
  variant = 'default',
  size = 'default'
}) => {
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (isDownloading) return;

    setIsDownloading(true);
    setProgress({
      current: 0,
      total: slideIndex !== undefined ? 1 : (data.slides?.length || 0),
      status: 'preparing',
      message: 'Iniciando download...'
    });

    try {
      if (slideIndex !== undefined) {
        // Download single slide
        await SimpleDownloadService.downloadSingleSlide(data, slideIndex, setProgress);
        
        toast({
          title: "Sucesso!",
          description: `Slide ${slideIndex + 1} baixado com sucesso`,
        });
      } else {
        // Download all slides
        await SimpleDownloadService.downloadAllSlides(data, setProgress);
        
        toast({
          title: "Sucesso!",
          description: `Todos os ${data.slides?.length || 0} slides baixados com sucesso`,
        });
      }
    } catch (error) {
      console.error('Download error:', error);
      
      toast({
        title: "Erro no download",
        description: error instanceof Error ? error.message : "Falha no download. Tente novamente.",
        variant: "destructive",
      });
      
      setProgress(prev => prev ? { ...prev, status: 'error' } : null);
    } finally {
      setIsDownloading(false);
      // Clear progress after delay
      setTimeout(() => setProgress(null), 2000);
    }
  };

  const getButtonContent = () => {
    if (!isDownloading) {
      return (
        <>
          <Download className="w-4 h-4 mr-2" />
          {slideIndex !== undefined ? `Baixar Slide ${slideIndex + 1}` : 'Baixar Todos'}
        </>
      );
    }

    switch (progress?.status) {
      case 'preparing':
        return (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Preparando...
          </>
        );
      case 'rendering':
      case 'downloading':
        return (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {progress.message || 'Processando...'}
          </>
        );
      case 'complete':
        return (
          <>
            <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
            Concluído!
          </>
        );
      case 'error':
        return (
          <>
            <AlertCircle className="w-4 h-4 mr-2 text-red-500" />
            Erro
          </>
        );
      default:
        return (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processando...
          </>
        );
    }
  };

  const progressPercentage = progress ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <div className="space-y-2">
      <Button
        onClick={handleDownload}
        disabled={isDownloading}
        variant={variant}
        size={size}
        className="min-w-40"
      >
        {getButtonContent()}
      </Button>
      
      {progress && isDownloading && progress.status !== 'complete' && (
        <div className="space-y-1">
          <Progress value={progressPercentage} className="w-full" />
          <p className="text-xs text-muted-foreground text-center">
            {progress.message}
          </p>
        </div>
      )}
    </div>
  );
};