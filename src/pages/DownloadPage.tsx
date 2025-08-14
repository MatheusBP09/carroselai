import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Copy, Eye } from 'lucide-react';
import { CarouselData } from '@/types/carousel';
import { TwitterPost } from '@/components/TwitterPost';
import { SimpleDownloadButton } from '@/components/SimpleDownloadButton';
import { generateTwitterImage } from '@/utils/twitter';
import { toast } from '@/hooks/use-toast';

export const DownloadPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state?.data as CarouselData;

  const [copiedCaption, setCopiedCaption] = useState(false);
  const [previewImages, setPreviewImages] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    if (!data || !data.slides) {
      navigate('/');
    }
  }, [data, navigate]);

  if (!data || !data.slides) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  const generatePreview = async (slideIndex: number) => {
    if (previewImages[slideIndex]) return;

    const slide = data.slides![slideIndex];
    try {
      console.log(`🔍 Generating preview for slide ${slideIndex + 1} using Fabric.js`);
      const dataUrl = await generateTwitterImage({
        text: slide.text,
        username: data.username,
        handle: data.instagramHandle,
        isVerified: data.isVerified,
        profileImageUrl: slide.profileImageUrl,
        contentImageUrl: slide.customImageUrl || slide.contentImageUrls?.[0]
      });

      const url = dataUrl;
      setPreviewImages(prev => ({ ...prev, [slideIndex]: url }));
      console.log(`✅ Preview generated for slide ${slideIndex + 1}`);
    } catch (error) {
      console.error(`❌ Error generating preview for slide ${slideIndex + 1}:`, error);
      toast({
        title: "Erro no preview",
        description: `Não foi possível gerar o preview do slide ${slideIndex + 1}`,
        variant: "destructive",
      });
    }
  };

  const copyCaption = () => {
    const fullCaption = `${data.caption}\n\n${data.hashtags?.join(' ') || ''}`;
    navigator.clipboard.writeText(fullCaption);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
    
    toast({
      title: "Copiado!",
      description: "Legenda copiada para a área de transferência",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              <div>
                <h1 className="text-xl font-semibold">Download dos Slides</h1>
                <p className="text-sm text-muted-foreground">
                  {data.slides.length} slide{data.slides.length !== 1 ? 's' : ''} criado{data.slides.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Caption and hashtags */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-medium mb-2">Legenda</h2>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {data.caption}
                </p>
              </div>
              
              {data.hashtags && data.hashtags.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Hashtags</h3>
                  <div className="flex flex-wrap gap-2">
                    {data.hashtags.map((hashtag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {hashtag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={copyCaption}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                {copiedCaption ? 'Copiado!' : 'Copiar legenda completa'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Download all button */}
        <div className="flex justify-center">
          <SimpleDownloadButton 
            data={data}
            variant="outline"
            size="lg"
          />
        </div>

        {/* Individual slides */}
        <div className="space-y-6">
          <h2 className="text-lg font-medium">Slides Individuais</h2>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.slides.map((slide, index) => (
              <Card key={slide.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Slide {index + 1}</h3>
                      <Button
                        onClick={() => generatePreview(index)}
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Preview
                      </Button>
                    </div>

                    {previewImages[index] && (
                      <div className="aspect-[4/5] bg-muted rounded-lg overflow-hidden">
                        <img
                          src={previewImages[index]}
                          alt={`Preview slide ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {slide.text}
                      </p>
                      
                      <SimpleDownloadButton
                        data={data}
                        slideIndex={index}
                        variant="outline"
                        size="sm"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Usage instructions */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-medium mb-3">Como usar no Instagram</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Faça upload dos slides na ordem correta</li>
              <li>• Use a legenda e hashtags copiadas acima</li>
              <li>• Configure como carrossel no Instagram</li>
              <li>• Publique e engaje com sua audiência!</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DownloadPage;