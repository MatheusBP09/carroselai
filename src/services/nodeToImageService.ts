import { toBlob } from 'html-to-image';

export interface NodeToPngOptions {
  width?: number;
  height?: number;
  backgroundColor?: string;
  pixelRatio?: number;
  // Fallback data for iOS manual canvas rendering
  fallbackData?: {
    username: string;
    handle: string;
    text: string;
    profileImageUrl?: string;
    contentImageUrl?: string;
  };
}

// Detect Safari/iOS
const isSafari = (): boolean => {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

const isIOS = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

// Load image with timeout and CORS handling for iOS
const loadImageForCanvas = (url: string): Promise<HTMLImageElement | null> => {
  return new Promise((resolve) => {
    if (!url) {
      resolve(null);
      return;
    }
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    const timeout = setTimeout(() => {
      console.warn('⏰ Image load timeout:', url.substring(0, 50));
      resolve(null);
    }, 5000);
    
    img.onload = () => {
      clearTimeout(timeout);
      resolve(img);
    };
    
    img.onerror = () => {
      clearTimeout(timeout);
      console.warn('❌ Image failed to load:', url.substring(0, 50));
      resolve(null);
    };
    
    img.src = url;
  });
};

// iOS fallback: Manual canvas rendering (guaranteed to work)
const renderWithNativeCanvas = async (
  width: number,
  height: number,
  backgroundColor: string,
  fallbackData: NodeToPngOptions['fallbackData']
): Promise<Blob> => {
  console.log('🎨 iOS Fallback: Using native Canvas API for rendering...');
  
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }
  
  // Background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);
  
  const padding = 64;
  let currentY = padding;
  
  // Load images in parallel
  const [profileImg, contentImg] = await Promise.all([
    fallbackData?.profileImageUrl ? loadImageForCanvas(fallbackData.profileImageUrl) : null,
    fallbackData?.contentImageUrl ? loadImageForCanvas(fallbackData.contentImageUrl) : null,
  ]);
  
  // Draw profile section
  const profileSize = 64;
  
  // Profile image or placeholder
  if (profileImg) {
    // Circular clip for profile image
    ctx.save();
    ctx.beginPath();
    ctx.arc(padding + profileSize/2, currentY + profileSize/2, profileSize/2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(profileImg, padding, currentY, profileSize, profileSize);
    ctx.restore();
  } else {
    // Draw circular placeholder with initials
    ctx.beginPath();
    ctx.arc(padding + profileSize/2, currentY + profileSize/2, profileSize/2, 0, Math.PI * 2);
    ctx.closePath();
    const gradient = ctx.createLinearGradient(padding, currentY, padding + profileSize, currentY + profileSize);
    gradient.addColorStop(0, '#1d9bf0');
    gradient.addColorStop(1, '#0c7abf');
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Draw initials
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const initials = (fallbackData?.username || 'U').substring(0, 2).toUpperCase();
    ctx.fillText(initials, padding + profileSize/2, currentY + profileSize/2);
  }
  
  // Username
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(fallbackData?.username || 'User', padding + profileSize + 20, currentY + 5);
  
  // Handle
  ctx.fillStyle = '#6b7280';
  ctx.font = '22px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText(`@${(fallbackData?.handle || 'user').replace(/^@+/, '')}`, padding + profileSize + 20, currentY + 38);
  
  currentY += profileSize + 32;
  
  // Tweet text with word wrap
  ctx.fillStyle = '#000000';
  ctx.font = '36px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textBaseline = 'top';
  
  const text = fallbackData?.text || '';
  const maxWidth = width - (padding * 2);
  const lineHeight = 45;
  const words = text.split(' ');
  let line = '';
  
  for (const word of words) {
    const testLine = line + word + ' ';
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && line !== '') {
      ctx.fillText(line.trim(), padding, currentY);
      line = word + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line.trim()) {
    ctx.fillText(line.trim(), padding, currentY);
    currentY += lineHeight;
  }
  
  currentY += 32;
  
  // Content image
  if (contentImg) {
    const imageAreaHeight = height - currentY - padding;
    const imageWidth = width - (padding * 2);
    
    // Calculate aspect ratio to cover the area
    const imgAspect = contentImg.width / contentImg.height;
    const areaAspect = imageWidth / imageAreaHeight;
    
    let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
    
    if (imgAspect > areaAspect) {
      drawHeight = imageAreaHeight;
      drawWidth = drawHeight * imgAspect;
      offsetX = (imageWidth - drawWidth) / 2;
    } else {
      drawWidth = imageWidth;
      drawHeight = drawWidth / imgAspect;
      offsetY = (imageAreaHeight - drawHeight) / 2;
    }
    
    // Rounded rectangle clip
    ctx.save();
    ctx.beginPath();
    const radius = 16;
    ctx.roundRect(padding, currentY, imageWidth, imageAreaHeight, radius);
    ctx.closePath();
    ctx.clip();
    
    ctx.drawImage(contentImg, padding + offsetX, currentY + offsetY, drawWidth, drawHeight);
    ctx.restore();
  } else if (fallbackData?.contentImageUrl) {
    // Draw placeholder for failed image
    const imageAreaHeight = height - currentY - padding;
    const imageWidth = width - (padding * 2);
    
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(padding, currentY, imageWidth, imageAreaHeight, 16);
    ctx.closePath();
    ctx.clip();
    
    // Gradient background
    const gradient = ctx.createLinearGradient(padding, currentY, padding + imageWidth, currentY + imageAreaHeight);
    gradient.addColorStop(0, '#f8fafc');
    gradient.addColorStop(0.3, '#e2e8f0');
    gradient.addColorStop(0.7, '#cbd5e1');
    gradient.addColorStop(1, '#94a3b8');
    ctx.fillStyle = gradient;
    ctx.fill();
    
    ctx.restore();
  }
  
  // Convert to blob
  const blob: Blob | null = await new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), 'image/png', 1.0);
  });
  
  if (!blob) {
    throw new Error('Native canvas toBlob returned null');
  }
  
  console.log('✅ Native Canvas rendered successfully:', { size: blob.size });
  return blob;
};

