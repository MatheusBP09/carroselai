import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, Download, ArrowLeft, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CarouselData } from '@/types/carousel';
import { renderTwitterPostToImage } from '@/services/renderToImageService';

export default function DownloadPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [downloadingSlides, setDownloadingSlides] = useState<Set<number>>(new Set());

  const data = location.state?.data as CarouselData;

  if (!data || !data.slides) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">No carousel data found</h1>
          <Button onClick={() => navigate('/')}>Go to Home</Button>
        </Card>
      </div>
    );
  }

  const handleDownloadSlide = async (slideIndex: number) => {
    if (!data.slides) return;

    setDownloadingSlides(prev => new Set(prev).add(slideIndex));
    
    try {
      const slide = data.slides[slideIndex];
      
      const blob = await renderTwitterPostToImage({
        text: slide.text,
        username: data.username,
        handle: data.instagramHandle,
        isVerified: data.isVerified,
        profileImageUrl: slide.profileImageUrl,
        contentImageUrl: slide.contentImageUrls?.[0]
      });

      // Ensure proper PNG blob with correct MIME type
      const pngBlob = new Blob([blob], { type: 'image/png' });

      // Create download link with proper MIME type
      const url = URL.createObjectURL(pngBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `slide-${slideIndex + 1}-${data.username.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.type = 'image/png';
      
      // Add link to DOM, trigger download, then cleanup
      document.body.appendChild(link);
      link.click();
      
      // Cleanup after a short delay
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);

      toast({
        title: "Sucesso!",
        description: `Slide ${slideIndex + 1} baixado com sucesso`,
      });
    } catch (error) {
      console.error('Error downloading slide:', error);
      toast({
        title: "Falha no download",
        description: `Falha ao baixar slide ${slideIndex + 1}. Tente novamente.`,
        variant: "destructive",
      });
    } finally {
      setDownloadingSlides(prev => {
        const newSet = new Set(prev);
        newSet.delete(slideIndex);
        return newSet;
      });
    }
  };

  const handleDownloadAll = async () => {
    if (!data.slides) return;
    
    setDownloadingSlides(new Set([...Array(data.slides.length).keys()]));
    
    try {
      for (let i = 0; i < data.slides.length; i++) {
        const slide = data.slides[i];
        
        const blob = await renderTwitterPostToImage({
          text: slide.text,
          username: data.username,
          handle: data.instagramHandle,
          isVerified: data.isVerified,
          profileImageUrl: slide.profileImageUrl,
          contentImageUrl: slide.contentImageUrls?.[0]
        });

        // Ensure proper PNG blob with correct MIME type
        const pngBlob = new Blob([blob], { type: 'image/png' });
        
        // Create download link
        const url = URL.createObjectURL(pngBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `slide-${i + 1}-${data.username.replace(/\s+/g, '-').toLowerCase()}.png`;
        link.type = 'image/png';
        
        // Add link to DOM, trigger download, then cleanup
        document.body.appendChild(link);
        link.click();
        
        // Cleanup and delay between downloads
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, 100);
        
        // Small delay between downloads to prevent browser blocking
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      toast({
        title: "Sucesso!",
        description: `Todos os ${data.slides.length} slides foram baixados`,
      });
    } catch (error) {
      console.error('Error downloading all slides:', error);
      toast({
        title: "Falha no download",
        description: "Falha ao baixar alguns slides. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setDownloadingSlides(new Set());
    }
  };

  const handleCopyCaption = async () => {
    const captionText = `${data.caption || ''}\n\n${(data.hashtags || []).join(' ')}`;
    
    try {
      await navigator.clipboard.writeText(captionText);
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2000);
      toast({
        title: "Copied!",
        description: "Caption and hashtags copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao Início</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Baixar Seu Carrossel</h1>
              <p className="text-muted-foreground">@{data.instagramHandle} • {data.slides.length} slides</p>
            </div>
          </div>
        </div>

        {/* Caption Section */}
        {(data.caption || data.hashtags) && (
          <Card className="p-6 mb-8">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-lg font-semibold mb-3">Legenda & Hashtags</h2>
                {data.caption && (
                  <p className="text-foreground mb-4 whitespace-pre-wrap">
                    {data.caption}
                  </p>
                )}
                {data.hashtags && data.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {data.hashtags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <Button 
                onClick={handleCopyCaption}
                variant="outline"
                className="ml-4 flex items-center space-x-2"
              >
                {copiedCaption ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar Tudo</span>
                  </>
                )}
              </Button>
            </div>
          </Card>
        )}

        {/* Download All Button */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold mb-2">Download Automático</h2>
              <p className="text-muted-foreground">Baixe todos os slides de uma vez</p>
            </div>
            <Button 
              onClick={handleDownloadAll}
              disabled={downloadingSlides.size > 0}
              className="flex items-center space-x-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              <Download className="w-4 h-4" />
              <span>
                {downloadingSlides.size > 0 
                  ? `Baixando... (${downloadingSlides.size}/${data.slides.length})`
                  : `Baixar Todos (${data.slides.length} slides)`
                }
              </span>
            </Button>
          </div>
        </Card>

        {/* Slides Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.slides.map((slide, index) => (
            <Card key={slide.id} className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Slide {index + 1}</h3>
                  <Badge variant="outline">1080×1350</Badge>
                </div>
                
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-foreground line-clamp-4">
                    {slide.text}
                  </p>
                </div>

                {slide.contentImageUrls && slide.contentImageUrls.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    📸 Includes generated image
                  </div>
                )}

                <Button 
                  onClick={() => handleDownloadSlide(index)}
                  disabled={downloadingSlides.has(index)}
                  className="w-full flex items-center justify-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {downloadingSlides.has(index) ? 'Gerando...' : 'Baixar PNG'}
                  </span>
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Instructions */}
        <Card className="p-6 mt-8">
          <h3 className="font-semibold mb-3">Como usar essas imagens:</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Cada imagem está otimizada para Instagram em 1080×1350 pixels</li>
            <li>• Faça upload como um post carrossel no Instagram</li>
            <li>• Copie a legenda e hashtags usando o botão acima</li>
            <li>• Publique nos horários de maior engajamento para melhores resultados</li>
            <li>• Se houver problema para abrir os arquivos PNG, tente associá-los a um visualizador de imagens</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}