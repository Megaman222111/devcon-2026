'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  FileText,
  Languages,
  Loader2,
  MessageCircleQuestion,
  Send,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Mode = 'quiz' | 'translate'

const BUTTON_SIZE = 44
const PANEL_WIDTH = 340
const PANEL_HEIGHT = 520
const POSITION_STORAGE_KEY = 'ai-assistant-position'
const DRAG_THRESHOLD = 5

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface PdfFile {
  name: string
  mimeType: string
  data: string
  sizeKb: number
}

interface TranslationEntry {
  id: string
  original: string
  translated: string
  targetLang: string
}

const TARGET_LANGUAGES = [
  { code: 'fr', label: 'French' },
  { code: 'es', label: 'Spanish' },
  { code: 'de', label: 'German' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'it', label: 'Italian' },
  { code: 'zh-CN', label: 'Chinese' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ko', label: 'Korean' },
  { code: 'ar', label: 'Arabic' },
]

const MAX_PDF_BYTES = 18 * 1024 * 1024

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error ?? new Error('File read failed'))
    reader.onload = () => {
      const result = reader.result
      if (typeof result !== 'string') {
        reject(new Error('Unexpected file reader result'))
        return
      }
      const commaIdx = result.indexOf(',')
      resolve(commaIdx >= 0 ? result.slice(commaIdx + 1) : result)
    }
    reader.readAsDataURL(file)
  })
}

