import JSZip from 'jszip';
import { renderTwitterPostToImage } from './renderToImageService';
import { CarouselData } from '@/types/carousel';
import { createValidPngBlob, validatePngBlob } from './pngValidationService';

export interface ZipDownloadProgress {
  currentSlide: number;
  totalSlides: number;
  status: 'preparing' | 'rendering' | 'creating-zip' | 'complete';
}

/**
 * Download carousel as a ZIP file containing all slides and text content
 */
export const downloadCarouselAsZip = async (
  data: CarouselData,
  onProgress?: (progress: ZipDownloadProgress) => void
): Promise<void> => {
  if (!data.slides) {
    throw new Error('No slides to download');
  }

  const zip = new JSZip();
  const totalSlides = data.slides.length;

  onProgress?.({
    currentSlide: 0,
    totalSlides,
    status: 'preparing'
  });

  // Create images folder
  const imagesFolder = zip.folder('images');
  if (!imagesFolder) {
    throw new Error('Failed to create images folder');
  }

  // Render each slide to image and add to ZIP
  const renderedSlides: { index: number; blob: Blob; fileName: string }[] = [];
  
  for (let i = 0; i < data.slides.length; i++) {
    const slide = data.slides[i];
    
    onProgress?.({
      currentSlide: i + 1,
      totalSlides,
      status: 'rendering'
    });

    console.log(`Rendering slide ${i + 1}/${totalSlides}:`, {
      slideId: slide.id,
      textLength: slide.text.length,
      hasProfileImage: !!slide.profileImageUrl,
      hasContentImage: !!slide.contentImageUrls?.[0]
    });

    try {
      const blob = await renderTwitterPostToImage({
        username: data.username || data.instagramHandle.replace('@', ''),
        handle: data.instagramHandle.replace('@', ''),
        isVerified: data.isVerified,
        text: slide.text,
        profileImageUrl: slide.profileImageUrl,
        contentImageUrl: slide.contentImageUrls?.[0]
      });

      // Validate and enhance PNG blob
      if (!blob || blob.size < 5000) {
        console.error(`Slide ${i + 1} validation failed:`, {
          hasBlob: !!blob,
          blobSize: blob?.size || 0,
          slideData: {
            textLength: slide.text.length,
            hasProfileImage: !!slide.profileImageUrl,
            hasContentImage: !!slide.contentImageUrls?.[0],
            profileImageUrl: slide.profileImageUrl?.substring(0, 50),
            contentImageUrl: slide.contentImageUrls?.[0]?.substring(0, 50)
          }
        });
        throw new Error(`Generated image is too small (${blob?.size || 0} bytes, minimum 5000 required). Check console for details.`);
      }

      // Validate PNG format and create properly formatted PNG
      console.log(`Validating PNG format for slide ${i + 1}...`);
      const pngValidation = await validatePngBlob(blob);
      
      let finalBlob = blob;
      if (!pngValidation.isValid) {
        console.log(`PNG validation failed for slide ${i + 1}, creating valid PNG:`, pngValidation.errors);
        finalBlob = await createValidPngBlob(blob);
        console.log(`✅ Created valid PNG for slide ${i + 1}, size: ${finalBlob.size} bytes`);
      } else {
        console.log(`✅ PNG validation passed for slide ${i + 1}`);
      }

      console.log(`Slide ${i + 1} rendered and validated successfully, final size: ${finalBlob.size} bytes`);
      
      const fileName = `slide-${(i + 1).toString().padStart(2, '0')}.png`;
      renderedSlides.push({ index: i, blob: finalBlob, fileName });
      
      // Small delay to prevent overwhelming the browser
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`Error rendering slide ${i + 1}:`, error);
      throw new Error(`Failed to render slide ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Validate all slides were rendered successfully
  if (renderedSlides.length !== totalSlides) {
    throw new Error(`Only ${renderedSlides.length}/${totalSlides} slides were rendered successfully`);
  }

  console.log(`All ${totalSlides} slides rendered successfully, adding to ZIP...`);

  // Add all rendered slides to ZIP with NO compression (STORE method)
  for (const { blob, fileName } of renderedSlides) {
    try {
      console.log(`Processing ${fileName} for ZIP (size: ${blob.size} bytes)...`);
      
      // Convert blob to ArrayBuffer for better JSZip compatibility
      const arrayBuffer = await blob.arrayBuffer();
      console.log(`Converted ${fileName} to ArrayBuffer (size: ${arrayBuffer.byteLength} bytes)`);
      
      // Add to ZIP using STORE compression (no compression) for PNG images
      imagesFolder.file(fileName, arrayBuffer, { 
        compression: 'STORE',
        compressionOptions: null
      });
      console.log(`Successfully added ${fileName} to ZIP with STORE compression`);
      
    } catch (error) {
      console.error(`Error processing ${fileName} for ZIP:`, error);
      
      // Fallback: try Base64 conversion
      try {
        console.log(`Attempting Base64 fallback for ${fileName}...`);
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            // Remove the data URL prefix to get pure base64
            const base64Data = result.split(',')[1];
            resolve(base64Data);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        
        imagesFolder.file(fileName, base64, { 
          base64: true,
          compression: 'STORE',
          compressionOptions: null
        });
        console.log(`Successfully added ${fileName} to ZIP using Base64 fallback with STORE compression`);
      } catch (fallbackError) {
        console.error(`Base64 fallback also failed for ${fileName}:`, fallbackError);
        throw new Error(`Failed to add ${fileName} to ZIP: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  onProgress?.({
    currentSlide: totalSlides,
    totalSlides,
    status: 'creating-zip'
  });

  // Create text content file
  const slidesText = data.slides
    .map((slide, index) => `Slide ${index + 1}:\n${slide.text}\n`)
    .join('\n');

  const caption = data.caption || '';
  const hashtags = (data.hashtags || []).join(' ');
  
  const textContent = `INSTAGRAM CAROUSEL - ${data.title || 'Carrossel Instagram'}

SLIDES CONTENT:
${slidesText}

CAPTION:
${caption}

HASHTAGS:
${hashtags}

INSTRUCTIONS:
1. Upload all images from the 'images' folder to Instagram as a carousel post
2. Use the caption and hashtags provided above
3. Publish during peak engagement hours for best results

Generated by Instagram Carousel Generator`;

  // Add text files with light compression
  zip.file('carousel-content.txt', textContent, {
    compression: 'DEFLATE',
    compressionOptions: { level: 1 } // Light compression for text
  });

  // Create README file
  const readmeContent = `# Instagram Carousel - ${data.title || 'Carrossel Instagram'}

## Files Included:
- **images/**: ${totalSlides} high-quality slide images (1080x1350px)
- **carousel-content.txt**: Full text content, caption, and hashtags

## How to Use:
1. Open Instagram and create a new post
2. Select all images from the 'images' folder in order (slide-01 to slide-${totalSlides.toString().padStart(2, '0')})
3. Copy the caption from carousel-content.txt
4. Add the hashtags provided
5. Publish your carousel!

## Tips:
- Images are optimized for Instagram's carousel format
- Post during your audience's peak activity hours
- Engage with early comments to boost reach
- Consider saving as a highlight for lasting visibility

Happy posting! 🚀`;

  zip.file('README.md', readmeContent, {
    compression: 'DEFLATE',
    compressionOptions: { level: 1 } // Light compression for text
  });

  console.log('Generating ZIP file...');

  // Generate and download ZIP file with minimal compression
  // (individual files already have their specific compression settings)
  try {
    const zipBlob = await zip.generateAsync({ 
      type: 'blob',
      compression: 'STORE' // No additional compression at ZIP level
    });

    // Validate ZIP blob with enhanced checks
    const minZipSize = totalSlides * 8000; // At least 8KB per slide
    if (!zipBlob || zipBlob.size < minZipSize) {
      console.error('ZIP validation failed:', {
        hasZipBlob: !!zipBlob,
        zipBlobSize: zipBlob?.size || 0,
        expectedMinSize: minZipSize,
        totalSlides,
        renderedSlidesCount: renderedSlides.length,
        renderedSlidesSizes: renderedSlides.map(s => s.blob.size)
      });
      throw new Error(`Generated ZIP file is too small (${zipBlob?.size || 0} bytes, expected at least ${minZipSize}). Check if all images were rendered correctly.`);
    }

    console.log(`ZIP file generated successfully, size: ${zipBlob.size} bytes`);

    // Verify ZIP integrity by checking file list
    try {
      const zipTest = new JSZip();
      const zipContents = await zipTest.loadAsync(zipBlob);
      const filesList = Object.keys(zipContents.files);
      const imageFiles = filesList.filter(file => file.startsWith('images/') && file.endsWith('.png'));
      
      console.log('ZIP integrity check:', {
        totalFiles: filesList.length,
        imageFiles: imageFiles.length,
        expectedImages: totalSlides,
        filesList: filesList
      });
      
      if (imageFiles.length !== totalSlides) {
        throw new Error(`ZIP integrity check failed: Expected ${totalSlides} images, found ${imageFiles.length}`);
      }
      
      console.log('ZIP integrity check passed - all images are present');
    } catch (integrityError) {
      console.error('ZIP integrity check failed:', integrityError);
      throw new Error(`ZIP file integrity validation failed: ${integrityError instanceof Error ? integrityError.message : 'Unknown error'}`);
    }

    // Create download URL
    const url = URL.createObjectURL(zipBlob);
    const fileName = `instagram-carousel-${(data.title || 'carrossel').replace(/\s+/g, '-').toLowerCase()}.zip`;
    
    console.log('Attempting immediate download:', fileName, 'Size:', zipBlob.size, 'bytes');
    
    // Create download link
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.style.display = 'none';
    
    // Add to DOM
    document.body.appendChild(a);
    
    // Immediate download attempt - no setTimeout delays to preserve user gesture
    try {
      console.log('Triggering download click...');
      a.click();
      console.log('Download click triggered successfully');
      
      // Check if download was blocked by testing if the link still works
      setTimeout(() => {
        // Test if blob URL is still accessible (indicates download may have been blocked)
        fetch(url, { method: 'HEAD' })
          .then(() => {
            console.warn('⚠️ Download may have been blocked - blob URL still accessible after click');
            // Try fallback: open in new tab
            console.log('Attempting fallback: opening ZIP in new tab');
            window.open(url, '_blank');
          })
          .catch(() => {
            console.log('✅ Download likely succeeded - blob URL no longer accessible');
          });
      }, 500);
      
    } catch (clickError) {
      console.error('Download click failed:', clickError);
      
      // Fallback: try to open in new tab
      console.log('Attempting fallback: opening ZIP file in new tab');
      try {
        window.open(url, '_blank');
        console.log('Fallback: opened ZIP in new tab');
      } catch (fallbackError) {
        console.error('All download methods failed:', fallbackError);
        throw new Error('Browser blocked download. Please try again or check popup blockers.');
      }
    }
    
    // Cleanup after sufficient time but not too quickly (3 seconds)
    setTimeout(() => {
      try {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        console.log('Download cleanup completed');
      } catch (cleanupError) {
        console.warn('Cleanup warning (non-critical):', cleanupError);
      }
    }, 3000);

    onProgress?.({
      currentSlide: totalSlides,
      totalSlides,
      status: 'complete'
    });

    console.log('ZIP download process completed successfully');
  } catch (error) {
    console.error('Error creating or downloading ZIP file:', error);
    throw new Error(`Failed to create ZIP file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Test individual slide rendering for debugging
 */
export const testSlideRendering = async (
  data: CarouselData,
  slideIndex: number
): Promise<{ success: boolean; blob?: Blob; error?: string }> => {
  try {
    if (!data.slides || slideIndex >= data.slides.length) {
      throw new Error('Invalid slide index');
    }

    const slide = data.slides[slideIndex];
    console.log(`Testing slide ${slideIndex + 1} rendering...`);

    const blob = await renderTwitterPostToImage({
      username: data.username || data.instagramHandle.replace('@', ''),
      handle: data.instagramHandle.replace('@', ''),
      isVerified: data.isVerified,
      text: slide.text,
      profileImageUrl: slide.profileImageUrl,
      contentImageUrl: slide.contentImageUrls?.[0]
    });

    // Validate and create properly formatted PNG
    const validatedBlob = await createValidPngBlob(blob);

    // Create a temporary download for testing
    const url = URL.createObjectURL(validatedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-slide-${slideIndex + 1}.png`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return { success: true, blob: validatedBlob };
  } catch (error) {
    console.error(`Test rendering failed for slide ${slideIndex + 1}:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};