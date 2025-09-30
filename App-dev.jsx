// Versão de desenvolvimento do App.jsx que funciona sem backend
// Use esta versão para testes locais quando as funções serverless não estiverem disponíveis

import { useState, useEffect, useRef } from 'react'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Card, CardContent } from './components/ui/card'
import { MessageCircle, Send, LogOut, Trash2, LogIn, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userToken, setUserToken] = useState('')
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleLogin = async () => {
    if (!userToken.trim()) return

    setIsLoading(true)

    try {
      // Simulação de autenticação para desenvolvimento
      await new Promise(resolve => setTimeout(resolve, 1000))

      const validTokens = {
        'test-token-123': 'Usuário Teste',
        'premium-token-456': 'Usuário Premium'
      }

      if (validTokens[userToken]) {
        setIsAuthenticated(true)
        setMessages([{
          id: Date.now(),
          text: `Olá, ${validTokens[userToken]}! Bem-vindo ao seu chatbot de roleplay imersivo. Como posso ajudá-lo hoje?`,
          sender: 'bot',
          timestamp: new Date()
        }])
      } else {
        throw new Error('Token inválido. Use "test-token-123" ou "premium-token-456"')
      }
    } catch (error) {
      console.error('Erro no login:', error)
      alert(`Erro na autenticação: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUserToken('')
    setMessages([])
  }

  const clearChat = () => {
    setMessages([{
      id: Date.now(),
      text: "Olá! Bem-vindo ao seu chatbot de roleplay imersivo. Como posso ajudá-lo hoje?",
      sender: 'bot',
      timestamp: new Date()
    }])
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const currentMessage = inputMessage
    setInputMessage('')
    setIsLoading(true)
    setIsTyping(true)

    try {
      // Simulação de resposta da IA para desenvolvimento
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Respostas simuladas baseadas no contexto
      const responses = [
        "Que interessante! Vamos explorar essa história juntos. *ajusta o capuz e se inclina para frente* Conte-me mais sobre o que você tem em mente para nossa aventura.",
        "*Os olhos brilham com curiosidade* Essa é uma proposta fascinante! Posso sentir a magia no ar. Que tipo de personagem você gostaria que eu interpretasse nesta jornada?",
        "Perfeito! *esfrega as mãos animadamente* Adoro um bom roleplay. Vamos criar uma história memorável! Qual será o cenário da nossa aventura?",
        "*sorri misteriosamente* Ah, um novo capítulo se inicia! Estou pronto para mergulhar neste mundo que você está criando. Que atmosfera devemos estabelecer?",
        "Excelente escolha! *se posiciona confortavelmente* Sinto que esta será uma experiência única. Vamos dar vida a estes personagens e ver onde a história nos leva!"
      ]

      const randomResponse = responses[Math.floor(Math.random() * responses.length)]

      const botResponse = {
        id: Date.now() + 1,
        text: randomResponse,
        sender: 'bot',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, botResponse])
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      const errorMessage = {
        id: Date.now() + 1,
        text: `Desculpe, ocorreu um erro: ${error.message}. Tente novamente.`,
        sender: 'bot',
        timestamp: new Date(),
        isError: true
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <MessageCircle className="w-8 h-8 text-white" />
              </motion.div>
              
              <h1 className="text-2xl font-bold text-white mb-2">Chatbot Roleplay</h1>
              <p className="text-gray-300 mb-6">Entre com seu token de assinante para acessar a experiência imersiva</p>
              
              <div className="space-y-4">
                <Input
                  type="password"
                  placeholder="Token de Assinante do Patreon"
                  value={userToken}
                  onChange={(e) => setUserToken(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
              <Button 
                onClick={handleLogin} 
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                disabled={!userToken.trim() || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4 mr-2" />
                )}
                {isLoading ? 'Autenticando...' : 'Entrar'}
              </Button>
              <p className="text-xs text-gray-400 text-center mt-4">
                Apenas assinantes do Patreon têm acesso a este chatbot
              </p>
              <p className="text-xs text-yellow-400 text-center mt-2">
                <strong>Modo Desenvolvimento:</strong> Use "test-token-123" ou "premium-token-456"
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex flex-col">
      {/* Header */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-black/20 backdrop-blur-lg border-b border-white/10 p-4"
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-semibold">Chatbot Roleplay</h1>
              <p className="text-gray-400 text-sm">Experiência Imersiva</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 bg-green-500/20 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm">Online</span>
            </div>
            <Button
              onClick={clearChat}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto h-full flex flex-col p-4">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                      : message.isError
                      ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                      : 'bg-white/10 text-gray-100 backdrop-blur-lg border border-white/20'
                  }`}>
                    <div className="flex items-start space-x-2">
                      {message.sender === 'bot' && (
                        <div className="w-6 h-6 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <MessageCircle className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm leading-relaxed">{message.text}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 px-4 py-3 rounded-2xl">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                      <MessageCircle className="w-3 h-3 text-white" />
                    </div>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4"
          >
            <div className="flex space-x-3">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                className="flex-1 bg-transparent border-none text-white placeholder:text-gray-400 focus:ring-0"
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl px-6"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Pressione Enter para enviar • Shift+Enter para nova linha
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default App
