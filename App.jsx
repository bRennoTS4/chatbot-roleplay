import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { ScrollArea } from '@/components/ui/scroll-area.jsx'
import { Send, MessageCircle, User, Bot, Loader2, Trash2, LogIn, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import './App.css'

function App() {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userToken, setUserToken] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleLogin = async () => {
    if (!userToken.trim()) return

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: userToken
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro na autenticação')
      }

      setIsAuthenticated(true)
      setMessages([{
        id: Date.now(),
        text: `Olá, ${data.user.name}! Bem-vindo ao seu chatbot de roleplay imersivo. Como posso ajudá-lo hoje?`,
        sender: 'bot',
        timestamp: new Date()
      }])
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
      text: "Chat limpo! Vamos começar uma nova conversa. Como posso ajudá-lo?",
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
      // Chamar a API do backend
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentMessage,
          history: messages,
          userToken: userToken
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro na comunicação com o servidor')
      }

      const botResponse = {
        id: Date.now() + 1,
        text: data.response,
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-md mx-auto backdrop-blur-sm bg-white/10 border-white/20">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-white">
                Chatbot Roleplay
              </CardTitle>
              <p className="text-gray-300 mt-2">
                Entre com seu token de assinante para acessar a experiência imersiva
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
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
              <p className="text-xs text-gray-400 text-center">
                Apenas assinantes do Patreon têm acesso a este chatbot
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      {/* Header */}
      <motion.header 
        className="bg-black/20 backdrop-blur-sm border-b border-white/10 p-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Chatbot Roleplay</h1>
              <p className="text-sm text-gray-400">Experiência Imersiva</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
              Online
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={clearChat}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Limpar Chat
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Chat Area */}
      <div className="flex-1 max-w-4xl mx-auto w-full p-4">
        <Card className="h-full bg-black/20 backdrop-blur-sm border-white/10">
          <CardContent className="h-full p-0 flex flex-col">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start space-x-2`}>
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          message.sender === 'user' 
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500' 
                            : message.isError 
                              ? 'bg-red-500' 
                              : 'bg-gradient-to-r from-purple-500 to-pink-500'
                        }`}>
                          {message.sender === 'user' ? (
                            <User className="w-4 h-4 text-white" />
                          ) : (
                            <Bot className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div className={`px-4 py-2 rounded-2xl ${
                          message.sender === 'user'
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                            : message.isError
                              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                              : 'bg-white/10 text-white border border-white/20'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {/* Typing Indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex justify-start"
                  >
                    <div className="flex items-start space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-white/10 border border-white/20 px-4 py-2 rounded-2xl">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t border-white/10">
              <div className="flex space-x-2">
                <Input
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  disabled={isLoading}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">
                Pressione Enter para enviar • Shift+Enter para nova linha
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default App
