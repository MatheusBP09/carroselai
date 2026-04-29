## Diagnóstico

A regra do backend está funcionando corretamente. Confirmado nos logs:
```
Image rules applied. Distribution: slide 1: IMG | slide 2: text | slide 3: text | slide 4: IMG | slide 5: text
```

O problema está no **front-end (`src/steps/Step4Processing.tsx`)**, que **ignora completamente o campo `needsImage`** vindo do backend e gera imagem para todos os slides:

1. **Linha 187** — `imageRequests` é construído com `result.slides.map(...)` sem filtro, gerando um prompt para cada slide.
2. **Linha 219** — `enhancedImageService.generateBatch(imageRequests, totalSlides, ...)` chama DALL-E/Gemini para todos.
3. **Linha 272** — ao montar `slidesWithImages`, força `needsImage: true` em todos, **sobrescrevendo a decisão do backend**.
4. **Linha 274/280** — popula `contentImageUrls` e `customImageUrl` para todos, fazendo o `TwitterPost` (que decide visualmente por `!!contentImageUrl`) mostrar imagem em todos.

Step5 então faz `hasImage: slide.hasImage ?? true` (linha 32), que vira `true` porque ninguém setou. Resultado: 5 de 5 com imagem.

## Mudança proposta (1 arquivo)

### `src/steps/Step4Processing.tsx` — respeitar `needsImage` do backend

**A. Construção dos `imageRequests` (linha ~187)**
- Iterar todos os slides, mas só gerar prompt contextual quando `slide.needsImage === true`.
- Para slides sem imagem, retornar `null` (placeholder) — não chamar a IA, economizando tempo e crédito.

**B. Chamada do batch (linha ~219)**
- Filtrar os `null` antes de mandar pra `enhancedImageService.generateBatch`.
- Manter um mapa `slideIndex → resultado` para reassociar depois sem desalinhar.

**C. Montagem dos `slidesWithImages` (linhas ~245-282)**
- **NÃO** forçar `needsImage: true`. Preservar o valor vindo do backend.
- Setar `hasImage: slide.needsImage` (default explícito que respeita a regra).
- `contentImageUrls`: `[]` para slides sem imagem; `[imageResult.imageUrl]` para os com imagem.
- `customImageUrl`: `undefined` para slides sem imagem.
- `imagePrompt`: `''` para slides sem imagem.

**D. Estatísticas (`imageStats`)**
- `total` passa a ser apenas a contagem de slides com `needsImage: true` (não `result.slides.length`).
- Ajustar texto de progresso (`"Processando imagem X de Y"`) para usar essa contagem.

## O que NÃO será mexido

- ✅ `supabase/functions/generate-carousel/index.ts` — regra do backend já está correta.
- ✅ `src/components/TwitterPost.tsx` — layout adaptativo já feito, continua decidindo por `!!contentImageUrl`.
- ✅ `src/components/TwitterPostPreview.tsx` — mesma lógica, continua intacto.
- ✅ `src/steps/Step5Review.tsx` — fluxo manual de adicionar/remover/regerar imagem permanece exatamente igual. Usuário ainda pode sobrepor a regra automática (adicionar imagem num slide sem ou remover de um com).
- ✅ `src/components/ImageControls.tsx` — controles intactos.
- ✅ Toda a torre de exportação (`simpleDownloadService`, `nodeToImageService`, `Step6Download`) — intocada.
- ✅ `enhancedImageService` e serviços de imagem — intocados.

## Comportamento esperado depois

**Geração 5 slides:**
- Slide 1: imagem ✅ (regra: capa)
- Slide 2: texto ✅ (font scaling, top-left)
- Slide 3: texto ✅
- Slide 4: imagem ✅ (1 aleatório do meio — pode variar entre 2, 3 ou 4)
- Slide 5: texto ✅ (regra: CTA limpo)

**Step 5 (Revisão):**
- Slides sem imagem aparecem só com texto, layout adaptativo (top-left, fonte maior).
- Usuário pode adicionar imagem num slide sem (upload) → vira slide com imagem normalmente.
- Usuário pode remover imagem do slide 1 → vira texto, fonte cresce.

**Step 6 (Download):**
- Já corrigido na Parte 1 — respeita `hasImage`. Continua funcionando.

## Garantias de segurança

1. Mudança isolada num único arquivo (Step4Processing.tsx).
2. Nenhum tipo novo, nenhuma mudança de schema, nenhuma mudança em serviço de imagem.
3. Rollback trivial — só esse arquivo.
4. Bônus: gera menos imagens via DALL-E → mais rápido e mais barato.

## Validação após implementação

1. Gerar carrossel novo de 5 slides → confirmar no preview do Step 5 que apenas slide 1 + 1 do meio + (último sem) têm imagem.
2. Confirmar logs do edge function continuam mostrando a distribuição correta.
3. Remover imagem do slide 1 manualmente → texto deve crescer (font scaling).
4. Adicionar imagem manualmente num slide do miolo sem imagem → deve renderizar normal.
5. Baixar zip → cada PNG deve refletir o que se vê no preview.

Posso prosseguir?
