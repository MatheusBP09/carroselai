import { useState, useRef } from 'react';
import { ArrowRight, ArrowLeft, Upload, FileText, Trash2, Sliders, Target, Megaphone, PenTool, Zap, Image } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { StepProps, ContentType, ContentFormat, CallToAction, CopywritingFramework, ImageStyle } from '../types/carousel';
import { toast } from 'sonner';

export const Step2Content = ({ data, onNext, onBack }: StepProps) => {
  const [content, setContent] = useState(data.content || '');
  const [slideCount, setSlideCount] = useState(data.slideCount || 10);
  const [contentType, setContentType] = useState<ContentType>(data.contentType || 'educational');
  const [contentFormat, setContentFormat] = useState<ContentFormat>(data.contentFormat || 'feed');
  const [callToAction, setCallToAction] = useState<CallToAction>(data.callToAction || 'follow');
  const [customCTA, setCustomCTA] = useState(data.customCTA || '');
  const [copywritingFramework, setCopywritingFramework] = useState<CopywritingFramework>(data.copywritingFramework || 'aida');
  const [imageStyle, setImageStyle] = useState<ImageStyle>(data.imageStyle || 'photography');
  const [customImagePrompt, setCustomImagePrompt] = useState(data.customImagePrompt || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Arquivo muito grande. Máximo 5MB.');
      return;
    }

    try {
      const text = await file.text();
      if (text.length > 10000) {
        toast.warning('Texto muito longo. Será truncado para 10.000 caracteres.');
        setContent(text.substring(0, 10000));
      } else {
        setContent(text);
      }
      toast.success('Arquivo carregado com sucesso!');
    } catch (error) {
      toast.error('Erro ao ler arquivo. Tente novamente.');
    }
  };

  const handleNext = () => {
    if (content.length < 100) {
      toast.error('Conteúdo deve ter pelo menos 100 caracteres.');
      return;
    }
    
    const minCharPerSlide = slideCount * 50; // Minimum 50 chars per slide
    if (content.length < minCharPerSlide) {
      toast.warning(`Conteúdo parece curto para ${slideCount} slides. Continuando mesmo assim...`);
    }
    
    onNext({ 
      content, 
      slideCount, 
      contentType, 
      contentFormat, 
      callToAction, 
      customCTA: callToAction === 'custom' ? customCTA : undefined,
      copywritingFramework,
      imageStyle,
      customImagePrompt: customImagePrompt.trim() || undefined
    });
  };

  const clearContent = () => {
    setContent('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isContentValid = content.length >= 100 && content.length <= 10000;
  const characterCount = content.length;
  const isNearLimit = characterCount > 9500;

  const contentTypeOptions = [
    { value: 'educational', label: 'Educacional', icon: '📚', description: 'Ensine algo novo' },
    { value: 'motivational', label: 'Motivacional', icon: '💪', description: 'Inspire e motive' },
    { value: 'tutorial', label: 'Tutorial', icon: '🎯', description: 'Passo a passo' },
    { value: 'storytelling', label: 'Storytelling', icon: '📖', description: 'Conte uma história' },
    { value: 'business', label: 'Negócios', icon: '💼', description: 'Insights profissionais' },
    { value: 'lifestyle', label: 'Lifestyle', icon: '✨', description: 'Estilo de vida' },
    { value: 'tips', label: 'Dicas', icon: '💡', description: 'Dicas práticas' },
    { value: 'personal', label: 'Pessoal', icon: '👤', description: 'Experiência pessoal' }
  ];

  const formatOptions = [
    { value: 'feed', label: 'Feed (1080x1350)', description: 'Posts verticais para feed' },
    { value: 'stories', label: 'Stories (1080x1920)', description: 'Formato vertical para stories' },
    { value: 'reels', label: 'Reels (1080x1920)', description: 'Formato vertical para reels' }
  ];

  const frameworkOptions = [
    { value: 'aida', label: 'AIDA', description: 'Atenção → Interesse → Desejo → Ação' },
    { value: 'pas', label: 'PAS', description: 'Problema → Agitação → Solução' },
    { value: 'before_after_bridge', label: 'Before-After-Bridge', description: 'Estado atual → Futuro → Ponte' },
    { value: 'problem_solution', label: 'Problema-Solução', description: 'Identifica problema e oferece solução' },
    { value: 'storytelling', label: 'Storytelling', description: 'Narrativa envolvente' },
    { value: 'listicle', label: 'Lista', description: 'Lista estruturada de pontos' }
  ];

  const ctaOptions = [
    { value: 'follow', label: 'Seguir perfil' },
    { value: 'link_bio', label: 'Link na bio' },
    { value: 'comment', label: 'Comentar' },
    { value: 'share', label: 'Compartilhar' },
    { value: 'save', label: 'Salvar post' },
    { value: 'dm', label: 'Enviar DM' },
    { value: 'tag_friends', label: 'Marcar amigos' },
    { value: 'custom', label: 'Personalizado' }
  ];

  const imageStyleOptions = [
    { value: 'photography', label: 'Fotografia Profissional', icon: '📷', description: 'Imagens realistas e de alta qualidade' },
    { value: 'illustration', label: 'Ilustração Digital', icon: '🎨', description: 'Desenhos digitais modernos e vibrantes' },
    { value: 'minimalist', label: 'Minimalista', icon: '◻️', description: 'Design limpo e simples' },
    { value: 'infographic', label: 'Infográfico', icon: '📊', description: 'Ícones e visualização de dados' },
    { value: 'abstract_3d', label: 'Arte 3D Abstrata', icon: '🔮', description: 'Formas geométricas e gradientes' },
    { value: 'watercolor', label: 'Aquarela', icon: '🎭', description: 'Estilo artístico pintado' },
    { value: 'custom', label: 'Totalmente Personalizado', icon: '✏️', description: 'Use suas próprias instruções' }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="shadow-card border-0 bg-gradient-card">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-accent-blue to-primary rounded-2xl flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Passo 2: Configure seu Conteúdo
          </CardTitle>
          <p className="text-muted-foreground">
            Personalize o tipo, formato e estratégia do seu carrossel
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Content Configuration Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Content Type */}
            <div className="space-y-2">
              <Label htmlFor="contentType" className="text-sm font-medium flex items-center gap-2">
                <Target className="w-4 h-4" />
                Tipo de Conteúdo
              </Label>
              <Select value={contentType} onValueChange={(value: ContentType) => setContentType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {contentTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <span>{option.icon}</span>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-muted-foreground">{option.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Content Format */}
            <div className="space-y-2">
              <Label htmlFor="contentFormat" className="text-sm font-medium flex items-center gap-2">
                <Megaphone className="w-4 h-4" />
                Formato
              </Label>
              <Select value={contentFormat} onValueChange={(value: ContentFormat) => setContentFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {formatOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Copywriting Framework */}
            <div className="space-y-2">
              <Label htmlFor="framework" className="text-sm font-medium flex items-center gap-2">
                <PenTool className="w-4 h-4" />
                Framework de Copywriting
              </Label>
              <Select value={copywritingFramework} onValueChange={(value: CopywritingFramework) => setCopywritingFramework(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {frameworkOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Call to Action */}
            <div className="space-y-2">
              <Label htmlFor="cta" className="text-sm font-medium flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Call to Action
              </Label>
              <Select value={callToAction} onValueChange={(value: CallToAction) => setCallToAction(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ctaOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Custom CTA Input */}
          {callToAction === 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="customCTA" className="text-sm font-medium">
                CTA Personalizado
              </Label>
              <Input
                id="customCTA"
                placeholder="Ex: Baixe meu e-book gratuito"
                value={customCTA}
                onChange={(e) => setCustomCTA(e.target.value)}
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">
                Máximo 100 caracteres
              </p>
            </div>
          )}

          {/* Slide Count Selector */}
          <div className="space-y-2">
            <Label htmlFor="slideCount" className="text-sm font-medium flex items-center gap-2">
              <Sliders className="w-4 h-4" />
              Número de Slides
            </Label>
            <Select value={slideCount.toString()} onValueChange={(value) => setSlideCount(parseInt(value))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o número de slides" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} slide{num > 1 ? 's' : ''}
                    {num === 1 && ' (post único)'}
                    {num === 10 && ' (máximo)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Recomendado: 6-10 slides para máximo engagement
            </p>
          </div>

          {/* Image Style Section */}
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border/50">
            <div className="space-y-2">
              <Label htmlFor="imageStyle" className="text-sm font-medium flex items-center gap-2">
                <Image className="w-4 h-4" />
                Estilo das Imagens
              </Label>
              <Select value={imageStyle} onValueChange={(value: ImageStyle) => setImageStyle(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {imageStyleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <span>{option.icon}</span>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-muted-foreground">{option.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customImagePrompt" className="text-sm font-medium flex items-center gap-2">
                ✨ Instruções Adicionais
                <span className="text-xs font-normal text-muted-foreground">(opcional)</span>
              </Label>
              <Textarea
                id="customImagePrompt"
                placeholder="Ex: Cores vibrantes, fundo degradê azul e roxo, pessoas sorrindo, ambiente corporativo..."
                value={customImagePrompt}
                onChange={(e) => setCustomImagePrompt(e.target.value)}
                className="min-h-[80px] resize-none"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                💡 O estilo base será combinado com suas instruções para gerar imagens personalizadas
              </p>
            </div>
          </div>

          {/* Content Input */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
              <Label htmlFor="content" className="text-sm font-medium">
                Conteúdo Principal
              </Label>
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.pdf,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <EnhancedButton
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload Arquivo
                </EnhancedButton>
                {content && (
                  <EnhancedButton
                    variant="ghost"
                    size="sm"
                    onClick={clearContent}
                    className="gap-2 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                    Limpar
                  </EnhancedButton>
                )}
              </div>
            </div>

            <div className="relative">
              <Textarea
                id="content"
                placeholder="Cole aqui o texto que será transformado em carrossel de slides. Ex: artigo, post de blog, conteúdo educativo, etc."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className={`min-h-[200px] resize-none transition-all duration-300 ${
                  content && !isContentValid ? 'border-destructive focus:border-destructive' : 
                  isContentValid ? 'border-success focus:border-success' : ''
                }`}
                maxLength={10000}
              />
              
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <span className={`text-xs transition-colors ${
                  isNearLimit ? 'text-destructive' : 
                  characterCount > 5000 ? 'text-warning' : 'text-muted-foreground'
                }`}>
                  {characterCount.toLocaleString()}/10.000
                </span>
              </div>
            </div>

            {characterCount > 0 && characterCount < 100 && (
              <p className="text-sm text-destructive">
                Mínimo 100 caracteres necessários ({100 - characterCount} restantes)
              </p>
            )}

            {isContentValid && (
              <p className="text-sm text-success">
                ✓ Conteúdo válido para {slideCount} slides
              </p>
            )}

            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <h4 className="font-medium text-sm">Dica de Upload:</h4>
              <p className="text-xs text-muted-foreground">
                Aceita arquivos .txt, .pdf, .docx até 5MB. Ideal: artigos, posts de blog ou qualquer texto longo.
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            <EnhancedButton
              variant="outline"
              onClick={onBack}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </EnhancedButton>
            
            <EnhancedButton
              onClick={handleNext}
              disabled={!isContentValid}
              className="gap-2"
            >
              Próximo
              <ArrowRight className="w-4 h-4" />
            </EnhancedButton>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};