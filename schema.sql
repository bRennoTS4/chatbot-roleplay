-- Schema do banco de dados para o Chatbot Roleplay
-- Execute este script no SQL Editor do Supabase

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patreon_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    tier VARCHAR(50) NOT NULL DEFAULT 'basic',
    subscription_status VARCHAR(50) NOT NULL DEFAULT 'active',
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Tabela de conversas
CREATE TABLE IF NOT EXISTS conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Tabela de mensagens
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    sender VARCHAR(10) NOT NULL CHECK (sender IN ('user', 'bot')),
    tokens_used INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Tabela de tokens de acesso
CREATE TABLE IF NOT EXISTS access_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- Tabela de estatísticas de uso
CREATE TABLE IF NOT EXISTS usage_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    messages_sent INTEGER DEFAULT 0,
    tokens_used INTEGER DEFAULT 0,
    conversations_started INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_users_patreon_id ON users(patreon_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_active ON conversations(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_access_tokens_hash ON access_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_access_tokens_user_active ON access_tokens(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_usage_stats_user_date ON usage_stats(user_id, date);

-- Função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at 
    BEFORE UPDATE ON conversations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para limpar tokens expirados (executar periodicamente)
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS void AS $$
BEGIN
    DELETE FROM access_tokens 
    WHERE expires_at < NOW() OR is_active = false;
END;
$$ language 'plpgsql';

-- Função para obter estatísticas do usuário
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID, days_back INTEGER DEFAULT 30)
RETURNS TABLE (
    total_messages INTEGER,
    total_tokens INTEGER,
    total_conversations INTEGER,
    avg_messages_per_day NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(us.messages_sent), 0)::INTEGER as total_messages,
        COALESCE(SUM(us.tokens_used), 0)::INTEGER as total_tokens,
        COALESCE(SUM(us.conversations_started), 0)::INTEGER as total_conversations,
        COALESCE(AVG(us.messages_sent), 0)::NUMERIC as avg_messages_per_day
    FROM usage_stats us
    WHERE us.user_id = user_uuid 
    AND us.date >= CURRENT_DATE - INTERVAL '%d days' % days_back;
END;
$$ language 'plpgsql';

-- Políticas de segurança RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_stats ENABLE ROW LEVEL SECURITY;

-- Políticas para usuários (apenas seus próprios dados)
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Políticas para conversas
CREATE POLICY "Users can view own conversations" ON conversations
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create own conversations" ON conversations
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own conversations" ON conversations
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Políticas para mensagens
CREATE POLICY "Users can view own messages" ON messages
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create own messages" ON messages
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Políticas para tokens de acesso
CREATE POLICY "Users can view own tokens" ON access_tokens
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Políticas para estatísticas
CREATE POLICY "Users can view own stats" ON usage_stats
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Inserir dados de exemplo para desenvolvimento
INSERT INTO users (patreon_id, name, email, tier) VALUES 
('test_user_123', 'Usuário Teste', 'teste@exemplo.com', 'basic'),
('premium_user_456', 'Usuário Premium', 'premium@exemplo.com', 'premium')
ON CONFLICT (patreon_id) DO NOTHING;

-- Comentários para documentação
COMMENT ON TABLE users IS 'Tabela de usuários assinantes do Patreon';
COMMENT ON TABLE conversations IS 'Tabela de conversas/sessões de chat';
COMMENT ON TABLE messages IS 'Tabela de mensagens individuais';
COMMENT ON TABLE access_tokens IS 'Tabela de tokens de acesso para autenticação';
COMMENT ON TABLE usage_stats IS 'Tabela de estatísticas de uso por usuário/dia';

COMMENT ON COLUMN users.tier IS 'Nível da assinatura: basic, premium, vip';
COMMENT ON COLUMN users.subscription_status IS 'Status da assinatura: active, paused, cancelled';
COMMENT ON COLUMN messages.sender IS 'Remetente da mensagem: user ou bot';
COMMENT ON COLUMN messages.tokens_used IS 'Número de tokens consumidos para esta mensagem';
COMMENT ON COLUMN messages.metadata IS 'Dados adicionais em formato JSON (modelo usado, parâmetros, etc.)';