// Capture with html2canvas (more compatible with Safari/iOS)
const captureWithHtml2canvas = async (
  node: HTMLElement,
  width: number,
  height: number,
  backgroundColor: string,
  pixelRatio: number
): Promise<Blob> => {
  console.log('📸 Using html2canvas for capture...');
  
  const html2canvas = await import('html2canvas');
  const canvas = await html2canvas.default(node, {
    width,
    height,
    backgroundColor,
    scale: pixelRatio,
    useCORS: true,
    allowTaint: true,
    logging: false,
    removeContainer: false,
    scrollX: 0,
    scrollY: 0,
    windowWidth: width,
    windowHeight: height,
    x: 0,
    y: 0,
    foreignObjectRendering: false, // Disable for iOS compatibility
    onclone: (_clonedDoc: Document, element: HTMLElement) => {
      element.style.width = `${width}px`;
      element.style.height = `${height}px`;
      element.style.minWidth = `${width}px`;
      element.style.minHeight = `${height}px`;
      element.style.maxWidth = `${width}px`;
      element.style.maxHeight = `${height}px`;
      element.style.overflow = 'hidden';
      element.style.backgroundColor = backgroundColor;
      element.style.position = 'relative';
      element.style.transform = 'none';
    },
  });

  const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(b => resolve(b), 'image/png', 1.0));
  if (!blob) throw new Error('html2canvas returned null blob');
  
  console.log('✅ html2canvas produced PNG blob:', { size: blob.size, width, height });
  return blob;
};

