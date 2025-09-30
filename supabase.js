// Configuração do cliente Supabase
import { createClient } from '@supabase/supabase-js'

// URLs e chaves do Supabase (configurar nas variáveis de ambiente)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

// Criar cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
})

// Funções utilitárias para o banco de dados

/**
 * Buscar ou criar usuário baseado no Patreon ID
 */
export async function findOrCreateUser(patreonData) {
  try {
    // Primeiro, tentar encontrar o usuário existente
    const { data: existingUser, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('patreon_id', patreonData.patreon_id)
      .single()

    if (existingUser && !findError) {
      // Atualizar último login
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', existingUser.id)
      
      return { data: existingUser, error: null }
    }

    // Se não encontrou, criar novo usuário
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([{
        patreon_id: patreonData.patreon_id,
        name: patreonData.name,
        email: patreonData.email,
        tier: patreonData.tier || 'basic',
        subscription_status: patreonData.subscription_status || 'active',
        subscription_expires_at: patreonData.subscription_expires_at,
        last_login: new Date().toISOString()
      }])
      .select()
      .single()

    return { data: newUser, error: createError }
  } catch (error) {
    console.error('Erro ao buscar/criar usuário:', error)
    return { data: null, error }
  }
}

/**
 * Buscar conversas do usuário
 */
export async function getUserConversations(userId, limit = 50) {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        id,
        title,
        created_at,
        updated_at,
        is_active,
        messages (
          id,
          content,
          sender,
          created_at
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(limit)

    return { data, error }
  } catch (error) {
    console.error('Erro ao buscar conversas:', error)
    return { data: null, error }
  }
}

/**
 * Criar nova conversa
 */
export async function createConversation(userId, title = null) {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .insert([{
        user_id: userId,
        title: title || `Conversa ${new Date().toLocaleDateString()}`
      }])
      .select()
      .single()

    return { data, error }
  } catch (error) {
    console.error('Erro ao criar conversa:', error)
    return { data: null, error }
  }
}

/**
 * Buscar mensagens de uma conversa
 */
export async function getConversationMessages(conversationId, limit = 100) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(limit)

    return { data, error }
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error)
    return { data: null, error }
  }
}

/**
 * Salvar nova mensagem
 */
export async function saveMessage(conversationId, userId, content, sender, tokensUsed = 0, metadata = {}) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([{
        conversation_id: conversationId,
        user_id: userId,
        content,
        sender,
        tokens_used: tokensUsed,
        metadata
      }])
      .select()
      .single()

    // Atualizar timestamp da conversa
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId)

    return { data, error }
  } catch (error) {
    console.error('Erro ao salvar mensagem:', error)
    return { data: null, error }
  }
}

/**
 * Atualizar estatísticas de uso
 */
export async function updateUsageStats(userId, messagesCount = 1, tokensUsed = 0, newConversation = false) {
  try {
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

    const { data, error } = await supabase
      .from('usage_stats')
      .upsert([{
        user_id: userId,
        date: today,
        messages_sent: messagesCount,
        tokens_used: tokensUsed,
        conversations_started: newConversation ? 1 : 0
      }], {
        onConflict: 'user_id,date',
        ignoreDuplicates: false
      })
      .select()

    return { data, error }
  } catch (error) {
    console.error('Erro ao atualizar estatísticas:', error)
    return { data: null, error }
  }
}

/**
 * Buscar estatísticas do usuário
 */
export async function getUserStats(userId, daysBack = 30) {
  try {
    const { data, error } = await supabase
      .rpc('get_user_stats', {
        user_uuid: userId,
        days_back: daysBack
      })

    return { data: data?.[0] || null, error }
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return { data: null, error }
  }
}

/**
 * Validar e buscar token de acesso
 */
export async function validateAccessToken(tokenHash) {
  try {
    const { data, error } = await supabase
      .from('access_tokens')
      .select(`
        id,
        user_id,
        expires_at,
        is_active,
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
      .single()

    if (data) {
      // Atualizar último uso do token
      await supabase
        .from('access_tokens')
        .update({ last_used: new Date().toISOString() })
        .eq('id', data.id)
    }

    return { data, error }
  } catch (error) {
    console.error('Erro ao validar token:', error)
    return { data: null, error }
  }
}

/**
 * Criar token de acesso
 */
export async function createAccessToken(userId, tokenHash, expiresInDays = 30) {
  try {
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiresInDays)

    const { data, error } = await supabase
      .from('access_tokens')
      .insert([{
        user_id: userId,
        token_hash: tokenHash,
        expires_at: expiresAt.toISOString()
      }])
      .select()
      .single()

    return { data, error }
  } catch (error) {
    console.error('Erro ao criar token:', error)
    return { data: null, error }
  }
}
