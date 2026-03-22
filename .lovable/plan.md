

## Plan: Migrar geração de imagens para Lovable AI Gateway

### Problema atual
O Gemini (`gemini-2.5-flash-image-preview`) retorna erro 404 em 100% das chamadas. Todas as imagens estão sendo geradas pelo fallback DALL-E 3, que é mais lento e caro.

### Solução
Atualizar a Edge Function `generate-image` para usar o **Lovable AI Gateway** com o modelo `google/gemini-2.5-flash-image` (primário) e `google/gemini-3-pro-image-preview` como fallback de alta qualidade, eliminando chamadas diretas à API do Google.

### Mudanças

**1. Atualizar `supabase/functions/generate-image/index.ts`**
- Substituir chamada direta à API do Gemini pelo Lovable AI Gateway (`https://ai.gateway.lovable.dev/v1/chat/completions`)
- Usar `LOVABLE_API_KEY` (já configurado) em vez de `NANO_BANANA`
- Cadeia de fallback: Gemini via Gateway → DALL-E 3 via OpenAI
- Manter logs detalhados e resposta com `provider` e `fallbackUsed`

### Benefícios
- Elimina o erro 404 atual do Gemini
- Refresh automático de tokens via Gateway
- Mantém DALL-E 3 como fallback de segurança
- Nenhuma mudança necessária no frontend

### Detalhes técnicos
- Endpoint: `POST https://ai.gateway.lovable.dev/v1/chat/completions`
- Modelo imagem: `google/gemini-2.5-flash-image`
- Auth: `Bearer $LOVABLE_API_KEY`
- A resposta de imagem via Gateway vem como base64 inline no content parts

