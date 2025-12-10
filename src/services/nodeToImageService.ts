import { toBlob } from 'html-to-image';

export interface NodeToPngOptions {
  width?: number;
  height?: number;
  backgroundColor?: string;
  pixelRatio?: number;
}

// Convert a DOM node to a PNG Blob using html-to-image, with html2canvas fallback
export const nodeToPng = async (
  node: HTMLElement,
  opts: NodeToPngOptions = {}
): Promise<Blob> => {
  // ALWAYS use exact dimensions - never rely on clientWidth/clientHeight
  const {
    width = 1080,
    height = 1350,
    backgroundColor = '#ffffff',
    pixelRatio = 2, // Increased for better quality
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

  console.log('📐 nodeToPng: Forcing exact dimensions:', { width, height, pixelRatio });

  // Wait for any pending styles/layouts
  await new Promise(resolve => setTimeout(resolve, 100));

  // First attempt: html-to-image
  try {
    const options = {
      backgroundColor,
      width,
      height,
      canvasWidth: width * pixelRatio,
      canvasHeight: height * pixelRatio,
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

    const blob = await toBlob(node, options);
    if (blob && blob.size > 10000) {
      console.log('✅ html-to-image produced valid PNG blob:', { size: blob.size, width, height });
      return blob;
    }
    console.warn('⚠️ html-to-image produced a small/invalid blob, falling back', {
      hasBlob: !!blob,
      size: blob?.size,
    });
  } catch (err) {
    console.warn('⚠️ html-to-image failed, will fallback to html2canvas', err);
  }

  // Fallback: html2canvas
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
  if (!blob) throw new Error('Fallback html2canvas returned null blob');

  if (blob.size <= 10000) {
    console.warn('⚠️ Fallback blob appears too small; capture may be blank', { size: blob.size });
  }

  console.log('✅ html2canvas fallback produced PNG blob:', { size: blob.size, width, height });
  return blob;
};
