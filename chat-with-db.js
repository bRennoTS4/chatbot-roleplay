// Função serverless para processar mensagens do chat com integração ao banco de dados
// Versão atualizada que integra com Supabase

import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

let supabase = null

// Inicializar cliente Supabase (apenas no servidor)
if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { message, conversationId, userToken } = req.body;

    // Validar dados de entrada
    if (!message || !userToken) {
      return res.status(400).json({ error: 'Mensagem e token são obrigatórios' });
    }

    // Validar token e obter dados do usuário
    const userValidation = await validateUserToken(userToken);
    if (!userValidation.valid) {
      return res.status(401).json({ error: userValidation.error });
    }

    const user = userValidation.user;

    // Gerenciar conversa
    let currentConversationId = conversationId;
    if (!currentConversationId) {
      // Criar nova conversa se não existir
      const newConversation = await createNewConversation(user.id);
      if (!newConversation) {
        return res.status(500).json({ error: 'Erro ao criar conversa' });
      }
      currentConversationId = newConversation.id;
    }

    // Buscar histórico da conversa
    const conversationHistory = await getConversationHistory(currentConversationId);

    // Salvar mensagem do usuário
    await saveUserMessage(currentConversationId, user.id, message);

    // Preparar mensagens para a API
    const messages = formatMessagesForAPI(conversationHistory, message);

    // Chamar a API do OpenRouter
    const apiResponse = await callOpenRouterAPI(messages);

    // Salvar resposta do bot
    await saveBotMessage(
      currentConversationId, 
      user.id, 
      apiResponse.content, 
      apiResponse.usage?.total_tokens || 0
    );

    // Atualizar estatísticas de uso
    await updateUserStats(user.id, apiResponse.usage?.total_tokens || 0);

    // Retornar resposta
    return res.status(200).json({
      success: true,
      response: apiResponse.content,
      conversationId: currentConversationId,
      timestamp: new Date().toISOString(),
      tokensUsed: apiResponse.usage?.total_tokens || 0
    });

  } catch (error) {
    console.error('Erro no processamento do chat:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Função para validar token do usuário
async function validateUserToken(token) {
  // Implementação básica para desenvolvimento
  const validTokens = {
    'test-token-123': {
      id: 'user_123',
      patreon_id: 'test_user_123',
      name: 'Usuário Teste',
      tier: 'basic'
    },
    'premium-token-456': {
      id: 'user_456',
      patreon_id: 'premium_user_456',
      name: 'Usuário Premium',
      tier: 'premium'
    }
  };

  if (validTokens[token]) {
    return { valid: true, user: validTokens[token] };
  }

  // Se Supabase estiver configurado, validar no banco
  if (supabase) {
    try {
      const tokenHash = hashToken(token);
      const { data, error } = await supabase
        .from('access_tokens')
        .select(`
          id,
          user_id,
          expires_at,
          users (
            id,
            patreon_id,
            name,
            tier,
            subscription_status
          )
        `)
        .eq('token_hash', tokenHash)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (data && !error) {
        return { valid: true, user: data.users };
      }
    } catch (error) {
      console.error('Erro ao validar token no banco:', error);
    }
  }

  return { valid: false, error: 'Token inválido ou expirado' };
}

// Função para criar nova conversa
async function createNewConversation(userId) {
  if (!supabase) {
    // Retornar ID simulado se banco não estiver configurado
    return { id: `conv_${Date.now()}` };
  }

  try {
    const { data, error } = await supabase
      .from('conversations')
      .insert([{
        user_id: userId,
        title: `Conversa ${new Date().toLocaleDateString()}`
      }])
      .select()
      .single();

    return error ? null : data;
  } catch (error) {
    console.error('Erro ao criar conversa:', error);
    return null;
  }
}

// Função para buscar histórico da conversa
async function getConversationHistory(conversationId) {
  if (!supabase) {
    return []; // Retornar array vazio se banco não estiver configurado
  }

  try {
    const { data, error } = await supabase
      .from('messages')
      .select('content, sender, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(50); // Limitar a 50 mensagens recentes

    return error ? [] : data;
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    return [];
  }
}

// Função para salvar mensagem do usuário
async function saveUserMessage(conversationId, userId, content) {
  if (!supabase) return;

  try {
    await supabase
      .from('messages')
      .insert([{
        conversation_id: conversationId,
        user_id: userId,
        content,
        sender: 'user'
      }]);
  } catch (error) {
    console.error('Erro ao salvar mensagem do usuário:', error);
  }
}

// Função para salvar mensagem do bot
async function saveBotMessage(conversationId, userId, content, tokensUsed) {
  if (!supabase) return;

  try {
    await supabase
      .from('messages')
      .insert([{
        conversation_id: conversationId,
        user_id: userId,
        content,
        sender: 'bot',
        tokens_used: tokensUsed,
        metadata: {
          model: 'cognitivecomputations/dolphin-mistral-24b-venice-edition:free',
          timestamp: new Date().toISOString()
        }
      }]);

    // Atualizar timestamp da conversa
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);
  } catch (error) {
    console.error('Erro ao salvar mensagem do bot:', error);
  }
}

// Função para atualizar estatísticas do usuário
async function updateUserStats(userId, tokensUsed) {
  if (!supabase) return;

  try {
    const today = new Date().toISOString().split('T')[0];

    // Usar upsert para incrementar ou criar estatísticas do dia
    const { data: existingStats } = await supabase
      .from('usage_stats')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    if (existingStats) {
      // Atualizar estatísticas existentes
      await supabase
        .from('usage_stats')
        .update({
          messages_sent: existingStats.messages_sent + 1,
          tokens_used: existingStats.tokens_used + tokensUsed
        })
        .eq('id', existingStats.id);
    } else {
      // Criar novas estatísticas
      await supabase
        .from('usage_stats')
        .insert([{
          user_id: userId,
          date: today,
          messages_sent: 1,
          tokens_used: tokensUsed
        }]);
    }
  } catch (error) {
    console.error('Erro ao atualizar estatísticas:', error);
  }
}

// Função para formatar mensagens para a API
function formatMessagesForAPI(history, newMessage) {
  const messages = [];

  // Mensagem de sistema
  messages.push({
    role: 'system',
    content: `Você é um assistente de roleplay imersivo e criativo. Sua função é:

1. Participar de roleplays de qualquer gênero (fantasia, ficção científica, histórico, moderno, etc.)
2. Criar personagens convincentes e envolventes
3. Manter consistência narrativa ao longo da conversa
4. Adaptar-se ao tom e estilo desejado pelo usuário
5. Ser criativo e detalhado nas descrições
6. Respeitar os limites e preferências do usuário

Você pode interpretar qualquer tipo de personagem e cenário. Seja expressivo, detalhado e mantenha o roleplay interessante e imersivo.`
  });

  // Adicionar histórico
  history.forEach(msg => {
    messages.push({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.content
    });
  });

  // Adicionar nova mensagem
  messages.push({
    role: 'user',
    content: newMessage
  });

  return messages;
}

// Função para chamar a API do OpenRouter
async function callOpenRouterAPI(messages) {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  
  if (!OPENROUTER_API_KEY) {
    throw new Error('Chave da API do OpenRouter não configurada');
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://chatbot-roleplay.vercel.app',
      'X-Title': 'Chatbot Roleplay Imersivo'
    },
    body: JSON.stringify({
      model: 'cognitivecomputations/dolphin-mistral-24b-venice-edition:free',
      messages: messages,
      max_tokens: 1000,
      temperature: 0.8,
      top_p: 0.9,
      frequency_penalty: 0.1,
      presence_penalty: 0.1
    })
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Erro na API do OpenRouter: ${response.status} - ${errorData}`);
  }

  const data = await response.json();
  
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error('Resposta inválida da API do OpenRouter');
  }

  return {
    content: data.choices[0].message.content,
    usage: data.usage
  };
}

// Função auxiliar para hash de token (implementação básica)
function hashToken(token) {
  // Em produção, usar uma biblioteca de hash segura como bcrypt
  return Buffer.from(token).toString('base64');
}