export function AiAssistant() {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<Mode>('quiz')
  const panelRef = useRef<HTMLDivElement>(null)

  // Draggable launcher position (top-left of the button, in viewport pixels)
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef<{
    pointerId: number | null
    startX: number
    startY: number
    originX: number
    originY: number
    moved: boolean
  }>({ pointerId: null, startX: 0, startY: 0, originX: 0, originY: 0, moved: false })

  // Initialize position from localStorage or default to bottom-left
  useEffect(() => {
    if (typeof window === 'undefined') return
    const margin = 16
    const defaultPos = {
      x: margin,
      y: window.innerHeight - BUTTON_SIZE - margin,
    }
    try {
      const stored = window.localStorage.getItem(POSITION_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as { x?: number; y?: number }
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          const clampedX = Math.max(8, Math.min(window.innerWidth - BUTTON_SIZE - 8, parsed.x))
          const clampedY = Math.max(8, Math.min(window.innerHeight - BUTTON_SIZE - 8, parsed.y))
          setPos({ x: clampedX, y: clampedY })
          return
        }
      }
    } catch {
      // ignore
    }
    setPos(defaultPos)
  }, [])

  // Re-clamp on window resize
  useEffect(() => {
    const handleResize = () => {
      setPos((prev) => {
        if (!prev) return prev
        return {
          x: Math.max(8, Math.min(window.innerWidth - BUTTON_SIZE - 8, prev.x)),
          y: Math.max(8, Math.min(window.innerHeight - BUTTON_SIZE - 8, prev.y)),
        }
      })
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleLauncherPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0 || !pos) return
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: pos.x,
      originY: pos.y,
      moved: false,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handleLauncherPointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current
    if (drag.pointerId !== event.pointerId) return
    const dx = event.clientX - drag.startX
    const dy = event.clientY - drag.startY
    if (!drag.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return
    if (!drag.moved) {
      drag.moved = true
      setIsDragging(true)
    }
    const nextX = Math.max(8, Math.min(window.innerWidth - BUTTON_SIZE - 8, drag.originX + dx))
    const nextY = Math.max(8, Math.min(window.innerHeight - BUTTON_SIZE - 8, drag.originY + dy))
    setPos({ x: nextX, y: nextY })
  }

  const handleLauncherPointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current
    if (drag.pointerId !== event.pointerId) return
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    if (drag.moved) {
      setIsDragging(false)
      try {
        if (pos) {
          window.localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(pos))
        }
      } catch {
        // ignore
      }
    }
    dragRef.current = { ...drag, pointerId: null }
  }

  const handleLauncherClick = () => {
    if (dragRef.current.moved) {
      // Reset so the next click works
      dragRef.current.moved = false
      return
    }
    setOpen((v) => !v)
  }

  // Compute panel position based on launcher position — flip into whichever
  // quadrant has the most space.
  const panelStyle = useMemo<React.CSSProperties>(() => {
    if (typeof window === 'undefined' || !pos) {
      return { left: 16, bottom: 80 }
    }
    const margin = 12
    const vw = window.innerWidth
    const vh = window.innerHeight
    const panelW = Math.min(PANEL_WIDTH, vw - 16)
    const panelH = Math.min(PANEL_HEIGHT, vh - 32)

    const spaceAbove = pos.y
    const spaceBelow = vh - (pos.y + BUTTON_SIZE)
    const openAbove = spaceAbove >= spaceBelow

    const top = openAbove
      ? Math.max(margin, pos.y - panelH - margin)
      : Math.min(vh - panelH - margin, pos.y + BUTTON_SIZE + margin)

    const buttonCenterX = pos.x + BUTTON_SIZE / 2
    const alignLeft = buttonCenterX <= vw / 2
    const left = alignLeft
      ? Math.min(vw - panelW - margin, Math.max(margin, pos.x))
      : Math.max(margin, Math.min(vw - panelW - margin, pos.x + BUTTON_SIZE - panelW))

    return { top, left, width: panelW, height: panelH }
  }, [pos, open])

  // Quiz state
  const [pdf, setPdf] = useState<PdfFile | null>(null)
  const [pdfError, setPdfError] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isAsking, setIsAsking] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Translate state
  const [translateActive, setTranslateActive] = useState(true)
  const [targetLang, setTargetLang] = useState('fr')
  const [translations, setTranslations] = useState<TranslationEntry[]>([])
  const [tooltip, setTooltip] = useState<{
    x: number
    y: number
    original: string
    translated: string | null
    loading: boolean
  } | null>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const lastSelectionRef = useRef<string>('')

  const targetLangLabel = useMemo(
    () => TARGET_LANGUAGES.find((entry) => entry.code === targetLang)?.label ?? targetLang,
    [targetLang]
  )

  useEffect(() => {
    if (!open) return
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open])

  useEffect(() => {
    if (mode !== 'quiz') return
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, mode])

  // Translation mode: listen for text selection on the page.
  useEffect(() => {
    if (!translateActive) {
      setTooltip(null)
      lastSelectionRef.current = ''
      return
    }

    const handleSelection = async () => {
      const selection = window.getSelection()
      if (!selection || selection.isCollapsed) {
        setTooltip(null)
        lastSelectionRef.current = ''
        return
      }
      const text = selection.toString().trim()
      if (!text || text.length < 2) {
        setTooltip(null)
        return
      }

      // Ignore selections inside the assistant panel or its tooltip
      const anchor = selection.anchorNode
      if (anchor instanceof Node) {
        if (panelRef.current?.contains(anchor) || tooltipRef.current?.contains(anchor)) {
          return
        }
      }

      if (text === lastSelectionRef.current) return
      lastSelectionRef.current = text

      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      const x = rect.left + rect.width / 2
      const y = rect.top - 8

      setTooltip({ x, y, original: text, translated: null, loading: true })

      try {
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, targetLang }),
        })
        if (!response.ok) {
          setTooltip({ x, y, original: text, translated: 'Translation failed.', loading: false })
          return
        }
        const payload = (await response.json()) as { translatedText?: string }
        const translated = payload.translatedText?.trim() || '—'
        setTooltip({ x, y, original: text, translated, loading: false })
        setTranslations((prev) => [
          { id: uid(), original: text, translated, targetLang },
          ...prev.filter((entry) => entry.original !== text).slice(0, 19),
        ])
      } catch {
        setTooltip({ x, y, original: text, translated: 'Translation failed.', loading: false })
      }
    }

    let timer: ReturnType<typeof setTimeout> | null = null
    const debounced = () => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(handleSelection, 250)
    }

    document.addEventListener('mouseup', debounced)
    document.addEventListener('keyup', debounced)
    return () => {
      if (timer) clearTimeout(timer)
      document.removeEventListener('mouseup', debounced)
      document.removeEventListener('keyup', debounced)
    }
  }, [translateActive, targetLang])

  // Reposition tooltip on scroll/resize
  useEffect(() => {
    if (!tooltip) return
    const update = () => {
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
        setTooltip(null)
        return
      }
      const rect = selection.getRangeAt(0).getBoundingClientRect()
      setTooltip((prev) => (prev ? { ...prev, x: rect.left + rect.width / 2, y: rect.top - 8 } : prev))
    }
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [tooltip])

  const handlePdfSelect = useCallback(async (file: File) => {
    setPdfError(null)
    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      setPdfError('Please upload a PDF file.')
      return
    }
    if (file.size > MAX_PDF_BYTES) {
      setPdfError('PDF is too large (max 18 MB).')
      return
    }
    try {
      const data = await fileToBase64(file)
      setPdf({
        name: file.name,
        mimeType: file.type || 'application/pdf',
        data,
        sizeKb: Math.round(file.size / 1024),
      })
      setMessages([
        {
          id: uid(),
          role: 'assistant',
          content: `I have your PDF "${file.name}" loaded. Ask me anything about it — I'll answer using only the document and cite page numbers when I can.`,
        },
      ])
    } catch {
      setPdfError('Could not read the file. Please try again.')
    }
  }, [])

  const handleSend = useCallback(async () => {
    const question = input.trim()
    if (!question || isAsking) return
    if (!pdf) {
      setPdfError('Upload a PDF first to ask questions about it.')
      return
    }

    const userMessage: ChatMessage = { id: uid(), role: 'user', content: question }
    const nextHistory = [...messages, userMessage]
    setMessages(nextHistory)
    setInput('')
    setIsAsking(true)

    try {
      const response = await fetch('/api/chat-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
          pdf: { name: pdf.name, mimeType: pdf.mimeType, data: pdf.data },
        }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        const reason = typeof payload?.error === 'string' ? payload.error : 'Something went wrong.'
        setMessages((prev) => [
          ...prev,
          { id: uid(), role: 'assistant', content: `⚠️ ${reason}` },
        ])
        return
      }

      const payload = (await response.json()) as { answer?: string }
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: 'assistant',
          content: payload.answer?.trim() || 'No answer was returned.',
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: uid(), role: 'assistant', content: '⚠️ Network error. Please try again.' },
      ])
    } finally {
      setIsAsking(false)
    }
  }, [input, isAsking, messages, pdf])

  const clearChat = () => {
    if (!pdf) {
      setMessages([])
      return
    }
    setMessages([
      {
        id: uid(),
        role: 'assistant',
        content: `I have your PDF "${pdf.name}" loaded. Ask me anything about it.`,
      },
    ])
  }

  const removePdf = () => {
    setPdf(null)
    setMessages([])
    setPdfError(null)
  }

  return (
    <>
      {/* Floating draggable launcher button */}
      {pos && (
        <button
          type="button"
          onPointerDown={handleLauncherPointerDown}
          onPointerMove={handleLauncherPointerMove}
          onPointerUp={handleLauncherPointerUp}
          onPointerCancel={handleLauncherPointerUp}
          onClick={handleLauncherClick}
          aria-label={open ? 'Close AI assistant' : 'Open AI assistant'}
          style={{
            left: pos.x,
            top: pos.y,
            width: BUTTON_SIZE,
            height: BUTTON_SIZE,
            touchAction: 'none',
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
          className={cn(
            'fixed z-50 flex items-center justify-center rounded-full shadow-lg shadow-amber-500/30 transition-shadow',
            'bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 hover:shadow-amber-500/50 select-none',
            isDragging && 'shadow-2xl shadow-amber-500/60 scale-105',
            !isDragging && open && 'scale-95'
          )}
        >
          {open ? <X size={18} /> : <Sparkles size={18} />}
        </button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            style={panelStyle}
            className={cn(
              'fixed z-50 flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20',
              'dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/60'
            )}
          >
            {/* Header */}
            <div className="border-b border-slate-200 bg-gradient-to-br from-amber-50 to-white px-4 py-3 dark:border-slate-700 dark:from-amber-500/10 dark:to-slate-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-slate-950">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">AI Assistant</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {mode === 'quiz' ? 'Ask anything about your PDF' : 'Highlight text on the page to translate'}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Mode tabs */}
              <div className="mt-3 grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setMode('quiz')}
                  className={cn(
                    'flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all',
                    mode === 'quiz'
                      ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-950 dark:text-white'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  )}
                >
                  <MessageCircleQuestion size={14} />
                  Quiz Mode
                </button>
                <button
                  type="button"
                  onClick={() => setMode('translate')}
                  className={cn(
                    'flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all',
                    mode === 'translate'
                      ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-950 dark:text-white'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  )}
                >
                  <Languages size={14} />
                  Translation
                  {translateActive && (
                    <span className="ml-0.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Body */}
            {mode === 'quiz' ? (
              <QuizPane
                pdf={pdf}
                pdfError={pdfError}
                messages={messages}
                input={input}
                isAsking={isAsking}
                messagesEndRef={messagesEndRef}
                onPdfSelect={handlePdfSelect}
                onRemovePdf={removePdf}
                onClearChat={clearChat}
                onInputChange={setInput}
                onSend={handleSend}
              />
            ) : (
              <TranslatePane
                active={translateActive}
                onToggle={setTranslateActive}
                targetLang={targetLang}
                onTargetLangChange={setTargetLang}
                targetLangLabel={targetLangLabel}
                translations={translations}
                onClear={() => setTranslations([])}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating translation tooltip */}
      <AnimatePresence>
        {translateActive && tooltip && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, y: 4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.12 }}
            style={{
              left: Math.max(12, Math.min(window.innerWidth - 12, tooltip.x)),
              top: Math.max(12, tooltip.y),
              transform: 'translate(-50%, -100%)',
            }}
            className="pointer-events-none fixed z-[60] max-w-xs rounded-2xl border border-amber-400/30 bg-slate-900 px-3 py-2 text-sm text-white shadow-2xl shadow-amber-500/20 dark:bg-slate-950"
          >
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300">
              {targetLangLabel}
            </div>
            <div className="mt-0.5 leading-snug">
              {tooltip.loading ? (
                <span className="inline-flex items-center gap-1.5 text-slate-300">
                  <Loader2 size={12} className="animate-spin" />
                  Translating…
                </span>
              ) : (
                tooltip.translated
              )}
            </div>
            <div className="mt-1 max-h-12 overflow-hidden text-xs italic leading-snug text-slate-400">
              {tooltip.original}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

interface QuizPaneProps {
  pdf: PdfFile | null
  pdfError: string | null
  messages: ChatMessage[]
  input: string
  isAsking: boolean
  messagesEndRef: React.RefObject<HTMLDivElement | null>
  onPdfSelect: (file: File) => void
  onRemovePdf: () => void
  onClearChat: () => void
  onInputChange: (value: string) => void
  onSend: () => void
}

function QuizPane({
  pdf,
  pdfError,
  messages,
  input,
  isAsking,
  messagesEndRef,
  onPdfSelect,
  onRemovePdf,
  onClearChat,
  onInputChange,
  onSend,
}: QuizPaneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* PDF section */}
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/60">
        {pdf ? (
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950">
            <FileText size={16} className="shrink-0 text-amber-600 dark:text-amber-400" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                {pdf.name}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{pdf.sizeKb} KB</div>
            </div>
            <button
              type="button"
              onClick={onClearChat}
              className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
              aria-label="Clear chat"
              title="Clear chat"
            >
              <Trash2 size={14} />
            </button>
            <button
              type="button"
              onClick={onRemovePdf}
              className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
              aria-label="Remove PDF"
              title="Remove PDF"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragOver(false)
              const file = e.dataTransfer.files?.[0]
              if (file) onPdfSelect(file)
            }}
            className={cn(
              'flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-5 transition-colors',
              dragOver
                ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/10'
                : 'border-slate-300 hover:border-amber-400 hover:bg-amber-50/50 dark:border-slate-700 dark:hover:border-amber-500/60 dark:hover:bg-amber-500/5'
            )}
          >
            <Upload size={20} className="text-amber-600 dark:text-amber-400" />
            <div className="text-sm font-semibold text-slate-900 dark:text-white">
              Upload a PDF
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Click or drag a file here (max 18 MB)
            </div>
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onPdfSelect(file)
            e.target.value = ''
          }}
        />
        {pdfError && (
          <div className="mt-2 text-xs font-medium text-rose-600 dark:text-rose-400">{pdfError}</div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
            <MessageCircleQuestion size={28} className="text-slate-400" />
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Quiz Mode
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Upload a PDF, then ask questions about it. Answers cite page numbers and stay grounded in the document.
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap',
                    message.role === 'user'
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
                  )}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isAsking && (
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <Loader2 size={14} className="animate-spin" />
                  Thinking…
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                onSend()
              }
            }}
            placeholder={pdf ? 'Ask a question about the PDF…' : 'Upload a PDF to begin…'}
            disabled={!pdf || isAsking}
            rows={1}
            className="max-h-32 min-h-[40px] flex-1 resize-none rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
          <button
            type="button"
            onClick={onSend}
            disabled={!pdf || isAsking || !input.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Send"
          >
            {isAsking ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      </div>
    </div>
  )
}

interface TranslatePaneProps {
  active: boolean
  onToggle: (value: boolean) => void
  targetLang: string
  onTargetLangChange: (value: string) => void
  targetLangLabel: string
  translations: TranslationEntry[]
  onClear: () => void
}

function TranslatePane({
  active,
  onToggle,
  targetLang,
  onTargetLangChange,
  targetLangLabel,
  translations,
  onClear,
}: TranslatePaneProps) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/60">
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            Selection translator
          </div>
          <button
            type="button"
            onClick={() => onToggle(!active)}
            className={cn(
              'relative h-6 w-11 shrink-0 rounded-full transition-colors',
              active ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
            )}
            aria-pressed={active}
            aria-label="Toggle translation mode"
          >
            <span
              className={cn(
                'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-all',
                active ? 'left-[22px]' : 'left-0.5'
              )}
            />
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <label htmlFor="target-lang" className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            Translate to
          </label>
          <select
            id="target-lang"
            value={targetLang}
            onChange={(e) => onTargetLangChange(e.target.value)}
            className="flex-1 rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            {TARGET_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        <div
          className={cn(
            'mt-3 rounded-xl border px-3 py-2 text-xs leading-relaxed',
            active
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200'
              : 'border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400'
          )}
        >
          {active ? (
            <>
              <span className="font-semibold">Translation mode is on.</span> Highlight any text on the page and a {targetLangLabel} translation will pop up.
            </>
          ) : (
            <>Toggle on to translate any text you select on the page.</>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            History
          </div>
          {translations.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="text-xs font-semibold text-slate-500 transition-colors hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400"
            >
              Clear
            </button>
          )}
        </div>

        {translations.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center gap-2 px-4 text-center">
            <Languages size={24} className="text-slate-400" />
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Selected text and translations will appear here.
            </div>
          </div>
        ) : (
          <ul className="space-y-2">
            {translations.map((entry) => (
              <li
                key={entry.id}
                className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-950"
              >
                <div className="text-sm leading-snug text-slate-900 dark:text-white">
                  {entry.translated}
                </div>
                <div className="mt-1 text-xs italic leading-snug text-slate-500 dark:text-slate-400">
                  {entry.original}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
