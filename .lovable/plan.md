## Objetivo

Criar 3 regras automáticas para imagens em carrosséis e tornar o layout do `TwitterPost` inteligente para se adaptar quando o usuário adiciona/remove imagens manualmente — **sem tocar na pipeline de exportação** (html-to-image, container off-screen, ZIP).

---

## Regras de imagem (geração automática)

| Slide | Regra |
|---|---|
| **Slide 1** | SEMPRE com imagem (`needsImage: true`) |
| **Último slide** | NUNCA com imagem (`needsImage: false`) |
| **Miolo** (slides 2 até penúltimo) | Exatamente **1 slide aleatório** com imagem; os demais sem imagem |

Isso garante: capa forte + CTA limpo no final + 1 quebra visual no meio.

---

## O que será mexido (e o que NÃO será mexido)

### ✅ Mexer (3 arquivos, mudanças aditivas)

**1. `supabase/functions/generate-carousel/index.ts`** (back-end)
- Após o parse do JSON da OpenAI, **sobrescrever** o campo `needsImage` de cada slide aplicando as 3 regras acima.
- Ajustar o prompt para que o texto de slides "sem imagem" seja mais longo (400-500 chars) e "com imagem" seja conciso (180 chars) — já existe parcialmente, só reforçar.
- Nada é removido. Só uma função `applyImageRules(slides)` adicionada antes do `return`.

**2. `src/components/TwitterPost.tsx`** (renderer — o componente "sagrado" da exportação)
- **Layout do texto sem imagem**: hoje centraliza vertical e horizontalmente. Mudar para alinhar **ao topo e à esquerda** (igual ao layout com imagem), aumentando a fonte progressivamente conforme o texto for curto, para aproveitar o espaço.
- Implementação: função simples `getFontSize(textLength, hasImage)` que retorna 36px (com imagem) ou escala 40px→64px (sem imagem, baseado no `text.length`).
- **Não muda nada da estrutura de divs, dimensões 1080x1350, profile, badge, ou bloco de imagem.** Só ajusta `fontSize`, `textAlign` e `alignItems` do bloco de texto.

**3. `src/types/carousel.ts`** (opcional — só se precisar)
- Nenhuma mudança necessária. `hasImage`, `needsImage`, `customImageUrl` já existem.

### ❌ NÃO mexer (intocáveis)

- `src/services/simpleDownloadService.ts` — torre de exportação
- `src/services/nodeToImageService.ts` / `renderToImageService.ts` / `previewCaptureService.ts`
- `src/steps/Step6Download.tsx` — já corrigido na Parte 1, mantém respeitando `hasImage`
- `src/components/ImageControls.tsx` — controles de remover/trocar/regerar continuam intactos
- `src/steps/Step5Review.tsx` — fluxo de revisão intacto
- `TwitterPostPreview.tsx` — preview espelha o `TwitterPost` automaticamente

---

## Comportamento esperado após a mudança

### Cenário A — Geração automática (10 slides)
- Slide 1: imagem ✅
- Slides 2-9: 1 deles aleatório com imagem, demais sem
- Slide 10: sem imagem ✅

### Cenário B — Usuário remove imagem do slide 1
- Texto se reposiciona automaticamente: topo, esquerda, fonte cresce para preencher melhor o slide.

### Cenário C — Usuário adiciona imagem (upload) num slide originalmente sem
- `hasImage` vira `true`, layout volta a fonte 36px + bloco de imagem embaixo. **Já funciona** porque o `TwitterPost` lê `contentImageUrl` dinamicamente.

### Cenário D — Usuário regenera/troca imagem
- Sem mudança. Continua funcionando igual.

---

## Detalhes técnicos da escala de fonte (para texto sem imagem)

```text
text.length <= 100  → fontSize 64px
text.length <= 200  → fontSize 56px
text.length <= 350  → fontSize 48px
text.length >  350  → fontSize 40px
```

Alinhamento sem imagem: `textAlign: 'left'`, `alignItems: 'flex-start'` (igual ao com imagem). Container do texto continua usando `flex: 1` para preencher o espaço, mas o conteúdo fica colado no topo.

---

## Garantias de segurança

1. **Exportação**: nenhum arquivo da pipeline de download é tocado. O `TwitterPost` só muda valores de `fontSize`/`textAlign`/`alignItems` — as dimensões 1080x1350 e o `position: fixed; transform: translateX(-9999px)` do container externo permanecem.
2. **Edição manual sobrepõe regra automática**: se o usuário remover/adicionar imagem no Step 5, o flag `hasImage` que ele setou ganha — a regra automática só roda na geração inicial.
3. **Rollback fácil**: cada uma das 3 mudanças é isolada. Pode reverter individualmente.

---

## Ordem de execução sugerida

1. Mexer no `TwitterPost.tsx` (layout adaptativo de texto) — testar que slides existentes continuam exportando idênticos quando têm imagem.
2. Mexer no `generate-carousel` (regras de imagem) — gerar um carrossel novo e validar a distribuição (1 / meio / último).
3. Validar fluxo completo: gerar → revisar → remover imagem do slide 1 (texto deve crescer) → adicionar imagem em outro → baixar.

Posso prosseguir nessa ordem?