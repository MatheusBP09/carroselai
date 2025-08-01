import { useState, useRef } from 'react';
import { ArrowRight, ArrowLeft, Upload, FileText, Trash2, Sliders } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { StepProps } from '../types/carousel';
import { toast } from 'sonner';

export const Step2Content = ({ data, onNext, onBack }: StepProps) => {
  const [content, setContent] = useState(data.content || '');
  const [slideCount, setSlideCount] = useState(data.slideCount || 10);
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
    
    onNext({ content, slideCount });
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

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="shadow-card border-0 bg-gradient-card">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-accent-blue to-primary rounded-2xl flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Passo 2: Insira seu Conteúdo
          </CardTitle>
          <p className="text-muted-foreground">
            Cole o texto que será transformado em carrossel de {slideCount} slide{slideCount > 1 ? 's' : ''}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
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
              {slideCount === 1 
                ? 'Um post único e completo será criado'
                : slideCount <= 3
                ? 'Ideal para conteúdo conciso'
                : slideCount <= 7
                ? 'Bom para desenvolvimento de ideias'
                : 'Máximo engajamento com thread completa'
              }
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="content" className="text-sm font-medium">
                Conteúdo do Carrossel *
              </Label>
              {content && (
                <EnhancedButton
                  variant="ghost"
                  size="sm"
                  onClick={clearContent}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                  Limpar Tudo
                </EnhancedButton>
              )}
            </div>
            
            <Textarea
              id="content"
              placeholder="Cole aqui seu artigo, newsletter, transcrição ou qualquer texto longo..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[400px] font-mono text-sm leading-relaxed resize-none transition-all duration-300 focus:border-primary"
              maxLength={10000}
            />
            
            <div className="flex justify-between items-center">
              <span className={`text-sm ${isNearLimit ? 'text-warning' : 'text-muted-foreground'}`}>
                {characterCount}/10.000 caracteres
              </span>
              {characterCount < 100 && (
                <span className="text-sm text-destructive">
                  Mínimo 100 caracteres
                </span>
              )}
            </div>
          </div>

          {/* Upload Area */}
          <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center hover:border-primary/50 transition-colors duration-300">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.pdf,.docx"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">
              Ou arraste um arquivo aqui
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Aceito: TXT, PDF, DOCX • Máximo 5MB
            </p>
            <EnhancedButton
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              Escolher Arquivo
            </EnhancedButton>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <EnhancedButton
              variant="outline"
              size="lg"
              onClick={onBack}
              className="flex-1"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </EnhancedButton>
            
            <EnhancedButton
              variant="instagram"
              size="lg"
              onClick={handleNext}
              disabled={!isContentValid}
              className="flex-2"
            >
              Próximo Passo
              <ArrowRight className="w-5 h-5" />
            </EnhancedButton>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};