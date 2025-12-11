import { toBlob } from 'html-to-image';

export interface NodeToPngOptions {
  width?: number;
  height?: number;
  backgroundColor?: string;
  pixelRatio?: number;
}

// Detect Safari/iOS
const isSafari = (): boolean => {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

const isIOS = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
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
    isIOS: isIOSDevice
  });

  // Wait for any pending styles/layouts
  await new Promise(resolve => setTimeout(resolve, isSafariBrowser || isIOSDevice ? 300 : 100));

  // For Safari/iOS: use html2canvas directly (more compatible)
  if (isSafariBrowser || isIOSDevice) {
    console.log('🍎 Safari/iOS detected, using html2canvas directly for better compatibility...');
    try {
      return await captureWithHtml2canvas(node, width, height, backgroundColor, pixelRatio);
    } catch (err) {
      console.error('❌ html2canvas failed on Safari/iOS:', err);
      throw err;
    }
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
