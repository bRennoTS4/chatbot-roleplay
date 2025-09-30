// Função serverless para processar mensagens do chat
// Integra com OpenRouter API (Venice: Uncensored model)

export default async function handler(req, res) {
  // Configurar CORS para permitir requisições do frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Responder a requisições OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Apenas aceitar requisições POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { message, history, userToken } = req.body;

    // Validar dados de entrada
    if (!message || !userToken) {
      return res.status(400).json({ error: 'Mensagem e token são obrigatórios' });
    }

    // Validar token do usuário (implementação básica)
    // Em produção, isso deveria verificar com a API do Patreon
    if (!isValidPatreonToken(userToken)) {
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }

    // Preparar o histórico da conversa para o modelo
    const messages = formatMessagesForAPI(history || [], message);

    // Chamar a API do OpenRouter
    const response = await callOpenRouterAPI(messages);

    // Retornar a resposta do modelo
    return res.status(200).json({
      success: true,
      response: response.content,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro no processamento do chat:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Função para validar token do Patreon
function isValidPatreonToken(token) {
  // Implementação básica - em produção, verificar com API do Patreon
  // Por enquanto, aceitar qualquer token não vazio
  return token && token.length > 0;
}

// Função para formatar mensagens para a API do OpenRouter
function formatMessagesForAPI(history, newMessage) {
  const messages = [];

  // Adicionar mensagem de sistema para definir o comportamento do bot
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

  // Adicionar histórico da conversa
  if (history && history.length > 0) {
    history.forEach(msg => {
      if (msg.sender === 'user') {
        messages.push({
          role: 'user',
          content: msg.text
        });
      } else if (msg.sender === 'bot') {
        messages.push({
          role: 'assistant',
          content: msg.text
        });
      }
    });
  }

  // Adicionar nova mensagem do usuário
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
      'HTTP-Referer': 'https://chatbot-roleplay.vercel.app', // Seu domínio
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
