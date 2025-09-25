/**
 * Automated testing service for carousel generation and export validation
 */

import { renderTwitterPostToImage } from './renderToImageService';
import { Slide } from '@/types/carousel';

interface TestResult {
  success: boolean;
  errors: string[];
  warnings: string[];
  imageSize: number;
  hasValidImage: boolean;
  handleCorrect: boolean;
  nameNotTruncated: boolean;
}

interface CarouselTestParams {
  username: string;
  handle: string;
  isVerified: boolean;
  slides: Slide[];
}

/**
 * Test individual slide export validation
 */
export const testSlideExport = async (
  username: string,
  handle: string,
  isVerified: boolean,
  text: string,
  profileImageUrl?: string,
  contentImageUrl?: string
): Promise<TestResult> => {
  const result: TestResult = {
    success: false,
    errors: [],
    warnings: [],
    imageSize: 0,
    hasValidImage: false,
    handleCorrect: false,
    nameNotTruncated: false
  };

  try {
    console.log('🧪 Testing slide export:', { username, handle: handle.substring(0, 20), text: text.substring(0, 50) });
    
    // Test 1: Export the slide
    const blob = await renderTwitterPostToImage({
      username,
      handle: handle.replace(/^@+/, ''), // Store without @
      isVerified,
      text,
      profileImageUrl,
      contentImageUrl
    });

    // Test 2: Validate image is not empty
    result.imageSize = blob.size;
    result.hasValidImage = blob.size > 5000;
    
    if (!result.hasValidImage) {
      result.errors.push(`Image too small: ${blob.size} bytes (minimum 5000 required)`);
    }

    // Test 3: Validate handle format (should not have double @)
    const cleanHandle = handle.replace(/^@+/, '');
    result.handleCorrect = !cleanHandle.includes('@');
    
    if (!result.handleCorrect) {
      result.errors.push(`Handle contains invalid @ symbols: ${handle}`);
    }

    // Test 4: Validate username length (basic truncation check)
    result.nameNotTruncated = username.length > 0 && username.length < 100;
    
    if (!result.nameNotTruncated) {
      result.warnings.push(`Username might be truncated or invalid: "${username}"`);
    }

    // Overall success validation
    result.success = result.hasValidImage && result.handleCorrect && result.nameNotTruncated;

    console.log('✅ Test completed:', {
      success: result.success,
      imageSize: result.imageSize,
      errors: result.errors.length,
      warnings: result.warnings.length
    });

  } catch (error) {
    result.errors.push(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.error('❌ Test failed:', error);
  }

  return result;
};

/**
 * Test complete carousel validation
 */
export const testCarouselExport = async (params: CarouselTestParams): Promise<{
  overallSuccess: boolean;
  slideResults: TestResult[];
  summary: {
    totalSlides: number;
    successfulSlides: number;
    failedSlides: number;
    totalErrors: number;
    totalWarnings: number;
  };
}> => {
  console.log('🧪 Testing complete carousel export:', {
    username: params.username,
    handle: params.handle,
    slides: params.slides.length
  });

  const slideResults: TestResult[] = [];
  
  // Test each slide
  for (let i = 0; i < params.slides.length; i++) {
    const slide = params.slides[i];
    console.log(`🧪 Testing slide ${i + 1}/${params.slides.length}`);
    
    const result = await testSlideExport(
      params.username,
      params.handle,
      params.isVerified,
      slide.text,
      slide.profileImageUrl,
      slide.customImageUrl || slide.contentImageUrls?.[0]
    );
    
    slideResults.push(result);
  }

  // Calculate summary
  const successfulSlides = slideResults.filter(r => r.success).length;
  const failedSlides = slideResults.length - successfulSlides;
  const totalErrors = slideResults.reduce((sum, r) => sum + r.errors.length, 0);
  const totalWarnings = slideResults.reduce((sum, r) => sum + r.warnings.length, 0);

  const summary = {
    totalSlides: params.slides.length,
    successfulSlides,
    failedSlides,
    totalErrors,
    totalWarnings
  };

  const overallSuccess = failedSlides === 0 && totalErrors === 0;

  console.log('🧪 Carousel test summary:', {
    overallSuccess,
    ...summary
  });

  return {
    overallSuccess,
    slideResults,
    summary
  };
};

/**
 * Quick validation for common issues
 */
export const validateCarouselData = (params: CarouselTestParams): {
  isValid: boolean;
  issues: string[];
} => {
  const issues: string[] = [];

  // Check username
  if (!params.username || params.username.trim().length === 0) {
    issues.push('Username is empty or invalid');
  }

  // Check handle format
  const cleanHandle = params.handle.replace(/^@+/, '');
  if (!cleanHandle || cleanHandle.length === 0) {
    issues.push('Handle is empty after cleaning @ symbols');
  }

  if (cleanHandle.includes('@')) {
    issues.push('Handle contains @ symbols after cleaning - potential duplication');
  }

  // Check slides
  if (!params.slides || params.slides.length === 0) {
    issues.push('No slides provided');
  } else {
    params.slides.forEach((slide, index) => {
      if (!slide.text || slide.text.trim().length === 0) {
        issues.push(`Slide ${index + 1} has empty text`);
      }
      if (slide.text && slide.text.length > 280) {
        issues.push(`Slide ${index + 1} text exceeds Twitter limit (${slide.text.length}/280)`);
      }
    });
  }

  return {
    isValid: issues.length === 0,
    issues
  };
};