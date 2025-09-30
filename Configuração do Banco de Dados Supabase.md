# Configuração do Banco de Dados Supabase

Este guia explica como configurar o banco de dados Supabase para o Chatbot Roleplay.

## 📋 Pré-requisitos

- Conta no [Supabase](https://supabase.com/)
- Projeto criado no Supabase

## 🚀 Passo a Passo

### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com/)
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Escolha sua organização
5. Preencha os dados do projeto:
   - **Name**: `chatbot-roleplay`
   - **Database Password**: Gere uma senha segura
   - **Region**: Escolha a região mais próxima
6. Clique em "Create new project"

### 2. Executar Schema SQL

1. No painel do Supabase, vá para **SQL Editor**
2. Clique em "New query"
3. Copie todo o conteúdo do arquivo `schema.sql`
4. Cole no editor SQL
5. Clique em "Run" para executar

### 3. Configurar Variáveis de Ambiente

1. No painel do Supabase, vá para **Settings > API**
2. Copie as seguintes informações:

#### Para o Backend (Vercel):
```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
```

#### Para o Frontend:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui
```

### 4. Configurar no Vercel

1. No painel do Vercel, vá para **Settings > Environment Variables**
2. Adicione as seguintes variáveis:

| Nome | Valor | Ambiente |
|------|-------|----------|
| `SUPABASE_URL` | URL do seu projeto | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Service Role Key | Production, Preview, Development |
| `VITE_SUPABASE_URL` | URL do seu projeto | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | Anon Key | Production, Preview, Development |

### 5. Configurar Localmente

1. Copie o arquivo `.env.example` para `.env.local`:
```bash
cp .env.example .env.local
```

2. Edite o arquivo `.env.local` com suas credenciais:
```env
OPENROUTER_API_KEY=sua_openrouter_key
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key
```

## 🔒 Segurança e RLS

O schema inclui **Row Level Security (RLS)** configurado para:

- ✅ Usuários só podem ver seus próprios dados
- ✅ Conversas são privadas por usuário
- ✅ Mensagens são isoladas por usuário
- ✅ Tokens de acesso são seguros

## 📊 Limites do Plano Gratuito

O Supabase oferece um plano gratuito generoso:

| Recurso | Limite Gratuito |
|---------|-----------------|
| **Projetos** | 2 projetos |
| **Banco de Dados** | 500 MB |
| **Usuários Ativos** | 50.000/mês |
| **Requisições API** | Ilimitadas |
| **Armazenamento** | 1 GB |
| **Egress** | 5 GB/mês |

### Estimativas de Uso

Para um chatbot de roleplay:

- **1 usuário ativo**: ~1-5 MB/mês (mensagens + metadados)
- **100 usuários ativos**: ~100-500 MB/mês
- **1000 mensagens**: ~1-2 MB de armazenamento

O plano gratuito deve ser suficiente para **100-500 usuários ativos** mensais.

## 🛠️ Estrutura do Banco

### Tabelas Principais

1. **`users`**: Dados dos assinantes do Patreon
2. **`conversations`**: Sessões de chat
3. **`messages`**: Mensagens individuais
4. **`access_tokens`**: Tokens de autenticação
5. **`usage_stats`**: Estatísticas de uso

### Relacionamentos

```
users (1) ←→ (N) conversations
conversations (1) ←→ (N) messages
users (1) ←→ (N) access_tokens
users (1) ←→ (N) usage_stats
```

## 🔧 Funções Utilitárias

O schema inclui funções SQL úteis:

- `get_user_stats()`: Estatísticas de uso do usuário
- `cleanup_expired_tokens()`: Limpeza de tokens expirados
- `update_updated_at_column()`: Atualização automática de timestamps

## 📈 Monitoramento

### Verificar Uso do Banco

1. Vá para **Settings > Usage**
2. Monitore:
   - Database size
   - API requests
   - Active users
   - Egress

### Consultas Úteis

```sql
-- Verificar tamanho das tabelas
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Usuários mais ativos
SELECT 
  u.name,
  COUNT(m.id) as total_messages,
  SUM(m.tokens_used) as total_tokens
FROM users u
LEFT JOIN messages m ON u.id = m.user_id
GROUP BY u.id, u.name
ORDER BY total_messages DESC
LIMIT 10;

-- Estatísticas gerais
SELECT 
  COUNT(DISTINCT u.id) as total_users,
  COUNT(DISTINCT c.id) as total_conversations,
  COUNT(m.id) as total_messages,
  SUM(m.tokens_used) as total_tokens
FROM users u
LEFT JOIN conversations c ON u.id = c.user_id
LEFT JOIN messages m ON c.id = m.conversation_id;
```

## 🚨 Troubleshooting

### Erro: "relation does not exist"
- Verifique se o schema SQL foi executado corretamente
- Confirme que está conectado ao projeto correto

### Erro: "RLS policy violation"
- Verifique se as políticas RLS estão configuradas
- Confirme que o usuário está autenticado corretamente

### Erro: "Invalid API key"
- Verifique se as chaves estão corretas no `.env.local`
- Confirme que está usando a Service Role Key no backend

### Performance Lenta
- Verifique se os índices foram criados
- Monitore o uso de CPU/RAM no painel do Supabase
- Considere otimizar consultas complexas

## 📞 Suporte

Para problemas específicos do Supabase:
- [Documentação oficial](https://supabase.com/docs)
- [Discord da comunidade](https://discord.supabase.com/)
- [GitHub Issues](https://github.com/supabase/supabase/issues)
