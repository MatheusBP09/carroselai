import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Upload, X, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface ImageControlsProps {
  hasImage: boolean;
  customImageUrl?: string;
  imagePosition: 'center' | 'top' | 'bottom';
  imageScale: number;
  onRemoveImage: () => void;
  onUploadImage: (file: File) => void;
  onPositionChange: (position: 'center' | 'top' | 'bottom') => void;
  onScaleChange: (scale: number) => void;
  onResetToGenerated: () => void;
  hasGeneratedImage: boolean;
}

export const ImageControls: React.FC<ImageControlsProps> = ({
  hasImage,
  customImageUrl,
  imagePosition,
  imageScale,
  onRemoveImage,
  onUploadImage,
  onPositionChange,
  onScaleChange,
  onResetToGenerated,
  hasGeneratedImage
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        onUploadImage(file);
      } else {
        toast.error('Por favor, selecione um arquivo de imagem válido.');
      }
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="p-3 sm:p-4 space-y-3 sm:space-y-4">
      <h4 className="font-semibold text-xs sm:text-sm">Controles de Imagem</h4>
      
      {/* Remove Image / Upload Image */}
      <div className="flex flex-col sm:flex-row gap-2">
        {hasImage ? (
          <>
            <Button
              variant="destructive"
              size="sm"
              onClick={onRemoveImage}
              className="flex-1 text-xs sm:text-sm"
            >
              <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Remover
            </Button>
            {hasGeneratedImage && customImageUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={onResetToGenerated}
                className="flex-1 text-xs sm:text-sm"
              >
                <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Voltar IA
              </Button>
            )}
          </>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={triggerFileUpload}
            className="w-full text-xs sm:text-sm"
          >
            <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Adicionar Imagem
          </Button>
        )}
      </div>

      {/* Custom Image Upload */}
      {hasImage && (
        <Button
          variant="outline"
          size="sm"
          onClick={triggerFileUpload}
          className="w-full text-xs sm:text-sm"
        >
          <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          {customImageUrl ? 'Trocar' : 'Enviar Personalizada'}
        </Button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Image Position and Scale Controls - only show when image is present */}
      {hasImage && (
        <>
          <div className="space-y-1 sm:space-y-2">
            <Label className="text-[10px] sm:text-xs">Posição</Label>
            <Select value={imagePosition} onValueChange={onPositionChange}>
              <SelectTrigger className="h-7 sm:h-8 text-xs sm:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top" className="text-xs sm:text-sm">Superior</SelectItem>
                <SelectItem value="center" className="text-xs sm:text-sm">Centro</SelectItem>
                <SelectItem value="bottom" className="text-xs sm:text-sm">Inferior</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1 sm:space-y-2">
            <Label className="text-[10px] sm:text-xs">Escala: {imageScale.toFixed(1)}x</Label>
            <Slider
              value={[imageScale]}
              onValueChange={(value) => onScaleChange(value[0])}
              min={0.5}
              max={2.0}
              step={0.1}
              className="w-full"
            />
          </div>
        </>
      )}
    </Card>
  );
};