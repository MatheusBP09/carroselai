import { toBlob } from 'html-to-image';

export interface NodeToPngOptions {
  width?: number;
  height?: number;
  backgroundColor?: string;
  pixelRatio?: number; // devicePixelRatio-like scaling
}

// Convert a DOM node to a PNG Blob using html-to-image, with html2canvas fallback
export const nodeToPng = async (
  node: HTMLElement,
  opts: NodeToPngOptions = {}
): Promise<Blob> => {
  const {
    width = node.clientWidth || 1080,
    height = node.clientHeight || 1350,
    backgroundColor = '#ffffff',
    pixelRatio = 1,
  } = opts;

  // First attempt: html-to-image
  try {
    const options = {
      backgroundColor,
      width,
      height,
      pixelRatio,
      cacheBust: true,
      style: {
        // Ensure consistent sizing and no transforms during capture
        width: `${width}px`,
        height: `${height}px`,
        transform: 'none',
      },
    } as any;

    const blob = await toBlob(node, options);
    if (blob && blob.size > 5000) {
      console.log('✅ html-to-image produced valid PNG blob:', { size: blob.size });
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
  });

  const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(b => resolve(b), 'image/png', 1.0));
  if (!blob) throw new Error('Fallback html2canvas returned null blob');

  if (blob.size <= 5000) {
    console.warn('⚠️ Fallback blob appears too small; capture may be blank', { size: blob.size });
  }

  console.log('✅ html2canvas fallback produced PNG blob:', { size: blob.size });
  return blob;
};
