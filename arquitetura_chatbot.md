# Arquitetura Técnica do Chatbot de Roleplay Imersivo

Este documento detalha a arquitetura técnica proposta para o chatbot de roleplay imersivo, visando atender aos requisitos de gratuidade, privacidade, escalabilidade e facilidade de manutenção para o criador e seus assinantes do Patreon.

## 1. Visão Geral da Arquitetura

A solução será construída sobre uma arquitetura **serverless**, que permite a execução de código sem a necessidade de gerenciar servidores, ideal para aplicações com tráfego variável e para manter os custos baixos (ou nulos, na camada gratuita). Os principais componentes são:

1.  **Frontend (Interface do Usuário):** Uma aplicação web estática onde os assinantes interagirão com o chatbot.
2.  **Backend Serverless (API Gateway e Lógica de Negócio):** Funções serverless que atuarão como intermediárias entre o frontend, a API do LLM e o banco de dados.
3.  **Banco de Dados (Persistência de Dados):** Um banco de dados gratuito para armazenar o histórico de conversas e dados de usuários, garantindo a privacidade.
4.  **API de Modelo de Linguagem (LLM):** O serviço de inteligência artificial que gerará as respostas do chatbot.

## 2. Detalhamento dos Componentes

### 2.1. Frontend

O frontend será a interface que seus assinantes usarão para conversar com o bot. Será uma aplicação web leve e responsiva.

