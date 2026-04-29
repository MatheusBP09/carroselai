# Plano: Refatoração de Estilos de Imagem + Prompts em Inglês

## Objetivo
1. Resolver os conflitos de prompt identificados na análise anterior (estilo vs tema vs constraints).
2. Reduzir os 7 estilos para **3**: `photography`, `notebook_sketch` (novo, baseado nos anexos) e `custom`.
3. Reescrever todos os prompts de imagem em **inglês** (modelos rendem muito melhor).
4. Aproveitar o `imagePrompt` que o GPT já gera no `generate-carousel` em vez de descartá-lo.

---

## Mudanças

### 1. `src/types/carousel.ts`
Reduzir o tipo:
```ts
export type ImageStyle = 'photography' | 'notebook_sketch' | 'custom';
```

### 2. `src/steps/Step2Content.tsx`
Remover as 5 opções (`illustration`, `minimalist`, `infographic`, `abstract_3d`, `watercolor`) do array `imageStyleOptions`.
Adicionar a nova opção:
```
{ value: 'notebook_sketch', label: 'Caderno Ilustrado', icon: '📓', 
  description: 'Estilo desenho à mão em folha de caderno, com setas e ícones (como infográficos manuscritos)' }
```
Manter `photography` e `custom`.

### 3. `src/context/CarouselContext.tsx`
Default permanece `photography` (já está).

### 4. `src/services/contextualImageService.ts` — refatoração principal

**a) Novo `stylePrompts` (em inglês, dominantes):**
```ts
const stylePrompts: Record<ImageStyle, string> = {
  photography: 'Professional editorial photography, ultra-realistic, natural lighting, shallow depth of field, cinematic composition, vibrant true-to-life colors, 8k quality, no text, no logos',
  
  notebook_sketch: 'Hand-drawn illustration on a lined spiral notebook page, top-down flat lay view, colored pencil and marker style, playful cartoon characters and objects (houses, money bags, coins, arrows, stairs, buildings), bold hand-lettered title at the top in dark blue and red marker with yellow highlighter underline, curved colored arrows connecting elements, small doodled icons, soft pastel paper texture with subtle blue grid lines, red margin line on the left, yellow sticky note with red pushpin in top-left corner, two pencils with erasers at the bottom-right corner, warm and educational infographic feel, vibrant but soft colors, casual didactic style',
  
  custom: ''
};
```

**b) Eliminar conflitos** — remover/condicionar a lógica `themePrompt` que sobrescrevia o estilo:
- Para `photography` e `notebook_sketch`: NÃO injetar mais `themePrompt` (ele jogava "corporate icons", "infographic style" por cima e quebrava).
- Manter apenas: `keywords visualizáveis` + `tom` + `constraints específicas`.

**c) Constraints específicas por estilo:**
- `photography`: `"Strictly no text overlays, no typography, no logos."`
- `notebook_sketch`: `"Hand-lettered short labels in Portuguese are allowed and encouraged (max 2-4 words per label, written in marker style). Title at top must reflect the slide topic."`  ← este é o único caso onde texto é permitido, espelhando os anexos.
- `custom`: sem constraints rígidas.

**d) Reaproveitar o `imagePrompt` do GPT:**
A função `generateContextualImage` deve aceitar opcionalmente um `gptImagePrompt` (o `imagePrompt` que o GPT já produz por slide). Quando presente:
- Traduzir/embutir esse contexto no prompt final como "Subject:" em inglês.
- Estrutura final: `[STYLE BASE]. Subject: [gpt prompt]. [Tone]. [Position]. [Constraints]. Instagram carousel 1080x1350.`

**e) Tradução do conteúdo do slide:**
Para `notebook_sketch`, o título manuscrito do desenho precisa estar em PT-BR (como nos anexos). Manter os labels curtos extraídos do texto do slide em PT-BR; o resto da descrição do estilo permanece em inglês.

**f) Remover detecção de tema PT-BR como driver de estilo** — manter apenas para extrair `keyVisualizableWords` (que viram parte do "Subject").

### 5. `src/steps/Step4Processing.tsx`
Passar o `slide.imagePrompt` (gerado pelo GPT) para `generateContextualImage` como novo arg opcional.

### 6. `supabase/functions/generate-carousel/index.ts`
Atualizar a instrução do GPT para que `imagePrompt` seja escrito **em inglês** e descreva o **subject/cena**, não o estilo:
```
- imagePrompt: written in ENGLISH, describes ONLY the subject/scene/objects (NOT the visual style). Example: "a young Brazilian entrepreneur looking at a laptop with charts on screen, modern home office".
```

---

## Detalhes técnicos para o estilo `notebook_sketch`

Inspirado nos 6 anexos enviados (`fw-01` a `fw-05` + `fw-01-2`):
- **Suporte**: página de caderno espiral, linhas azuis suaves, margem vermelha à esquerda.
- **Adornos fixos**: post-it amarelo com tachinha vermelha (canto sup. esq.), 2 lápis com borracha (canto inf. dir.).
- **Tipografia do título**: marcador azul-escuro + vermelho com sublinhado em marca-texto amarelo.
- **Elementos**: personagens cartoon, casas/prédios, sacos de dinheiro, moedas, setas curvas coloridas (verde/amarela/vermelha), checkmarks.
- **Handle do usuário**: o anexo mostra `@mariohribeiro` no canto — vamos pedir ao modelo para reservar espaço, mas o handle real será adicionado pelo `TwitterPost.tsx` (não no prompt da imagem, para evitar erros de OCR/typo). Adicionar à constraint: `"Leave bottom-right corner clean (no text or watermark there)."`

---

## Arquivos modificados
- `src/types/carousel.ts`
- `src/steps/Step2Content.tsx`
- `src/services/contextualImageService.ts` (refatoração maior)
- `src/steps/Step4Processing.tsx` (passar gptImagePrompt)
- `supabase/functions/generate-carousel/index.ts` (prompt em inglês para imagePrompt)

## Não muda
- Pipeline de download/render
- Layout do `TwitterPost.tsx`
- Edge function `generate-image` (já é agnóstica ao prompt)
- Regras de needsImage (slide 1 + 1 do meio)

## Riscos
- Usuários que tinham preferência por `illustration`/`watercolor` etc. perdem a opção. Sugestão: na hora de migrar, qualquer valor antigo no contexto cai automaticamente em `photography` (faremos um fallback no `Step2Content`).

Posso prosseguir com essa refatoração?