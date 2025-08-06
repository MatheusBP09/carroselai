import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, Download, ArrowLeft, Check, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CarouselData } from '@/types/carousel';
import { renderTwitterPostToImage } from '@/services/renderToImageService';
import { TwitterPost } from '@/components/TwitterPost';

export default function DownloadPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [downloadingSlides, setDownloadingSlides] = useState<Set<number>>(new Set());
  const [previewImages, setPreviewImages] = useState<Map<number, string>>(new Map());
  const [loadingPreviews, setLoadingPreviews] = useState<Set<number>>(new Set());

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

  // Função melhorada para gerar preview da imagem
  const generatePreview = async (slideIndex: number) => {
    if (!data.slides || previewImages.has(slideIndex) || loadingPreviews.has(slideIndex)) return;

    setLoadingPreviews(prev => new Set(prev).add(slideIndex));
    
    try {
      const slide = data.slides[slideIndex];
      
      console.log(`🖼️ Generating preview for slide ${slideIndex + 1}`);
      
      const blob = await renderTwitterPostToImage({
        text: slide.text,
        username: data.username,
        handle: data.instagramHandle,
        isVerified: data.isVerified,
        profileImageUrl: slide.profileImageUrl,
        contentImageUrl: slide.contentImageUrls?.[0]
      });

      // Validate the blob before creating URL
      if (blob.size < 1000) {
        throw new Error('Generated preview is too small');
      }

      const imageUrl = URL.createObjectURL(blob);
      setPreviewImages(prev => new Map(prev).set(slideIndex, imageUrl));
      
      console.log(`✅ Preview generated for slide ${slideIndex + 1}, size: ${blob.size} bytes`);
    } catch (error) {
      console.error(`❌ Error generating preview for slide ${slideIndex + 1}:`, error);
      toast({
        title: "Erro no preview",
        description: `Não foi possível gerar preview do slide ${slideIndex + 1}`,
        variant: "destructive",
      });
    } finally {
      setLoadingPreviews(prev => {
        const newSet = new Set(prev);
        newSet.delete(slideIndex);
        return newSet;
      });
    }
  };

  // Função para validar e corrigir blob PNG
  const validateAndFixPngBlob = async (blob: Blob): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      img.onload = () => {
        try {
          // Set canvas dimensions to exact Instagram size
          canvas.width = 1080;
          canvas.height = 1350;
          
          // Fill with white background first
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Draw the image
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // Add PNG metadata
          canvas.toBlob((validBlob) => {
            if (validBlob && validBlob.size > 1000) {
              console.log('✅ PNG validated and corrected, size:', validBlob.size);
              resolve(validBlob);
            } else {
              reject(new Error('Invalid PNG blob generated'));
            }
          }, 'image/png', 1.0);
          
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load blob as image'));
      };
      
      img.src = URL.createObjectURL(blob);
    });
  };

  // Função robusta para download com múltiplos formatos
  const downloadImageWithFallback = async (blob: Blob, filename: string) => {
    const formats = [
      { ext: 'png', type: 'image/png', quality: 1.0 },
      { ext: 'jpg', type: 'image/jpeg', quality: 0.95 },
      { ext: 'webp', type: 'image/webp', quality: 0.95 }
    ];
    
    for (const format of formats) {
      try {
        let finalBlob = blob;
        
        // Re-encode if different format
        if (format.type !== 'image/png') {
          finalBlob = await new Promise<Blob>((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            if (!ctx) {
              reject(new Error('Canvas context not available'));
              return;
            }
            
            img.onload = () => {
              canvas.width = 1080;
              canvas.height = 1350;
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0);
              
              canvas.toBlob((newBlob) => {
                if (newBlob) resolve(newBlob);
                else reject(new Error('Format conversion failed'));
              }, format.type, format.quality);
            };
            
            img.onerror = () => reject(new Error('Image load failed'));
            img.src = URL.createObjectURL(blob);
          });
        }
        
        // Test download
        const url = URL.createObjectURL(finalBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename.replace(/\.(png|jpg|jpeg|webp)$/i, `.${format.ext}`);
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        
        console.log(`✅ Download successful with format: ${format.ext}`);
        return; // Success, exit loop
        
      } catch (error) {
        console.warn(`❌ Download failed with ${format.ext}:`, error);
        if (format === formats[formats.length - 1]) {
          throw new Error('All download formats failed');
        }
      }
    }
  };

  // Função melhorada para download de slide individual
  const handleDownloadSlide = async (slideIndex: number) => {
    if (!data.slides) return;

    setDownloadingSlides(prev => new Set(prev).add(slideIndex));
    
    try {
      const slide = data.slides[slideIndex];
      
      console.log(`🚀 Starting download for slide ${slideIndex + 1}`);
      
      const blob = await renderTwitterPostToImage({
        text: slide.text,
        username: data.username,
        handle: data.instagramHandle,
        isVerified: data.isVerified,
        profileImageUrl: slide.profileImageUrl,
        contentImageUrl: slide.contentImageUrls?.[0]
      });

      console.log('📦 Raw blob received, size:', blob.size);
      
      // Validate and fix the PNG blob
      const validatedBlob = await validateAndFixPngBlob(blob);
      
      console.log('✅ Blob validated, proceeding with download');
      
      // Download with fallback formats
      const filename = `slide-${slideIndex + 1}-${data.username.replace(/\s+/g, '-').toLowerCase()}.png`;
      await downloadImageWithFallback(validatedBlob, filename);

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
      let successCount = 0;
      let errorCount = 0;
      
      for (let i = 0; i < data.slides.length; i++) {
        try {
          const slide = data.slides[i];
          
          console.log(`🚀 Processing slide ${i + 1}/${data.slides.length}`);
          
          const blob = await renderTwitterPostToImage({
            text: slide.text,
            username: data.username,
            handle: data.instagramHandle,
            isVerified: data.isVerified,
            profileImageUrl: slide.profileImageUrl,
            contentImageUrl: slide.contentImageUrls?.[0]
          });

          // Validate and fix the PNG blob
          const validatedBlob = await validateAndFixPngBlob(blob);
          
          // Download with fallback formats
          const filename = `slide-${i + 1}-${data.username.replace(/\s+/g, '-').toLowerCase()}.png`;
          await downloadImageWithFallback(validatedBlob, filename);
          
          successCount++;
          console.log(`✅ Slide ${i + 1} downloaded successfully`);
          
        } catch (error) {
          errorCount++;
          console.error(`❌ Failed to download slide ${i + 1}:`, error);
        }
        
        // Delay entre downloads para evitar problemas
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      if (successCount === data.slides.length) {
        toast({
          title: "Sucesso!",
          description: `Todos os ${data.slides.length} slides foram baixados`,
        });
      } else if (successCount > 0) {
        toast({
          title: "Download parcial",
          description: `${successCount}/${data.slides.length} slides baixados com sucesso`,
          variant: "destructive",
        });
      } else {
        throw new Error('All slides failed to download');
      }
    } catch (error) {
      console.error('Error downloading slides:', error);
      toast({
        title: "Falha no download",
        description: "Falha ao baixar slides. Tente novamente.",
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
                
                {/* Preview da Imagem */}
                <div className="bg-muted rounded-lg overflow-hidden">
                  {previewImages.has(index) ? (
                    <div className="aspect-[4/5] relative">
                      <img 
                        src={previewImages.get(index)} 
                        alt={`Preview do Slide ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                        ✓ Pronto
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-[4/5] bg-muted p-4 flex flex-col justify-between">
                      <p className="text-sm text-foreground line-clamp-6">
                        {slide.text}
                      </p>
                      
                      {slide.contentImageUrls && slide.contentImageUrls.length > 0 && (
                        <div className="text-xs text-muted-foreground mt-2">
                          📸 Inclui imagem gerada
                        </div>
                      )}
                      
                      <Button 
                        onClick={() => generatePreview(index)}
                        disabled={loadingPreviews.has(index)}
                        variant="outline"
                        size="sm"
                        className="mt-3 self-center"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        {loadingPreviews.has(index) ? 'Gerando Preview...' : 'Ver Preview'}
                      </Button>
                    </div>
                  )}
                </div>

                <Button 
                  onClick={() => handleDownloadSlide(index)}
                  disabled={downloadingSlides.has(index)}
                  className="w-full flex items-center justify-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {downloadingSlides.has(index) ? 'Baixando...' : 'Baixar PNG'}
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
            <li>• Clique em "Ver Preview" para visualizar cada slide antes de baixar</li>
            <li>• Cada imagem está otimizada para Instagram em 1080×1350 pixels</li>
            <li>• Faça upload como um post carrossel no Instagram</li>
            <li>• Copie a legenda e hashtags usando o botão acima</li>
            <li>• Publique nos horários de maior engajamento para melhores resultados</li>
            <li>• Os arquivos PNG são otimizados para abrir em qualquer visualizador de imagem</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}