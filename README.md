# 🚀 Guia Completo de Deploy - Chatbot Roleplay

- Este guia fornece instruções passo a passo para fazer o deploy completo do seu chatbot de roleplay imersivo.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter:

- **Conta GitHub** com repositório criado
- **Conta OpenRouter** com API key ativa
- **Conta Supabase** (opcional, mas recomendado)
- **Conta Vercel** para deploy

## 🔧 Configuração das APIs

### 1. OpenRouter (Obrigatório)

1. Acesse [OpenRouter](https://openrouter.ai/)
2. Crie uma conta ou faça login
3. Vá para [API Keys](https://openrouter.ai/keys)
4. Clique em "Create Key"
5. Copie a chave gerada (formato: `sk-or-v1-...`)

### 2. Supabase (Recomendado para Produção)

1. Acesse [Supabase](https://supabase.com/)
2. Crie uma conta ou faça login
3. Clique em "New Project"
4. Configure:
   - **Name**: `chatbot-roleplay`
   - **Database Password**: Senha segura
   - **Region**: Mais próxima de você
5. Aguarde a criação (2-3 minutos)
6. Vá para **SQL Editor** e execute o conteúdo de `database/schema.sql`
7. Anote as credenciais em **Settings > API**:
   - **URL**: `https://seu-projeto.supabase.co`
   - **Anon Key**: `eyJ...` (chave pública)
   - **Service Role Key**: `eyJ...` (chave privada)

## 📁 Preparação do Repositório

### 1. Subir Código para GitHub

```bash
# Inicializar repositório (se ainda não fez)
git init
git add .
git commit -m "Initial commit: Chatbot Roleplay completo"

# Conectar com GitHub
git remote add origin https://github.com/seu-usuario/chatbot-roleplay.git
git branch -M main
git push -u origin main
```

### 2. Estrutura Final do Projeto

Verifique se sua estrutura está assim:

```
chatbot-roleplay/
├── api/
│   ├── auth.js
│   ├── chat.js
│   └── chat-with-db.js
├── database/
│   ├── schema.sql
│   └── SETUP.md
├── src/
│   ├── components/
│   ├── lib/
│   │   └── supabase.js
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── vercel.json
├── package.json
├── deploy.sh
└── README.md
```

## 🌐 Deploy no Vercel

### 1. Conectar Repositório

1. Acesse [Vercel](https://vercel.com/)
2. Faça login com GitHub
3. Clique em "New Project"
4. Selecione seu repositório `chatbot-roleplay`
5. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (raiz)
   - **Build Command**: `pnpm run build`
   - **Output Directory**: `dist`

### 2. Configurar Variáveis de Ambiente

No painel do Vercel, vá para **Settings > Environment Variables** e adicione:

#### Variáveis Obrigatórias:
| Nome | Valor | Ambiente |
|------|-------|----------|
| `OPENROUTER_API_KEY` | `sk-or-v1-...` | Production, Preview, Development |

#### Variáveis para Supabase (Opcional):
| Nome | Valor | Ambiente |
|------|-------|----------|
| `SUPABASE_URL` | `https://seu-projeto.supabase.co` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` (Service Role) | Production, Preview, Development |
| `VITE_SUPABASE_URL` | `https://seu-projeto.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` (Anon Key) | Production, Preview, Development |

### 3. Deploy

1. Clique em "Deploy"
2. Aguarde o build (2-5 minutos)
3. Acesse a URL fornecida pelo Vercel

## ✅ Teste da Aplicação

### 1. Tokens de Teste

Use estes tokens para testar:
- **Básico**: `test-token-123`
- **Premium**: `premium-token-456`

### 2. Fluxo de Teste

1. **Acesse a URL** do seu deploy
2. **Insira um token** de teste
3. **Clique em "Entrar"**
4. **Envie uma mensagem** de roleplay
5. **Verifique a resposta** da IA

### 3. Verificações

- [ ] Login funciona com tokens de teste
- [ ] Mensagens são enviadas e respondidas
- [ ] Interface é responsiva (mobile/desktop)
- [ ] Não há erros no console do navegador

## 🔧 Troubleshooting

### Problema: "Erro na autenticação"

**Causa**: API key do OpenRouter inválida ou não configurada

**Solução**:
1. Verifique se `OPENROUTER_API_KEY` está configurada no Vercel
2. Confirme que a chave está correta (formato `sk-or-v1-...`)
3. Teste a chave diretamente na [documentação do OpenRouter](https://openrouter.ai/docs)

### Problema: "Erro interno do servidor"

**Causa**: Função serverless com erro

**Solução**:
1. Vá para **Vercel > Functions** e verifique os logs
2. Procure por erros nas funções `api/auth.js` e `api/chat.js`
3. Verifique se todas as variáveis de ambiente estão configuradas

### Problema: "Token inválido"

**Causa**: Usando token incorreto

**Solução**:
1. Use exatamente: `test-token-123` ou `premium-token-456`
2. Não adicione espaços antes ou depois
3. Verifique se não há caracteres especiais

### Problema: Interface não carrega

**Causa**: Build falhou ou arquivos não encontrados

**Solução**:
1. Verifique o log de build no Vercel
2. Confirme que `dist/` foi gerado corretamente
3. Teste o build localmente: `pnpm run build && pnpm run preview`

### Problema: Respostas muito lentas

**Causa**: Timeout ou limite de API atingido

**Solução**:
1. Verifique se não atingiu o limite do OpenRouter
2. Considere usar um modelo pago para melhor performance
3. Ajuste o `maxDuration` no `vercel.json`

## 🎯 Configuração para Produção Real

### 1. Integração com Patreon

Para usar com assinantes reais do Patreon:

1. **Crie uma aplicação** no [Patreon Developers](https://www.patreon.com/portal/registration/register-clients)
2. **Configure OAuth** com redirect para seu domínio
3. **Substitua a validação** em `api/auth.js` pela API real do Patreon
4. **Implemente webhooks** para atualizar status de assinatura

### 2. Domínio Personalizado

1. No Vercel, vá para **Settings > Domains**
2. Adicione seu domínio personalizado
3. Configure DNS conforme instruções
4. Aguarde propagação (até 24h)

### 3. Monitoramento

Configure alertas para:
- **Uso de API**: Monitore consumo do OpenRouter
- **Banco de dados**: Acompanhe crescimento do Supabase
- **Uptime**: Use serviços como UptimeRobot
- **Erros**: Configure notificações no Vercel

## 📊 Limites e Custos

### Plano Gratuito (Estimativas)

| Serviço | Limite | Usuários Suportados |
|---------|--------|-------------------|
| **Vercel** | 100GB-h/mês | ~1000 usuários ativos |
| **OpenRouter** | Modelo gratuito | Ilimitado* |
| **Supabase** | 500MB DB | ~100-500 usuários |

*\*Sujeito a fair usage policy*

### Quando Considerar Upgrade

- **Vercel Pro** ($20/mês): Mais funções e bandwidth
- **OpenRouter Paid**: Modelos mais avançados e rápidos
- **Supabase Pro** ($25/mês): Mais storage e recursos

## 🔄 Atualizações e Manutenção

### Deploy Automático

Configurado! Cada push para `main` faz deploy automático.

### Backup de Dados

Se usando Supabase:
```bash
# Instalar CLI do Supabase
npm install -g supabase

# Fazer backup
supabase db dump --db-url "postgresql://..." > backup.sql
```

### Monitoramento de Logs

1. **Vercel**: Functions > View Function Logs
2. **Supabase**: Logs & reports
3. **OpenRouter**: Dashboard de uso

## 🎉 Próximos Passos

Após o deploy bem-sucedido:

1. **Teste extensivamente** com diferentes cenários
2. **Colete feedback** dos primeiros usuários
3. **Monitore métricas** de uso e performance
4. **Planeje melhorias** baseadas no uso real
5. **Configure backup** e procedimentos de emergência

## 📞 Suporte

Para problemas específicos:

- **Vercel**: [Documentação](https://vercel.com/docs) | [Discord](https://vercel.com/discord)
- **OpenRouter**: [Docs](https://openrouter.ai/docs) | [Discord](https://discord.gg/openrouter)
- **Supabase**: [Docs](https://supabase.com/docs) | [Discord](https://discord.supabase.com/)

---

**🚀 Parabéns! Seu chatbot de roleplay está no ar!**
