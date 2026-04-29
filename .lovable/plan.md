## Objetivo

Migrar a geração de imagens primária do **Lovable AI Gateway** para a **Google AI Studio API (Generative Language API)** chamando direto a Google. Os créditos passam a ser cobrados da conta Google corporativa associada à API key, não mais do AI balance da Lovable.

Fallback continua sendo **DALL-E 3** (OpenAI).

## Pré-requisito do usuário (manual, fora do código)

Antes de eu implementar, você precisa:

1. Ir em https://aistudio.google.com/apikey
2. Logar com a **conta Google corporativa** que vai pagar o consumo
3. Clicar em **Create API key** e selecionar o **projeto GCP corporativo** que tem billing ativo
   - Importante: a chave precisa estar vinculada a um projeto GCP com billing habilitado, senão fica no tier gratuito (que não inclui Gemini 3.1 Flash Image)
4. Copiar a chave gerada (formato `AIza...`)

Depois disso eu peço a chave via `add_secret` com o nome `GOOGLE_AI_API_KEY` e ela fica disponível na edge function.

## Mudanças no código

### `supabase/functions/generate-image/index.ts`

Substituir a função `generateWithGateway` (que chama `ai.gateway.lovable.dev`) por `generateWithGoogleDirect` (que chama `generativelanguage.googleapis.com`).

**Endpoint novo:**
```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent?key=GOOGLE_AI_API_KEY
```

**Body:**
```json
{
  "contents": [{
    "parts": [{ "text": "<prompt>" }]
  }],
  "generationConfig": {
    "responseModalities": ["IMAGE"]
  }
}
```

**Parsing da resposta:** o Google retorna a imagem em `candidates[0].content.parts[].inlineData` com `{ mimeType, data }` (base64). Construir data URL: `data:${mimeType};base64,${data}`.

**Tratamento de erros:**
- `400` com `API_KEY_INVALID` → mensagem clara "API key Google inválida"
- `429` → "Quota excedida na Google AI"
- `403` com billing → "Projeto GCP sem billing habilitado"
- Qualquer falha → cair no fallback DALL-E 3 (igual hoje)

### Fluxo final na edge function

```
1. Tenta GOOGLE_AI_API_KEY (Gemini 3.1 direto na Google)
   ↓ falhou?
2. Tenta OPENAI_API_KEY (DALL-E 3)
   ↓ falhou?
3. Retorna erro
```

A `LOVABLE_API_KEY` deixa de ser usada nessa função (pode continuar configurada pra outras funções).

## Atualização de memória

Atualizar a regra core de Generators para:
`Google AI Studio Gemini 3.1 Flash Image (primary) -> DALL-E 3 (fallback)`

E ajustar `mem://architecture/image-generation-providers-gateway-logic` e `mem://architecture/image-generation-fallback-strategy` pra refletir o endpoint Google direto.

## Custos e implicações

- **Billing**: vai pra sua conta Google Cloud (projeto vinculado à API key), não mais pra Lovable
- **Preço**: tipicamente ~10-20% mais barato que via Lovable Gateway (sem markup)
- **Quotas**: passam a ser as quotas do seu projeto GCP, não as da Lovable
- **Auditoria**: você vê o consumo real em https://console.cloud.google.com/billing
- **Resiliência**: fallback DALL-E 3 mantido, então se Google falhar continua gerando imagem

## O que NÃO muda

- Frontend (`imageGenerationService.ts`) — invocação da edge function continua igual
- Estilos de imagem, prompts, dimensões 1080x1350
- Fluxo do carrossel
- DALL-E 3 fallback

## Após aprovação do plano

1. Peço a chave `GOOGLE_AI_API_KEY` via `add_secret`
2. Aguardo você adicionar
3. Aplico a mudança em `generate-image/index.ts`
4. Atualizo memórias
5. Testo gerando uma imagem e confirmo nos logs que o provider é `google-direct-gemini-3.1-flash-image-preview`