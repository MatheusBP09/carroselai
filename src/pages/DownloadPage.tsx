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

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `slide-${slideIndex + 1}-${data.username.replace(/\s+/g, '-').toLowerCase()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Success!",
        description: `Slide ${slideIndex + 1} downloaded successfully`,
      });
    } catch (error) {
      console.error('Error downloading slide:', error);
      toast({
        title: "Download failed",
        description: `Failed to download slide ${slideIndex + 1}. Please try again.`,
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
              <span>Back to Home</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Download Your Carousel</h1>
              <p className="text-muted-foreground">@{data.instagramHandle} • {data.slides.length} slides</p>
            </div>
          </div>
        </div>

        {/* Caption Section */}
        {(data.caption || data.hashtags) && (
          <Card className="p-6 mb-8">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-lg font-semibold mb-3">Caption & Hashtags</h2>
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
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy All</span>
                  </>
                )}
              </Button>
            </div>
          </Card>
        )}

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
                    {downloadingSlides.has(index) ? 'Generating...' : 'Download PNG'}
                  </span>
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Instructions */}
        <Card className="p-6 mt-8">
          <h3 className="font-semibold mb-3">How to use these images:</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Each image is optimized for Instagram at 1080×1350 pixels</li>
            <li>• Upload them as a carousel post on Instagram</li>
            <li>• Copy the caption and hashtags using the button above</li>
            <li>• Post during peak engagement hours for best results</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}