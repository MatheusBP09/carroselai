
## Objetivo

Trocar o modelo primário de geração de imagens de `google/gemini-2.5-flash-image` (Nano Banana) para `google/gemini-3.1-flash-image-preview` (Nano Banana 2) — qualidade pro com velocidade similar.

## Mudança

### Arquivo: `supabase/functions/generate-image/index.ts`

Linha 177 — trocar a string do modelo:

```ts
// Antes
result = await generateWithGateway(prompt, LOVABLE_API_KEY, 'google/gemini-2.5-flash-image');

// Depois
result = await generateWithGateway(prompt, LOVABLE_API_KEY, 'google/gemini-3.1-flash-image-preview');
```

A função `generateWithGateway` já trata os formatos de resposta do Gateway (`message.images`, `inline_data`, `image_url`), que são os mesmos pra essa família de modelos — não precisa mexer no parsing.

O fallback DALL-E 3 continua igual, pra garantir resiliência caso o novo modelo falhe ou esteja sem créditos.

## Após o deploy

Atualizar a memória core de `Generators` para refletir o novo primário:
`Lovable Gateway Gemini 3.1 Flash Image (Nano Banana 2) -> DALL-E 3`.

## Observações

- Créditos: o erro 402 atual no Nano Banana original também pode ocorrer no Nano Banana 2 (mesmo workspace, mesma carteira). Se persistir, é necessário adicionar saldo em Settings → Workspace → Usage.
- Custo por imagem do Nano Banana 2 é maior que o do 2.5-flash-image, mas a qualidade é significativamente melhor pra estilo `photography` e `notebook_sketch`.