// Capture with html-to-image with retry
const captureWithHtmlToImage = async (
  node: HTMLElement,
  width: number,
  height: number,
  backgroundColor: string,
  pixelRatio: number
): Promise<Blob | null> => {
  const options = {
    backgroundColor,
    width,
    height,
    canvasWidth: width,
    canvasHeight: height,
    pixelRatio,
    cacheBust: true,
    skipFonts: true,
    includeQueryParams: true,
    style: {
      width: `${width}px`,
      height: `${height}px`,
      minWidth: `${width}px`,
      minHeight: `${height}px`,
      maxWidth: `${width}px`,
      maxHeight: `${height}px`,
      transform: 'none',
      overflow: 'hidden',
      backgroundColor,
    },
  } as any;

  // First attempt
  let blob = await toBlob(node, options);
  
  // Safari fix: second attempt often works better
  if (!blob || blob.size < 10000) {
    console.log('🔄 First html-to-image attempt small/failed, retrying...');
    await new Promise(r => setTimeout(r, 500));
    blob = await toBlob(node, options);
  }
  
  return blob;
};

// Convert a DOM node to a PNG Blob using html-to-image, with html2canvas fallback
export const nodeToPng = async (
  node: HTMLElement,
  opts: NodeToPngOptions = {}
): Promise<Blob> => {
  const {
    width = 1080,
    height = 1350,
    backgroundColor = '#ffffff',
    pixelRatio = 1,
    fallbackData,
  } = opts;

  // Force exact dimensions on the node BEFORE capture
  node.style.width = `${width}px`;
  node.style.height = `${height}px`;
  node.style.minWidth = `${width}px`;
  node.style.minHeight = `${height}px`;
  node.style.maxWidth = `${width}px`;
  node.style.maxHeight = `${height}px`;
  node.style.overflow = 'hidden';
  node.style.backgroundColor = backgroundColor;
  node.style.position = 'relative';

  const isSafariBrowser = isSafari();
  const isIOSDevice = isIOS();
  
  console.log('📐 nodeToPng: Starting capture', { 
    width, 
    height, 
    pixelRatio,
    isSafari: isSafariBrowser,
    isIOS: isIOSDevice,
    hasFallbackData: !!fallbackData
  });

  // Wait for any pending styles/layouts
  await new Promise(resolve => setTimeout(resolve, isSafariBrowser || isIOSDevice ? 500 : 100));

  // For Safari/iOS: try html2canvas, then native canvas as ultimate fallback
  if (isSafariBrowser || isIOSDevice) {
    console.log('🍎 Safari/iOS detected, using html2canvas with native canvas fallback...');
    
    try {
      const blob = await captureWithHtml2canvas(node, width, height, backgroundColor, pixelRatio);
      
      // Validate blob - iOS sometimes produces tiny/empty blobs
      if (blob && blob.size > 10000) {
        return blob;
      }
      
      console.warn('⚠️ html2canvas produced small blob on iOS, trying native canvas...');
    } catch (err) {
      console.error('❌ html2canvas failed on Safari/iOS:', err);
    }
    
    // Ultimate iOS fallback: native canvas rendering
    if (fallbackData) {
      console.log('🎨 Using native Canvas API as ultimate iOS fallback...');
      return await renderWithNativeCanvas(width, height, backgroundColor, fallbackData);
    }
    
    throw new Error('iOS rendering failed and no fallback data provided');
  }

  // For other browsers: try html-to-image first with fallback to html2canvas
  try {
    const blob = await captureWithHtmlToImage(node, width, height, backgroundColor, pixelRatio);
    
    if (blob && blob.size > 10000) {
      console.log('✅ html-to-image produced valid PNG blob:', { size: blob.size, width, height });
      return blob;
    }
    
    console.warn('⚠️ html-to-image produced a small/invalid blob, falling back to html2canvas');
  } catch (err) {
    console.warn('⚠️ html-to-image failed, falling back to html2canvas:', err);
  }

  // Fallback: html2canvas
  return await captureWithHtml2canvas(node, width, height, backgroundColor, pixelRatio);
};
