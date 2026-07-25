'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Send, X, Sparkles, User } from 'lucide-react'

// ---- Types ----
interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

const QUICK_QUESTIONS = [
  'Best Wi-Fi in KL?',
  'Cheapest coworking?',
  'Quiet cafes?',
  'Digital nomad visa tips?',
  'Best area for remote work?',
]

// ---- Typing indicator dots ----
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-[#e0c97f]/50"
          animate={{
            y: [0, -4, 0],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

// ---- Main Component ----
export function AIChatAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Connect to Socket.IO chat service
  useEffect(() => {
    const socket = io('/?XTransformPort=3005', {
      transports: ['websocket', 'polling'],
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      setIsConnected(true)
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
    })

    socket.on('ai-message', (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg])
    })

    socket.on('typing', (data: { isTyping: boolean }) => {
      setIsTyping(data.isTyping)
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  const sendMessage = useCallback((text: string) => {
    const trimmed = text.trim()
    if (!trimmed || !socketRef.current?.connected) return

    // Add user message to chat
    const userMsg: ChatMessage = {
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInputValue('')

    // Emit to server
    socketRef.current.emit('message', { content: trimmed })
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(inputValue)
    }
  }

  const handleQuickQuestion = (question: string) => {
    sendMessage(question)
  }

  // Render a single message
  const renderMessage = (msg: ChatMessage, index: number) => {
    const isUser = msg.role === 'user'
    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 8, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      >
        {/* Avatar */}
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
            isUser
              ? 'bg-[#e0c97f]/20 border border-[#e0c97f]/15'
              : 'bg-gradient-to-br from-[#e0c97f]/30 to-[#e94560]/20 border border-[#e0c97f]/20'
          }`}
        >
          {isUser ? (
            <User className="w-3.5 h-3.5 text-[#e0c97f]" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-[#e0c97f]" />
          )}
        </div>

        {/* Message bubble */}
        <div
          className={`max-w-[75%] rounded-xl px-3 py-2 text-[13px] leading-relaxed ${
            isUser
              ? 'bg-[#e0c97f]/12 border border-[#e0c97f]/15 text-[#e0c97f]'
              : 'bg-[#0d1b2a]/80 border border-[#e0c97f]/8 text-[#e0c97f]/85'
          }`}
        >
          <div className="whitespace-pre-wrap break-words">{msg.content}</div>
        </div>
      </motion.div>
    )
  }

  return (
    <>
      {/* ---- Floating Toggle Button ---- */}
      <motion.button
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{
          opacity: isOpen ? 0 : 1,
          scale: isOpen ? 0.5 : 1,
        }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 z-30 w-12 h-12 rounded-full glass-strong flex items-center justify-center cursor-pointer pulse-gold hover:scale-110 active:scale-95 transition-transform group"
        aria-label="Open AI Chat Assistant"
      >
        <Bot className="w-5 h-5 text-[#e0c97f] group-hover:text-[#e0c97f] transition-colors" />
        {/* Connection indicator */}
        <div
          className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0d1b2a] ${
            isConnected ? 'bg-green-500' : 'bg-[#e94560]'
          }`}
        />
      </motion.button>

      {/* ---- Chat Panel ---- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 right-4 z-40 w-80 rounded-2xl overflow-hidden shadow-2xl shadow-black/50"
            style={{
              background: 'rgba(13, 27, 42, 0.95)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              border: '1px solid rgba(224, 201, 127, 0.2)',
            }}
          >
            {/* Gradient top accent */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#e0c97f]/40 to-transparent" />

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#e0c97f]/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#e0c97f]/30 to-[#e94560]/20 border border-[#e0c97f]/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#e0c97f]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#e0c97f]">NomadMY AI</h3>
                  <p
                    className={`text-[10px] ${
                      isConnected
                        ? 'text-green-400/70'
                        : 'text-[#e94560]/70'
                    }`}
                  >
                    {isConnected ? '● Online' : '● Reconnecting...'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-[#e0c97f]/30 hover:text-[#e0c97f] hover:bg-[#e0c97f]/8 transition-all"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages area */}
            <div className="max-h-96 overflow-y-auto px-4 py-3 space-y-3">
              {messages.map((msg, i) => renderMessage(msg, i))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#e0c97f]/30 to-[#e94560]/20 border border-[#e0c97f]/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-[#e0c97f]" />
                  </div>
                  <div className="bg-[#0d1b2a]/80 border border-[#e0c97f]/8 rounded-xl">
                    <TypingIndicator />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick questions */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2">
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleQuickQuestion(q)}
                      disabled={isTyping || !isConnected}
                      className="px-2.5 py-1.5 rounded-full text-[10px] font-medium border border-[#e0c97f]/12 text-[#e0c97f]/55 hover:bg-[#e0c97f]/8 hover:text-[#e0c97f] hover:border-[#e0c97f]/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input area */}
            <div className="px-3 pb-3 pt-1 border-t border-[#e0c97f]/8">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about workspaces..."
                  disabled={!isConnected}
                  className="flex-1 px-3.5 py-2.5 bg-[#e0c97f]/5 border border-[#e0c97f]/10 rounded-xl text-sm text-[#e0c97f] placeholder:text-[#e0c97f]/25 focus:outline-none focus:border-[#e0c97f]/25 focus:bg-[#e0c97f]/8 transition-all disabled:opacity-40"
                />
                <button
                  onClick={() => sendMessage(inputValue)}
                  disabled={!inputValue.trim() || isTyping || !isConnected}
                  className="w-9 h-9 rounded-xl bg-[#e0c97f]/15 border border-[#e0c97f]/20 flex items-center justify-center text-[#e0c97f] hover:bg-[#e0c97f]/25 hover:text-[#e0c97f] transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
