## Objetivo

Aproveitar melhor o espaço vertical (~1100px) dos slides **sem imagem**, sem mudar:
- Alinhamento à esquerda
- Início do texto no topo (logo abaixo do header)
- Layout dos slides **com** imagem (continuam em 36px)
- Fluxo de remover/trocar/regerar imagens (Step5)
- Pipeline de exportação (TwitterPost segue como single source of truth)

## Diagnóstico atual

Em `src/components/TwitterPost.tsx`, `getTextFontSize()` hoje retorna:

```
hasImage   → 36px
≤100 chars → 64px
≤200 chars → 56px
≤350 chars → 48px
>350       → 40px
```

Resultado: textos curtos (típico de slides de carrossel, 80–180 chars) ficam em 56–64px num espaço que comportaria bem mais — daí a sensação de "espaço vazio". Tweets normalmente têm ≤280 chars, então a maior parte cai nas faixas menores e desperdiça área.

## Mudanças propostas

### 1. `src/components/TwitterPost.tsx` — escala mais agressiva

Reescrever `getTextFontSize()` com mais granularidade e teto mais alto, calibrado para 1080×1350 com header de ~150px e padding 64px (≈1100px úteis de altura, ≈950px de largura):

```
hasImage   → 36px (inalterado)

Sem imagem:
≤ 60 chars  → 96px   (frases-impacto)
≤ 100 chars → 84px
≤ 150 chars → 72px
≤ 220 chars → 60px
≤ 320 chars → 52px
≤ 450 chars → 44px
> 450       → 38px   (piso, garante caber)
```

E ajustar `lineHeight` para `1.2` quando `!hasImage` (atualmente 1.3) — em fontes grandes, 1.3 cria gaps visuais excessivos. Manter 1.3 quando `hasImage`.

Manter:
- `textAlign: 'left'`
- `flex: '1'` no bloco de texto (ocupa espaço, mas conteúdo continua começando do topo via `display: 'block'`)
- Header e profile inalterados

### 2. Nada mais muda

- `Step4Processing.tsx`: regras de `needsImage` (slide 1 = imagem, último = sem, 1 do meio = imagem) permanecem como já implementadas.
- `Step5Review.tsx`: remover/trocar/regerar imagens continua funcionando — quando o usuário remove a imagem, `hasImage` vira `false`, `contentImageUrl` some, e o `TwitterPost` automaticamente recalcula a fonte usando a nova escala. Quando adiciona uma imagem num slide que não tinha, `hasImage` vira `true` e a fonte volta a 36px (cabe com a imagem ocupando o restante via `flex: 1`).
- `simpleDownloadService.ts` / pipeline de export: usa o mesmo `TwitterPost`, então preview = download (regra de memória mantida).

## Detalhes técnicos

Diff conceitual em `TwitterPost.tsx`:

```ts
const getTextFontSize = (): string => {
  if (hasImage) return '36px';
  const len = text.length;
  if (len <= 60)  return '96px';
  if (len <= 100) return '84px';
  if (len <= 150) return '72px';
  if (len <= 220) return '60px';
  if (len <= 320) return '52px';
  if (len <= 450) return '44px';
  return '38px';
};

// no style do bloco de texto:
lineHeight: hasImage ? '1.3' : '1.2',
```

## Validação após implementar

1. Gerar carrossel de 5 slides → conferir que slides sem imagem (último + meios) ocupam visualmente bem o espaço.
2. No Step5, remover imagem de um slide com imagem → texto deve crescer automaticamente.
3. No Step5, adicionar/regerar imagem em slide sem → texto deve voltar a 36px e imagem aparecer abaixo.
4. Baixar ZIP → conferir que PNGs refletem exatamente o preview.