*   **Tecnologias Sugeridas:** HTML, CSS e JavaScript puro, ou um framework JavaScript leve como [Vue.js](https://vuejs.org/) ou [Svelte](https://svelte.dev/) para uma experiência mais interativa. Para o chat, bibliotecas como [Chat.js](https://www.chartjs.org/) (para gráficos, mas pode inspirar a UI) ou componentes customizados podem ser utilizados.
*   **Hospedagem:** Plataformas de hospedagem estática com planos gratuitos generosos, como:
    *   **Vercel:** Oferece deploy contínuo a partir de repositórios Git (GitHub, GitLab, Bitbucket) e é excelente para projetos front-end. [1]
    *   **Netlify:** Similar ao Vercel, com deploy contínuo e funcionalidades de CI/CD. [2]
    *   **GitHub Pages:** Ideal para projetos simples, hospedando diretamente de um repositório GitHub. [3]

### 2.2. Backend Serverless

O backend será o 

coração da aplicação, responsável por gerenciar a comunicação entre o frontend e a API do LLM, além de persistir o histórico das conversas.

*   **Plataformas Sugeridas:**
    *   **Vercel Functions (Serverless Functions):** Permite escrever funções em Node.js, Python, Go ou Ruby que são executadas sob demanda. Integra-se perfeitamente com o frontend hospedado no Vercel. [4]
    *   **Netlify Functions:** Similar ao Vercel Functions, suporta Node.js, Go e outras linguagens. [5]
    *   **Cloudflare Workers:** Uma opção de edge computing que oferece latência muito baixa e um plano gratuito generoso. [6]
*   **Funcionalidades:**
    *   **Receber Requisições do Frontend:** Capturar as mensagens enviadas pelos assinantes.
    *   **Gerenciar Histórico de Conversa:** Recuperar o histórico da conversa do usuário no banco de dados antes de enviar a requisição ao LLM e salvar a nova interação (pergunta do usuário + resposta do LLM) após receber a resposta.
    *   **Chamar a API do LLM:** Enviar a requisição formatada (incluindo o histórico da conversa) para a API do OpenRouter.
    *   **Processar Resposta do LLM:** Receber a resposta do LLM e enviá-la de volta para o frontend.
    *   **Autenticação e Autorização:** Implementar um mecanismo simples para garantir que apenas assinantes autorizados possam usar o chatbot.

### 2.3. Banco de Dados

O banco de dados será essencial para manter a privacidade das conversas de cada assinante e permitir que o chatbot "lembre" do contexto.

*   **Plataformas Sugeridas (com planos gratuitos generosos):**
    *   **Supabase:** Um backend de código aberto que oferece funcionalidades de banco de dados (PostgreSQL), autenticação, armazenamento e funções serverless. O plano gratuito é bastante robusto. [7]
    *   **Firebase (Firestore):** Banco de dados NoSQL da Google, com um plano gratuito que inclui um bom volume de leituras/escritas e armazenamento. [8]
    *   **PlanetScale:** Banco de dados MySQL serverless com um plano gratuito que oferece um banco de dados de até 5GB e 1 bilhão de linhas de leitura por mês. [9]
*   **Funcionalidades:**
    *   **Armazenamento de Histórico:** Guardar as mensagens trocadas entre cada assinante e o chatbot, associadas ao ID único do assinante.
    *   **Gerenciamento de Usuários:** Armazenar informações básicas dos assinantes (ex: ID do Patreon) para autenticação e associação de conversas.

### 2.4. API de Modelo de Linguagem (LLM)

Conforme pesquisa anterior, a API escolhida para o LLM é o OpenRouter, utilizando o modelo Venice: Uncensored (free).

*   **Provedor:** [OpenRouter](https://openrouter.ai/)
*   **Modelo:** `cognitivecomputations/dolphin-mistral-24b-venice-edition:free` (referido como "Venice: Uncensored (free)")
*   **Características:**
    *   **Conteúdo NSFW:** Explicitamente projetado para ser "uncensored", permitindo roleplay imersivo sem restrições de moderação de conteúdo.
    *   **Compatibilidade:** API compatível com o formato OpenAI, facilitando a integração com bibliotecas e SDKs existentes.
    *   **Limites Gratuitos:** $0/M tokens de entrada e $0/M tokens de saída. Isso significa que o uso do modelo é gratuito para o criador.
    *   **Contexto:** Suporta um contexto de **32.768 tokens**, permitindo conversas longas e detalhadas. [10]

## 3. Fluxo de Interação

O fluxo de interação entre os componentes será o seguinte:

1.  O assinante acessa o frontend do chatbot (hospedado no Vercel/Netlify).
2.  O assinante digita uma mensagem e a envia.
3.  O frontend envia a mensagem para a função serverless do backend (Vercel Functions/Netlify Functions).
4.  A função serverless:
    a.  Autentica o assinante (verificando se é um assinante do Patreon).
    b.  Recupera o histórico da conversa do assinante no banco de dados (Supabase/Firebase).
    c.  Formata a mensagem do assinante e o histórico da conversa para a API do OpenRouter.
    d.  Chama a API do OpenRouter com o modelo Venice: Uncensored (free).
    e.  Recebe a resposta do LLM.
    f.  Salva a nova interação (mensagem do assinante + resposta do LLM) no histórico do assinante no banco de dados.
    g.  Envia a resposta do LLM de volta para o frontend.
5.  O frontend exibe a resposta do chatbot ao assinante.

## 4. Considerações de Privacidade e Segurança

*   **Dados do Assinante:** Apenas o ID do assinante (do Patreon) e o histórico da conversa serão armazenados no banco de dados. Nenhuma informação pessoal sensível será solicitada ou armazenada.
*   **Chaves de API:** A chave da API do OpenRouter será armazenada com segurança nas variáveis de ambiente das funções serverless, nunca exposta no frontend.
*   **Autenticação:** Será implementado um mecanismo de autenticação simples para garantir que apenas assinantes do Patreon possam acessar o chatbot. Isso pode ser feito através de um token gerado após a verificação da assinatura ou um sistema de login básico.

## 5. Gerenciamento de Limites e Custos

*   **Gratuidade:** A arquitetura foi projetada para operar dentro dos limites das camadas gratuitas das plataformas escolhidas (Vercel, Supabase, OpenRouter).
*   **Monitoramento:** É recomendável monitorar o uso das APIs e dos serviços de banco de dados para garantir que os limites gratuitos não sejam excedidos. Caso o uso aumente significativamente, será necessário considerar a transição para planos pagos ou otimizar o uso de recursos.
*   **Tokens:** O limite de contexto de 32.768 tokens do modelo Venice é generoso. Para gerenciar isso com os usuários, pode-se informar que conversas muito longas podem levar o bot a "esquecer" partes iniciais, e oferecer uma opção de "limpar chat" para iniciar um novo contexto.

## Referências

[1] [Vercel](https://vercel.com/)
[2] [Netlify](https://www.netlify.com/)
[3] [GitHub Pages](https://pages.github.com/)
[4] [Vercel Functions](https://vercel.com/docs/functions)
[5] [Netlify Functions](https://docs.netlify.com/functions/overview/)
[6] [Cloudflare Workers](https://workers.cloudflare.com/)
[7] [Supabase](https://supabase.com/)
[8] [Firebase](https://firebase.google.com/)
[9] [PlanetScale](https://planetscale.com/)
[10] [OpenRouter - Venice: Uncensored (free)](https://openrouter.ai/venice/uncensored%3Afree)

