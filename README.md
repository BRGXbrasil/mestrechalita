# Mestre Chalita — MIII

Aplicativo web público de interpretação simbólica, com cálculos locais no navegador e leitura consolidada.

**Aplicativo publicado:** https://brgxbrasil.github.io/mestrechalita/

**Código:** [index.html](./index.html) · [astrohd.js](./astrohd.js) · [testes](./tests/smoke.cjs)

## Módulos integrados

- **Numerologia pitagórica:** caminho de vida, expressão, alma, personalidade, ciclos anual, mensal e diário.
- **Tarot:** três cartas sem repetição, posição direta/invertida e interpretação.
- **I Ching:** hexagrama e linha móvel; interpretações de linha clássica só quando integradas.
- **Runas:** sorteio de uma runa e interpretação simbólica.
- **Baralho Lenormand:** três cartas entre 36 símbolos tradicionais, sem repetição.
- **Astrologia tropical:** efemérides locais para Sol, Lua e oito planetas, signos/graus, aspectos e, quando há coordenadas, ascendente, meio do céu e 12 casas iguais.
- **Human Design:** 13 ativações de personalidade e 13 de design, 64 portas, 36 canais possíveis, nove centros, tipo, estratégia, autoridade, perfil, definição e portas da cruz de encarnação. O instante de design corresponde a 88° de longitude solar antes do nascimento.
- **Leitura consolidada:** síntese dos resultados dos módulos, com limitações metodológicas explícitas.

## Entrada natal e precisão

Informe **data, hora de nascimento e fuso UTC histórico**. A localização é obtida de uma lista interna de cidades (coordenadas aproximadas) ou das coordenadas de latitude e longitude digitadas. Se não houver hora e fuso, a consulta geral funciona, mas os cálculos natais ficam indisponíveis.

A astronomia usa [Astronomy Engine](https://github.com/cosinekitty/astronomy), distribuído sob licença MIT e incluído localmente em [vendor/](./vendor/). As posições astronômicas não tornam válidas cientificamente as interpretações da astrologia ou do Human Design. **Nodos lunares médios são aproximados**, e o sistema de casas é **casas iguais**, não Placidus. Para dados de nascimento antigos, revise horário de verão e fuso histórico. Resultados perto de fronteiras de portas/linhas podem diferir de calculadoras profissionais baseadas em outras efemérides.

## Segurança e dados

- Site estático e **público**, sem senha de acesso.
- Nenhum dado da consulta é enviado por uma API do aplicativo, armazenado ou sincronizado em nuvem; os cálculos acontecem localmente.
- O código pode ser inspecionado no GitHub. Não inserir senhas ou informações privadas no repositório.
- Sorteios dos oráculos são reproduzíveis pela mesma semente SHA-256 (não representam sorteio físico).
- Interpretação simbólica e não preditiva; não substitui orientação médica, jurídica ou financeira.

## Publicação e testes

A publicação no GitHub Pages está automatizada em [pages.yml](./.github/workflows/pages.yml). Qualquer atualização da branch **main** executa primeiro os testes, depois publica os arquivos estáticos.

```bash
node tests/smoke.cjs
```

**Última validação da versão funcional:** 56 testes aprovados no GitHub Actions (12/11/2026), cobrindo oráculos, numerologia, astrologia, Human Design, dados inválidos e exibição. Consulte a aba [Actions](https://github.com/BRGXbrasil/mestrechalita/actions) para o estado atualizado.

## Endereços e legado

- GitHub Pages (principal): https://brgxbrasil.github.io/mestrechalita/
- Railway (implantação antiga, preservada e não sincronizada): https://miii-mobile-production.up.railway.app/
- Endereço abre.ai/mestrechalita: **não está registrado/confirmado**. Não divulgar como ativo antes de validar a criação na plataforma de encurtamento.

## Estrutura

- `index.html`: interface móvel e cálculos de numerologia/oráculos.
- `astrohd.js`: motor de astrologia/BodyGraph em JavaScript.
- `vendor/astronomy.browser.min.js`: dependência astronômica MIT.
- `tests/smoke.cjs`: validações reproduzíveis em Node.js 22.
- `.github/workflows/pages.yml`: testes e deploy contínuo.

**Propriedade e contexto:** projeto próprio, independente do código e dos dados da E.Lab.
