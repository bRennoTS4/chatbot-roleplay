# Chatbot Roleplay Imersivo

Um chatbot de roleplay imersivo para assinantes do Patreon, construído com React e funções serverless, integrado com a API do OpenRouter (modelo Venice: Uncensored).

## 🚀 Características

- **Interface Moderna**: Design responsivo com tema escuro elegante
- **Autenticação**: Sistema de login para assinantes do Patreon
- **IA Sem Censura**: Integração com modelo Venice: Uncensored via OpenRouter
- **Serverless**: Backend em funções serverless (Vercel Functions)
- **Gratuito**: Arquitetura projetada para operar dentro de limites gratuitos
- **Privacidade**: Conversas privadas por usuário

## 🛠️ Tecnologias

### Frontend
- React 18
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Lucide React Icons

### Backend
- Vercel Functions (Node.js)
- OpenRouter API
- Patreon API (para autenticação)

## 📋 Pré-requisitos

1. **Conta no OpenRouter**: [Criar conta](https://openrouter.ai/)
2. **API Key do OpenRouter**: [Obter chave](https://openrouter.ai/keys)
3. **Conta no Vercel**: [Criar conta](https://vercel.com/)
4. **Conta no Patreon** (para integração futura): [Patreon Developers](https://www.patreon.com/portal/registration/register-clients)

## 🚀 Configuração Local

### 1. Clone o repositório
```bash
git clone <seu-repositorio>
cd chatbot-roleplay
```

### 2. Instale as dependências
```bash
pnpm install
```

### 3. Configure as variáveis de ambiente
```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local` e adicione sua API key do OpenRouter:
```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

### 4. Execute o projeto localmente
```bash
pnpm run dev
```

O projeto estará disponível em `http://localhost:5173`

## 🌐 Deploy no Vercel

### 1. Conecte seu repositório ao Vercel
- Acesse [vercel.com](https://vercel.com/)
- Importe seu repositório do GitHub
- Configure as variáveis de ambiente

### 2. Configure as variáveis de ambiente no Vercel
No painel do Vercel, vá em Settings > Environment Variables e adicione:

```
OPENROUTER_API_KEY = sua_chave_do_openrouter
```

### 3. Deploy automático
O Vercel fará o deploy automaticamente a cada push para a branch principal.

## 🔧 Configuração da API do OpenRouter

### 1. Obtenha sua API Key
1. Acesse [OpenRouter](https://openrouter.ai/)
2. Crie uma conta
3. Vá em [API Keys](https://openrouter.ai/keys)
4. Gere uma nova chave

### 2. Modelo Utilizado
O projeto usa o modelo `cognitivecomputations/dolphin-mistral-24b-venice-edition:free`:
- **Gratuito**: $0/M tokens de entrada e saída
- **Sem Censura**: Projetado para conteúdo sem restrições
- **Contexto**: 32.768 tokens
- **Ideal para**: Roleplay imersivo

## 👥 Sistema de Autenticação

### Implementação Atual (Desenvolvimento)
- Tokens de teste aceitos: `test-token-123`, `premium-token-456`
- Validação básica implementada

### Implementação Futura (Produção)
- Integração com API do Patreon
- Verificação de assinatura ativa
- Diferentes níveis de acesso por tier

## 📁 Estrutura do Projeto

```
chatbot-roleplay/
├── api/                    # Funções serverless
│   ├── auth.js            # Autenticação de usuários
│   └── chat.js            # Processamento de mensagens
├── src/                   # Frontend React
│   ├── components/        # Componentes UI
│   ├── App.jsx           # Componente principal
│   └── main.jsx          # Ponto de entrada
├── public/               # Arquivos estáticos
├── vercel.json          # Configuração do Vercel
└── README.md           # Este arquivo
```

## 🔒 Segurança

- API keys armazenadas como variáveis de ambiente
- Validação de tokens no backend
- CORS configurado adequadamente
- Sanitização de entrada de dados

## 📊 Limites e Custos

### OpenRouter (Modelo Venice: Uncensored)
- **Entrada**: $0/M tokens (gratuito)
- **Saída**: $0/M tokens (gratuito)
- **Contexto**: 32.768 tokens por conversa

### Vercel
- **Funções**: 100GB-horas/mês (gratuito)
- **Bandwidth**: 100GB/mês (gratuito)
- **Execuções**: 1M/mês (gratuito)

## 🐛 Troubleshooting

### Erro: "Chave da API do OpenRouter não configurada"
- Verifique se a variável `OPENROUTER_API_KEY` está configurada
- No desenvolvimento: arquivo `.env.local`
- Na produção: painel do Vercel

### Erro: "Token inválido ou expirado"
- Use um dos tokens de teste: `test-token-123` ou `premium-token-456`
- Para produção: implemente integração com Patreon API

### Erro de CORS
- Verifique se as funções serverless estão configuradas corretamente
- Confirme que o domínio está correto no arquivo `api/chat.js`

## 🔄 Próximos Passos

1. **Integração com Patreon API** para autenticação real
2. **Banco de dados** para persistir histórico de conversas
3. **Sistema de tiers** com diferentes limites por nível
4. **Métricas e analytics** de uso
5. **Temas personalizáveis** para a interface

## 📝 Licença

Este projeto é privado e destinado apenas para uso pessoal do criador e seus assinantes do Patreon.

## 🤝 Suporte

Para suporte técnico ou dúvidas sobre o projeto, entre em contato através do Patreon.
