#!/bin/bash

# Script de Deploy Automatizado para o Chatbot Roleplay
# Execute este script para fazer deploy no Vercel

set -e  # Parar em caso de erro

echo "🚀 Iniciando deploy do Chatbot Roleplay..."

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script na raiz do projeto"
    exit 1
fi

# Verificar se o Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "📦 Instalando Vercel CLI..."
    npm install -g vercel
fi

# Fazer build do projeto
echo "🔨 Fazendo build do projeto..."
pnpm run build

# Verificar se o build foi bem-sucedido
if [ ! -d "dist" ]; then
    echo "❌ Erro: Build falhou - diretório dist não encontrado"
    exit 1
fi

echo "✅ Build concluído com sucesso!"

# Fazer deploy
echo "🌐 Fazendo deploy no Vercel..."
vercel --prod

echo ""
echo "🎉 Deploy concluído!"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure as variáveis de ambiente no painel do Vercel:"
echo "   - OPENROUTER_API_KEY"
echo "   - SUPABASE_URL"
echo "   - SUPABASE_SERVICE_ROLE_KEY"
echo "   - VITE_SUPABASE_URL"
echo "   - VITE_SUPABASE_ANON_KEY"
echo ""
echo "2. Configure o banco de dados Supabase seguindo o guia em database/SETUP.md"
echo ""
echo "3. Teste o chatbot com os tokens:"
echo "   - test-token-123 (usuário básico)"
echo "   - premium-token-456 (usuário premium)"
echo ""
echo "✨ Seu chatbot está pronto para uso!"
