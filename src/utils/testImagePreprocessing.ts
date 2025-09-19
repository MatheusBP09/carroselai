/**
 * Test utility to verify image preprocessing works correctly
 */

import { preloadSlideImages } from '@/services/imagePreprocessingService';

export const testImagePreprocessing = async () => {
  console.log('🧪 Starting image preprocessing test...');
  
  // Test with sample URLs that might have CORS issues
  const testUrls = [
    'https://picsum.photos/400/400', // Profile image
    'https://picsum.photos/800/600'  // Content image
  ];

  try {
    const result = await preloadSlideImages({
      profileImageUrl: testUrls[0],
      contentImageUrl: testUrls[1],
      username: 'testuser'
    });

    console.log('✅ Image preprocessing test completed successfully:', {
      hasProcessedProfile: !!result.profileImageUrl,
      hasProcessedContent: !!result.contentImageUrl,
      profileUrlType: result.profileImageUrl?.startsWith('data:') ? 'base64' : 'original',
      contentUrlType: result.contentImageUrl?.startsWith('data:') ? 'base64' : 'original'
    });

    // Create visual preview
    const previewContainer = document.createElement('div');
    previewContainer.style.position = 'fixed';
    previewContainer.style.top = '50%';
    previewContainer.style.left = '50%';
    previewContainer.style.transform = 'translate(-50%, -50%)';
    previewContainer.style.background = 'white';
    previewContainer.style.padding = '20px';
    previewContainer.style.borderRadius = '12px';
    previewContainer.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3)';
    previewContainer.style.zIndex = '9999';
    previewContainer.style.maxWidth = '80vw';
    previewContainer.style.maxHeight = '80vh';
    previewContainer.style.overflow = 'auto';

    previewContainer.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <h3 style="margin: 0 0 10px 0; color: #333;">✅ Teste de Imagens Concluído</h3>
        <button onclick="this.parentElement.parentElement.remove()" style="
          background: #dc2626; 
          color: white; 
          border: none; 
          padding: 8px 16px; 
          border-radius: 6px; 
          cursor: pointer;
          font-size: 14px;
        ">Fechar</button>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start;">
        <div style="text-align: center;">
          <h4 style="margin: 0 0 10px 0; color: #666;">Imagem de Perfil</h4>
          <img src="${result.profileImageUrl}" style="
            max-width: 200px; 
            max-height: 200px; 
            border-radius: 50%; 
            border: 3px solid #ddd;
            object-fit: cover;
          " />
          <p style="font-size: 12px; color: #888; margin-top: 8px;">
            Tipo: ${result.profileImageUrl?.startsWith('data:') ? 'Base64 (Processada)' : 'URL Original'}
          </p>
        </div>
        
        <div style="text-align: center;">
          <h4 style="margin: 0 0 10px 0; color: #666;">Imagem de Conteúdo</h4>
          <img src="${result.contentImageUrl}" style="
            max-width: 200px; 
            max-height: 150px; 
            border-radius: 8px; 
            border: 2px solid #ddd;
            object-fit: cover;
          " />
          <p style="font-size: 12px; color: #888; margin-top: 8px;">
            Tipo: ${result.contentImageUrl?.startsWith('data:') ? 'Base64 (Processada)' : 'URL Original'}
          </p>
        </div>
      </div>
    `;

    document.body.appendChild(previewContainer);

    return result;
  } catch (error) {
    console.error('❌ Image preprocessing test failed:', error);
    throw error;
  }
};

// Simple console test runner
if (typeof window !== 'undefined') {
  (window as any).testImagePreprocessing = testImagePreprocessing;
  console.log('🔧 Image preprocessing test available at: window.testImagePreprocessing()');
}