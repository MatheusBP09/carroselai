import { useState } from 'react';
import { ArrowRight, ArrowLeft, Instagram, CheckCircle, TestTube } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Checkbox } from '@/components/ui/checkbox';
import { StepProps } from '../types/carousel';
import { testImagePreprocessing } from '@/utils/testImagePreprocessing';
import { toast } from 'sonner';
import { useCarousel } from '@/context/CarouselContext';

export const Step1Identification = ({ data, onNext, onBack }: StepProps) => {
  const { updateData, setCurrentStep } = useCarousel();
  
  const [formData, setFormData] = useState({
    title: data.title || '',
    username: data.username || '',
    instagramHandle: data.instagramHandle ? data.instagramHandle.replace('@', '') : '',
    isVerified: data.isVerified || false
  });
  
  const [errors, setErrors] = useState<{title?: string; username?: string; instagramHandle?: string}>({});

  const validateForm = () => {
    const newErrors: {title?: string; username?: string; instagramHandle?: string} = {};
    
    if (formData.title.length > 0 && formData.title.length < 3) {
      newErrors.title = 'Título deve ter pelo menos 3 caracteres';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Título deve ter no máximo 100 caracteres';
    }
    
    if (formData.username.length < 2) {
      newErrors.username = 'Nome deve ter pelo menos 2 caracteres';
    } else if (formData.username.length > 50) {
      newErrors.username = 'Nome deve ter no máximo 50 caracteres';
    }
    
    if (!formData.instagramHandle || formData.instagramHandle.length < 1) {
      newErrors.instagramHandle = 'Instagram handle é obrigatório';
    } else if (formData.instagramHandle.startsWith('@')) {
      newErrors.instagramHandle = 'Digite apenas o nome de usuário, sem o @';
    } else if (formData.instagramHandle.length < 1) {
      newErrors.instagramHandle = 'Handle deve ter pelo menos 1 caractere';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.instagramHandle)) {
      newErrors.instagramHandle = 'Handle deve conter apenas letras, números e underscore';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onNext({
        title: formData.title,
        username: formData.username,
        instagramHandle: '@' + formData.instagramHandle.toLowerCase(), // Add @ when saving
        isVerified: formData.isVerified
      });
    }
  };

  const handleInstagramHandleChange = (value: string) => {
    // Remove @ if user adds it (since we want them to type without @)
    let handle = value.replace('@', '');
    setFormData(prev => ({ ...prev, instagramHandle: handle.toLowerCase() }));
  };

  const isFormValid = () => {
    return (formData.title.length === 0 || formData.title.length >= 3) && 
           formData.title.length <= 100 && 
           formData.username.length >= 2 &&
           formData.username.length <= 50 &&
           formData.instagramHandle.length > 0;
  };

  const handleAutomaticTest = async () => {
    toast.info('Iniciando teste automático...');
    try {
      await testImagePreprocessing();
      toast.success('Teste automático concluído! Verifique o console para detalhes.');
    } catch (error) {
      console.error('Erro no teste automático:', error);
      toast.error('Erro no teste automático. Verifique o console para detalhes.');
    }
  };

  const handleFullCarouselTest = () => {
    toast.info('Gerando carrossel de teste completo...');
    
    // Dados de teste básicos que funcionam com o tipo CarouselData
    const testData = {
      title: 'Teste de Carrossel Automático',
      username: 'Teste User',
      instagramHandle: '@testeuser',
      isVerified: true,
      content: 'Este é um carrossel de teste gerado automaticamente para verificar se todo o processo está funcionando corretamente. Inclui múltiplos slides com conteúdo educacional sobre empreendedorismo digital.',
      slideCount: 5,
      contentType: 'educational' as const,
      contentFormat: 'feed' as const,
      callToAction: 'follow' as const,
      copywritingFramework: 'aida' as const,
      slides: [
        { 
          id: 1, 
          text: 'Slide 1: Introdução ao Empreendedorismo Digital', 
          isEdited: false,
          originalText: 'Slide 1: Introdução ao Empreendedorismo Digital',
          hasImage: true,
          needsImage: true,
          imagePrompt: 'Person working on laptop in modern office, digital business concept'
        },
        { 
          id: 2, 
          text: 'Slide 2: Primeiro Passo - Defina seu Nicho', 
          isEdited: false,
          originalText: 'Slide 2: Primeiro Passo - Defina seu Nicho',
          hasImage: true,
          needsImage: true,
          imagePrompt: 'Target audience analysis, market research concept'
        },
        { 
          id: 3, 
          text: 'Slide 3: Segundo Passo - Crie Conteúdo de Valor', 
          isEdited: false,
          originalText: 'Slide 3: Segundo Passo - Crie Conteúdo de Valor',
          hasImage: true,
          needsImage: true,
          imagePrompt: 'Content creation, writing blog posts, video editing'
        },
        { 
          id: 4, 
          text: 'Slide 4: Terceiro Passo - Construa sua Audiência', 
          isEdited: false,
          originalText: 'Slide 4: Terceiro Passo - Construa sua Audiência',
          hasImage: true,
          needsImage: true,
          imagePrompt: 'Social media growth, community building concept'
        },
        { 
          id: 5, 
          text: 'Slide 5: Comece Hoje! Siga @testeuser para mais dicas', 
          isEdited: false,
          originalText: 'Slide 5: Comece Hoje! Siga @testeuser para mais dicas',
          hasImage: true,
          needsImage: true,
          imagePrompt: 'Call to action, follow button, social media engagement'
        }
      ],
      caption: 'Aprenda os fundamentos do empreendedorismo digital em 5 slides! 🚀 Salve este post e comece sua jornada hoje mesmo. ✨',
      hashtags: ['#empreendedorismo', '#digital', '#negociosonline', '#dicas', '#marketing']
    };

    // Atualizar dados do contexto
    updateData(testData);
    
    // Navegar diretamente para a etapa 6 (download)
    setCurrentStep(6);
    
    toast.success('Carrossel de teste gerado! Redirecionando para download...');
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="shadow-card border-0 bg-gradient-card">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-instagram-start to-instagram-middle rounded-2xl flex items-center justify-center mb-4 shadow-instagram">
            <Instagram className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Passo 1: Identifique seu Carrossel
          </CardTitle>
          <p className="text-muted-foreground">
            Vamos começar com as informações básicas do seu carrossel
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Nome/Título do Carrossel
            </Label>
            <Input
              id="title"
              placeholder="Ex: 10 Lições de Empreendedorismo"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className={`transition-all duration-300 ${errors.title ? 'border-destructive focus:border-destructive' : 'focus:border-primary'}`}
              maxLength={100}
            />
            <div className="flex justify-between items-center">
              {errors.title && (
                <span className="text-sm text-destructive">{errors.title}</span>
              )}
              <span className="text-xs text-muted-foreground ml-auto">
                {formData.title.length}/100
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium">
              Nome de Exibição *
            </Label>
            <Input
              id="username"
              placeholder="Ex: Yan Simões"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              className={`transition-all duration-300 ${errors.username ? 'border-destructive focus:border-destructive' : 'focus:border-primary'}`}
              maxLength={50}
            />
            <div className="flex justify-between items-center">
              {errors.username && (
                <span className="text-sm text-destructive">{errors.username}</span>
              )}
              <span className="text-xs text-muted-foreground ml-auto">
                {formData.username.length}/50
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instagram" className="text-sm font-medium">
              Seu @ do Instagram *
            </Label>
            <Input
              id="instagram"
              placeholder="yansimoesss"
              value={formData.instagramHandle}
              onChange={(e) => handleInstagramHandleChange(e.target.value)}
              className={`transition-all duration-300 ${errors.instagramHandle ? 'border-destructive focus:border-destructive' : 'focus:border-primary'}`}
            />
            <p className="text-xs text-muted-foreground">
              Digite apenas o nome de usuário, sem o @
            </p>
            {errors.instagramHandle && (
              <span className="text-sm text-destructive">{errors.instagramHandle}</span>
            )}
            
            <div className="flex items-center space-x-2 mt-3">
              <Checkbox
                id="verified"
                checked={formData.isVerified}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, isVerified: checked === true }))
                }
              />
              <Label htmlFor="verified" className="text-sm flex items-center gap-2">
                Mostrar ícone de verificado
                <CheckCircle className="w-4 h-4 text-accent-blue" />
              </Label>
            </div>
          </div>

          <div className="pt-4 space-y-3">
            <EnhancedButton
              variant="outline"
              size="lg"
              onClick={handleAutomaticTest}
              className="w-full border-dashed border-2 hover:border-primary text-muted-foreground hover:text-primary"
            >
              <TestTube className="w-5 h-5" />
              Teste Automático de Configurações
            </EnhancedButton>

            <EnhancedButton
              variant="accent"
              size="lg"
              onClick={handleFullCarouselTest}
              className="w-full"
            >
              🚀 Gerar Carrossel Completo de Teste
            </EnhancedButton>
          </div>

          <div className="pt-4 flex gap-4">
            <EnhancedButton
              variant="outline"
              size="xl"
              onClick={onBack}
              className="flex-1"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </EnhancedButton>
            
            <EnhancedButton
              variant="instagram"
              size="xl"
              onClick={handleSubmit}
              disabled={!isFormValid()}
              className="flex-1"
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
