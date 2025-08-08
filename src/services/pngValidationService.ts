/**
 * PNG Validation and Correction Service
 * Ensures PNG files have proper headers and are compatible with Windows
 */

interface PngValidationResult {
  isValid: boolean;
  hasCorrectSignature: boolean;
  hasRequiredChunks: boolean;
  errors: string[];
}

/**
 * Validate PNG signature and essential chunks
 */
export const validatePngBlob = async (blob: Blob): Promise<PngValidationResult> => {
  const result: PngValidationResult = {
    isValid: false,
    hasCorrectSignature: false,
    hasRequiredChunks: false,
    errors: []
  };

  try {
    const arrayBuffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // Check PNG signature (first 8 bytes)
    const pngSignature = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
    result.hasCorrectSignature = pngSignature.every((byte, index) => bytes[index] === byte);

    if (!result.hasCorrectSignature) {
      result.errors.push('Invalid PNG signature');
    }

    // Check for required chunks (IHDR, IDAT, IEND)
    let hasIHDR = false;
    let hasIDAT = false;
    let hasIEND = false;

    let offset = 8; // Skip PNG signature
    while (offset < bytes.length - 8) {
      // Read chunk length (4 bytes)
      const chunkLength = (bytes[offset] << 24) | (bytes[offset + 1] << 16) | 
                         (bytes[offset + 2] << 8) | bytes[offset + 3];
      
      // Read chunk type (4 bytes)
      const chunkType = String.fromCharCode(
        bytes[offset + 4], bytes[offset + 5], 
        bytes[offset + 6], bytes[offset + 7]
      );

      if (chunkType === 'IHDR') hasIHDR = true;
      if (chunkType === 'IDAT') hasIDAT = true;
      if (chunkType === 'IEND') hasIEND = true;

      // Move to next chunk (length + type + data + CRC)
      offset += 4 + 4 + chunkLength + 4;
    }

    result.hasRequiredChunks = hasIHDR && hasIDAT && hasIEND;

    if (!hasIHDR) result.errors.push('Missing IHDR chunk');
    if (!hasIDAT) result.errors.push('Missing IDAT chunk');
    if (!hasIEND) result.errors.push('Missing IEND chunk');

    result.isValid = result.hasCorrectSignature && result.hasRequiredChunks;

  } catch (error) {
    result.errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return result;
};

/**
 * Create a properly formatted PNG blob with correct headers
 */
export const createValidPngBlob = async (
  sourceBlob: Blob, 
  width: number = 1080, 
  height: number = 1350
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    // Set exact dimensions
    canvas.width = width;
    canvas.height = height;

    // Set white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Improve image quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const img = new Image();
    
    img.onload = () => {
      try {
        // Draw image with proper scaling
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to PNG with maximum quality
        canvas.toBlob((validBlob) => {
          if (validBlob && validBlob.size > 1000) {
            console.log('✅ Valid PNG created:', {
              size: validBlob.size,
              type: validBlob.type,
              dimensions: `${width}x${height}`
            });
            resolve(validBlob);
          } else {
            reject(new Error('Failed to create valid PNG blob'));
          }
        }, 'image/png', 1.0);
        
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load source image'));
    };
    
    img.src = URL.createObjectURL(sourceBlob);
  });
};

/**
 * Download blob with proper PNG headers and Windows compatibility
 */
export const downloadPngWithHeaders = async (
  blob: Blob, 
  filename: string,
  retries: number = 3
): Promise<void> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🚀 Download attempt ${attempt}/${retries} for ${filename}`);
      
      // Validate PNG first
      const validation = await validatePngBlob(blob);
      console.log('📋 PNG validation result:', validation);
      
      let finalBlob = blob;
      
      // Create valid PNG if validation fails
      if (!validation.isValid) {
        console.log('🔧 Creating valid PNG blob...');
        finalBlob = await createValidPngBlob(blob);
        
        // Re-validate the corrected blob
        const revalidation = await validatePngBlob(finalBlob);
        if (!revalidation.isValid) {
          throw new Error('Failed to create valid PNG even after correction');
        }
      }

      // Create download link with proper headers
      const url = URL.createObjectURL(finalBlob);
      const link = document.createElement('a');
      
      // Set download attributes
      link.href = url;
      link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
      link.type = 'image/png';
      
      // Add to DOM temporarily
      link.style.display = 'none';
      document.body.appendChild(link);
      
      // Trigger download
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);

      console.log(`✅ Download successful: ${filename} (${finalBlob.size} bytes)`);
      return; // Success, exit retry loop
      
    } catch (error) {
      console.warn(`❌ Download attempt ${attempt} failed:`, error);
      
      if (attempt === retries) {
        throw new Error(`All ${retries} download attempts failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
};

/**
 * Batch download multiple PNG files with proper validation
 */
export const batchDownloadPngs = async (
  items: Array<{ blob: Blob; filename: string }>,
  onProgress?: (current: number, total: number, filename: string) => void
): Promise<{ successful: number; failed: number; errors: string[] }> => {
  const results = {
    successful: 0,
    failed: 0,
    errors: [] as string[]
  };

  for (let i = 0; i < items.length; i++) {
    const { blob, filename } = items[i];
    
    try {
      onProgress?.(i + 1, items.length, filename);
      
      await downloadPngWithHeaders(blob, filename);
      results.successful++;
      
      // Delay between downloads to prevent browser blocking
      if (i < items.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
    } catch (error) {
      results.failed++;
      const errorMsg = `${filename}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      results.errors.push(errorMsg);
      console.error(`❌ Failed to download ${filename}:`, error);
    }
  }

  return results;
};