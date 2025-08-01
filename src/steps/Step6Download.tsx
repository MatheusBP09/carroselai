import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Share2, RotateCcw, CheckCircle, Instagram } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { StepProps } from '../types/carousel';
import { useCarousel } from '../context/CarouselContext';
import { toast } from '@/hooks/use-toast';
import { downloadCarouselAsZip, testSlideRendering, ZipDownloadProgress } from '@/services/zipDownloadService';

export const Step6Download = ({ data, onBack }: StepProps) => {
  const { resetCarousel } = useCarousel();
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<ZipDownloadProgress | null>(null);
  const [isTestingSlide, setIsTestingSlide] = useState<number | null>(null);

  const handleGoToDownloadPage = () => {
    navigate('/download', { state: { data } });
  };

  const handleTestSlide = async (slideIndex: number) => {
    if (!data.slides || slideIndex >= data.slides.length) {
      toast({
        title: "Erro",
        description: "Slide inválido",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsTestingSlide(slideIndex);
      console.log(`Testing slide ${slideIndex + 1}...`);
      
      const result = await testSlideRendering(data, slideIndex);
      
      if (result.success) {
        toast({
          title: "Teste bem-sucedido!",
          description: `Slide ${slideIndex + 1} foi renderizado e baixado para teste.`,
        });
      } else {
        toast({
          title: "Falha no teste",
          description: `Erro ao renderizar slide ${slideIndex + 1}: ${result.error}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Test slide error:', error);
      toast({
        title: "Erro no teste",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsTestingSlide(null);
    }
  };

  const handleCopyCaption = () => {
    const fullText = `${data.caption}\n\n${data.hashtags?.join(' ') || ''}`;
    navigator.clipboard.writeText(fullText).then(() => {
      toast({
        title: "Copiado!",
        description: "Legenda e hashtags copiadas para a área de transferência.",
      });
    });
  };

  const handleNewCarousel = () => {
    resetCarousel();
    toast({
      title: "Novo carrossel iniciado",
      description: "Você pode criar um novo carrossel agora.",
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="shadow-card border-0 bg-gradient-card">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-4 shadow-elegant">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Passo 6: Download e Compartilhamento
          </CardTitle>
          <p className="text-muted-foreground">
            Seu carrossel está pronto! Baixe ou copie o conteúdo
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              🎉 Carrossel gerado com {data.slides?.length || 0} imagens estilo Twitter/X! Baixe cada imagem individualmente e publique no Instagram.
            </AlertDescription>
          </Alert>


          {/* Resumo do Carrossel */}
          <div className="bg-gradient-to-r from-muted/50 to-muted/30 p-6 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{data.title}</h3>
              <div className="flex items-center gap-2">
                <Instagram className="w-4 h-4" />
                <span className="text-sm">{data.instagramHandle}</span>
                {data.isVerified && <CheckCircle className="w-4 h-4 text-accent-blue" />}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{data.slides?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Tweets</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-accent">{data.caption?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Caracteres na legenda</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-secondary">{data.hashtags?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Hashtags</div>
              </div>
            </div>
          </div>

          {/* Preview da Legenda */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Legenda e Hashtags</h4>
              <EnhancedButton
                variant="outline"
                size="sm"
                onClick={handleCopyCaption}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Copiar
              </EnhancedButton>
            </div>
            
            <div className="bg-muted/50 p-4 rounded-lg max-h-40 overflow-y-auto">
              <p className="text-sm whitespace-pre-wrap mb-3">{data.caption}</p>
              <div className="flex flex-wrap gap-1">
                {data.hashtags?.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          {/* Ações */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <EnhancedButton
                variant="instagram"
                size="xl"
                onClick={handleGoToDownloadPage}
                className="w-full"
              >
                <Download className="w-5 h-5 mr-2" />
                Baixar Imagens ({data.slides?.length || 0} slides)
              </EnhancedButton>
              
              <EnhancedButton
                variant="outline"
                size="xl"
                onClick={handleNewCarousel}
                className="w-full"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Criar Novo Carrossel
              </EnhancedButton>
            </div>

            {/* Debug Options */}
            <details className="bg-muted/30 p-4 rounded-lg">
              <summary className="cursor-pointer font-medium text-sm mb-3">🔧 Opções de Debug (expandir se houver problemas)</summary>
              <div className="space-y-4">
                <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg">
                  <p className="text-xs text-amber-800 dark:text-amber-200 font-medium mb-2">
                    ⚠️ Se o download falhar ou o ZIP estiver muito pequeno:
                  </p>
                  <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
                    <li>• Problemas com imagens são comuns devido a restrições CORS</li>
                    <li>• O sistema tentará automaticamente métodos alternativos</li>
                    <li>• Teste slides individuais para identificar problemas específicos</li>
                  </ul>
                </div>
                
                <div>
                  <p className="text-xs text-muted-foreground mb-2 font-medium">
                    Teste slides individuais:
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {data.slides?.map((slide, index) => (
                      <EnhancedButton
                        key={index}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTestSlide(index)}
                        disabled={isTestingSlide !== null}
                        className="text-xs relative"
                        title={`Testar renderização do slide: "${slide.text.substring(0, 50)}..."`}
                      >
                        {isTestingSlide === index ? 'Testando...' : `Slide ${index + 1}`}
                        {(slide.profileImageUrl || slide.contentImageUrls?.[0]) && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" title="Slide com imagem" />
                        )}
                      </EnhancedButton>
                    ))}
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground space-y-1 border-t pt-3">
                  <p className="font-medium">Dicas de troubleshooting:</p>
                  <p>• Abra o console do navegador (F12) para ver logs detalhados</p>
                  <p>• Cada teste baixa uma imagem individual para verificação</p>
                  <p>• Verifique se o bloqueador de pop-ups está desabilitado</p>
                  <p>• Imagens externas podem falhar devido a políticas CORS</p>
                  <p>• Em caso de falha persistente, imagens padrão serão usadas</p>
                </div>
              </div>
            </details>
          </div>

          {/* Dicas */}
          <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
            <h4 className="font-medium mb-2 text-blue-900 dark:text-blue-100">📱 Dicas para usar seu carrossel:</h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Baixe cada imagem individualmente clicando no botão "Baixar Imagens"</li>
              <li>• Publique todas as imagens no Instagram como carrossel</li>
              <li>• Use a legenda e hashtags copiadas</li>
              <li>• As imagens têm o formato ideal para Instagram (1080x1350px)</li>
              <li>• O design imita posts do Twitter/X para maior familiaridade</li>
              <li>• Publique nos horários de maior engajamento</li>
            </ul>
          </div>

          <div className="flex gap-4 pt-4">
            <EnhancedButton
              variant="outline"
              size="xl"
              onClick={onBack}
              className="flex-1"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar para Revisão
            </EnhancedButton>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Step6Download;