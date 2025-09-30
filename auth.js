// Função serverless para autenticação de assinantes do Patreon

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
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token é obrigatório' });
    }

    // Validar token com a API do Patreon
    const isValid = await validatePatreonToken(token);

    if (!isValid.valid) {
      return res.status(401).json({ 
        error: 'Token inválido ou assinatura inativa',
        details: isValid.reason
      });
    }

    // Retornar informações do usuário autenticado
    return res.status(200).json({
      success: true,
      user: {
        id: isValid.user.id,
        name: isValid.user.name,
        tier: isValid.user.tier,
        validUntil: isValid.user.validUntil
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro na autenticação:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Função para validar token com a API do Patreon
async function validatePatreonToken(token) {
  // IMPLEMENTAÇÃO BÁSICA - Em produção, integrar com API real do Patreon
  
  // Para desenvolvimento/demonstração, aceitar tokens específicos
  const validTokens = {
    'test-token-123': {
      id: 'user_123',
      name: 'Usuário Teste',
      tier: 'basic',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 dias
    },
    'premium-token-456': {
      id: 'user_456',
      name: 'Usuário Premium',
      tier: 'premium',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  };

  if (validTokens[token]) {
    return {
      valid: true,
      user: validTokens[token]
    };
  }

  // Em produção, implementar validação real com Patreon API:
  /*
  try {
    const response = await fetch('https://www.patreon.com/api/oauth2/v2/identity', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      return { valid: false, reason: 'Token inválido' };
    }

    const userData = await response.json();
    
    // Verificar se o usuário tem assinatura ativa
    const hasActiveSubscription = await checkPatreonSubscription(userData.data.id);
    
    if (!hasActiveSubscription) {
      return { valid: false, reason: 'Assinatura inativa' };
    }

    return {
      valid: true,
      user: {
        id: userData.data.id,
        name: userData.data.attributes.full_name,
        tier: hasActiveSubscription.tier,
        validUntil: hasActiveSubscription.validUntil
      }
    };

  } catch (error) {
    console.error('Erro ao validar com Patreon:', error);
    return { valid: false, reason: 'Erro na validação' };
  }
  */

  return { valid: false, reason: 'Token não reconhecido' };
}

// Função auxiliar para verificar assinatura ativa (para implementação futura)
async function checkPatreonSubscription(userId) {
  // Implementar verificação de assinatura ativa
  // Retornar informações sobre o tier e validade
  return null;
}
