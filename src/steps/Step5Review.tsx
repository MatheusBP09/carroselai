import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Edit3, RotateCcw, Plus, X, Image as ImageIcon } from 'lucide-react';
import { StepProps, Slide } from '@/types/carousel';
import { generateContentImage } from '@/services/imageGenerationService';
import { TwitterPostPreview } from '@/components/TwitterPostPreview';
import { toast } from 'sonner';
const Step5Review = ({
  data,
  onNext,
  onBack
}: StepProps) => {
  const [slides, setSlides] = useState<Slide[]>(data.slides || []);
  const [caption, setCaption] = useState(data.caption || '');
  const [hashtags, setHashtags] = useState<string[]>(data.hashtags || []);
  const [editingSlide, setEditingSlide] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [newHashtag, setNewHashtag] = useState('');
  const [regeneratingImage, setRegeneratingImage] = useState<number | null>(null);
  useEffect(() => {
    if (data.slides) setSlides(data.slides);
    if (data.caption) setCaption(data.caption);
    if (data.hashtags) setHashtags(data.hashtags);
  }, [data]);
  const handleSlideEdit = (id: number, newText: string) => {
    setSlides(prev => prev.map(slide => slide.id === id ? {
      ...slide,
      text: newText,
      isEdited: true
    } : slide));
    setEditingSlide(null);
  };
  const handleSlideReset = (id: number) => {
    setSlides(prev => prev.map(slide => slide.id === id ? {
      ...slide,
      text: slide.originalText,
      isEdited: false
    } : slide));
  };
  const regenerateSlideImage = async (slideId: number) => {
    const slide = slides.find(s => s.id === slideId);
    if (!slide) return;
    setRegeneratingImage(slideId);
    try {
      const contentImage = await generateContentImage({
        text: slide.text,
        style: 'modern'
      });
      setSlides(prev => prev.map(s => s.id === slideId ? {
        ...s,
        contentImageUrls: [contentImage.imageUrl]
      } : s));
      toast.success('Imagem regenerada com sucesso!');
    } catch (error) {
      console.error('Erro ao regenerar imagem:', error);
      toast.error('Erro ao regenerar imagem');
    } finally {
      setRegeneratingImage(null);
    }
  };
  const startEdit = (slide: Slide) => {
    setEditingSlide(slide.id);
    setEditingText(slide.text);
  };
  const cancelEdit = () => {
    setEditingSlide(null);
    setEditingText('');
  };
  const saveEdit = () => {
    if (editingSlide !== null) {
      handleSlideEdit(editingSlide, editingText);
      // Regenerar imagem automaticamente após editar texto
      regenerateSlideImage(editingSlide);
    }
  };
  const addHashtag = () => {
    if (newHashtag.trim() && !hashtags.includes(newHashtag.trim())) {
      const hashtagToAdd = newHashtag.trim().startsWith('#') ? newHashtag.trim() : `#${newHashtag.trim()}`;
      setHashtags(prev => [...prev, hashtagToAdd]);
      setNewHashtag('');
    }
  };
  const removeHashtag = (index: number) => {
    setHashtags(prev => prev.filter((_, i) => i !== index));
  };
  const handleNext = () => {
    onNext({
      slides,
      caption,
      hashtags
    });
  };
  return <div className="max-w-4xl mx-auto space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-2">Revisar Carrossel</h2>
        <p className="text-muted-foreground mb-6">
          Revise e edite seu carrossel antes de finalizar. As imagens serão regeneradas automaticamente quando você editar o texto.
        </p>

        <Tabs defaultValue="slides" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="slides">Posts ({slides.length})</TabsTrigger>
            <TabsTrigger value="caption">Legenda</TabsTrigger>
            <TabsTrigger value="hashtags">Hashtags ({hashtags.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="slides" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {slides.map((slide, index) => <Card key={slide.id} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Tweet {index + 1}</Badge>
                      {slide.isEdited && <Badge variant="secondary">Editado</Badge>}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => startEdit(slide)} disabled={editingSlide === slide.id}>
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      {slide.isEdited && <Button variant="outline" size="sm" onClick={() => handleSlideReset(slide.id)}>
                          <RotateCcw className="w-4 h-4" />
                        </Button>}
                    </div>
                  </div>

                  {/* Preview do post */}
                  <div className="mb-3">
                    <TwitterPostPreview username={data.username || data.instagramHandle.replace('@', '')} handle={data.instagramHandle.replace('@', '')} isVerified={data.isVerified} text={slide.text} profileImageUrl={slide.profileImageUrl} contentImageUrl={slide.contentImageUrls?.[0]} />
                  </div>
                  <Button variant="outline" size="sm" onClick={() => regenerateSlideImage(slide.id)} disabled={regeneratingImage === slide.id} className="w-full mt-2 py-0 my-[10px]">
                    <ImageIcon className="w-4 h-4 mr-2" />
                    {regeneratingImage === slide.id ? 'Regenerando...' : 'Regenerar Imagem'}
                  </Button>

                  {editingSlide === slide.id ? <div className="space-y-3">
                      <Textarea value={editingText} onChange={e => setEditingText(e.target.value)} className="min-h-[120px]" placeholder="Edite o texto do tweet..." maxLength={280} />
                      <div className="text-sm text-muted-foreground">
                        {editingText.length}/280 caracteres
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={saveEdit}>
                          Salvar
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}>
                          Cancelar
                        </Button>
                      </div>
                    </div> : <div className="text-sm whitespace-pre-wrap bg-muted p-3 rounded-lg">
                      {slide.text}
                    </div>}
                </Card>)}
            </div>
          </TabsContent>

          <TabsContent value="caption" className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Legenda do carrossel
              </label>
              <Textarea value={caption} onChange={e => setCaption(e.target.value)} className="min-h-[200px]" placeholder="Escreva uma legenda atrativa para seu carrossel..." />
            </div>
          </TabsContent>

          <TabsContent value="hashtags" className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Adicionar hashtag
              </label>
              <div className="flex gap-2">
                <Input value={newHashtag} onChange={e => setNewHashtag(e.target.value)} placeholder="Digite uma hashtag..." onKeyPress={e => e.key === 'Enter' && addHashtag()} />
                <Button onClick={addHashtag} disabled={!newHashtag.trim()}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Hashtags atuais ({hashtags.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {hashtags.map((hashtag, index) => <Badge key={index} variant="secondary" className="flex items-center gap-2">
                    {hashtag}
                    <button onClick={() => removeHashtag(index)} className="hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>)}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Voltar
        </Button>
        <Button onClick={handleNext}>
          Finalizar Carrossel
        </Button>
      </div>
    </div>;
};
export default Step5Review;