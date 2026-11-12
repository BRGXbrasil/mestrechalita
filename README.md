# Mestre Chalita — MIII

Aplicativo estático de interpretação simbólica (numerologia pitagórica, Tarot, I Ching e runas), com **leitura consolidada**.

## GitHub Pages

- **Endereço previsto, após ativar Pages:** https://brgxbrasil.github.io/mestrechalita/
- **Código-fonte:** [index.html](./index.html)
- **Publicação:** GitHub → repositório → Settings → Pages → Build and deployment → Deploy from a branch → main → / (root) → Save.
- **Atenção:** o GitHub Pages ainda precisa ser ativado e validado. Repositórios privados podem exigir um plano GitHub elegível para Pages. O site publicado no Pages é público mesmo que o repositório seja privado em planos que permitam essa configuração.

## Endereços anteriores

- Railway (mantida por enquanto, sem exclusão): https://miii-mobile-production.up.railway.app/
- URL curta solicitada: https://abre.ai/mestrechalita — ainda não registrada nem confirmada.

## Funcionalidade e limites

- A versão Pages é **Mestre Chalita v0.9.0**, adaptada para funcionar sem servidor.
- Os cálculos e a seleção simbólica SHA-256 ocorrem no navegador; consultas não são enviadas a servidor nem persistidas.
- Interpretação integrada de numerologia, Tarot, I Ching e runa.
- A seleção simbólica mantém o algoritmo SHA256-counter-v1-mobile, mas não deve ser confundida com a seleção Python original.
- Astrologia, Human Design e Sal Deck ainda não estão integrados.
- O código JavaScript é público para visitantes quando o site estiver publicado. Não incluir senhas ou segredos no repositório.
- A publicação estática não oferece a autenticação HTTP Basic da versão Railway.

## Validação

O arquivo index.html foi enviado ao branch main. A ativação do GitHub Pages e o teste HTTP externo ainda não foram confirmados.
