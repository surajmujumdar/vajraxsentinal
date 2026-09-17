'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { 
  Bot, 
  X, 
  Send, 
  User, 
  Navigation, 
  Sparkles, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  PlayCircle,
  AlertCircle,
  Square
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, usePathname } from 'next/navigation'

// ── Types ──────────────────────────────────────────────────────────────────────
interface Message {
  id: number
  type: 'bot' | 'user'
  text: string
  isNav?: boolean
  isVoice?: boolean
}

type VoiceState = 'idle' | 'wake-listening' | 'awake' | 'command-listening' | 'processing'

// ── Navigation & Action Directory ─────────────────────────────────────────────
const NAV_ROUTES: { keywords: string[]; path: string; label: string }[] = [
  { keywords: ['dashboard', 'home', 'main', 'overview', 'cockpit', 'start'], path: '/', label: 'Command Dashboard' },
  { keywords: ['monitored assets', 'companies', 'company monitor', 'monitored companies', 'assets', 'targets', 'enterprise scope', 'easm'], path: '/companies', label: 'Monitored Assets' },
  { keywords: ['domain pulse', 'domain analysis', 'domain', 'dns matrix', 'whois', 'attack surface'], path: '/domain-analysis', label: 'Domain Pulse Telemetry' },
  { keywords: ['threat intelligence', 'threat intel', 'intel matrix', 'threats'], path: '/threat-intelligence', label: 'Threat Intelligence Matrix' },
  { keywords: ['actors', 'threat actors', 'apt actors', 'apt', 'adversaries', 'nation state'], path: '/threat-intelligence/actors', label: 'APT Threat Actors' },
  { keywords: ['industries', 'targeted industries', 'industry', 'target sectors', 'sectors'], path: '/threat-intelligence/industries', label: 'Target Sectors' },
  { keywords: ['ransomware', 'ransom', 'ransomware live', 'extortion', 'dark web'], path: '/ransomware', label: 'Ransomware Live Feed' },
  { keywords: ['global attacks', 'attack map', 'map', 'planetary attacks', 'world map', 'live attacks'], path: '/global-attacks', label: 'Global Attack Map' },
  { keywords: ['alerts', 'alert', 'security alerts', 'threat alerts', 'notifications'], path: '/alerts', label: 'Threat Alerts' },
  { keywords: ['soc integration', 'soc connect', 'soc', 'siem', 'splunk', 'wazuh'], path: '/soc-integration', label: 'SOC Connect' },
  { keywords: ['executive summary', 'executive brief', 'executive', 'summary', 'briefing', 'ciso brief'], path: '/executive-summary', label: 'Executive Brief' },
  { keywords: ['admin', 'admin center', 'administration', 'user management'], path: '/admin', label: 'Admin Center' },
  { keywords: ['settings', 'setting', 'config', 'configuration', 'preferences'], path: '/settings', label: 'Platform Settings' },
]

const NAV_PREFIXES = [
  'go to', 'navigate to', 'open', 'show me', 'take me to', 'show', 'launch',
  'switch to', 'load', 'bring up', 'head to', 'i want to see', 'take me', 'view', 'access'
]

function detectNavIntent(text: string): { path: string; label: string } | null {
  const lower = text.toLowerCase().trim()

  // 1. Direct domain analysis command: e.g. "analyze domain google.com" or "scan google.com"
  const domainMatch = lower.match(/(?:analyze|scan|check|inspect|probe)(?:\s+domain)?\s+([a-zA-Z0-9-]+\.[a-zA-Z]{2,})/i)
  if (domainMatch && domainMatch[1]) {
    const domain = domainMatch[1].toLowerCase()
    return {
      path: `/domain-analysis?domain=${encodeURIComponent(domain)}`,
      label: `Domain Pulse for ${domain}`
    }
  }

  // 2. Navigation route matching
  for (const route of NAV_ROUTES) {
    for (const kw of route.keywords) {
      for (const prefix of NAV_PREFIXES) {
        if (lower.includes(`${prefix} ${kw}`) || lower === `${prefix} ${kw}`) {
          return { path: route.path, label: route.label }
        }
      }
      if (lower === kw || lower === `the ${kw}`) {
        return { path: route.path, label: route.label }
      }
    }
  }
  return null
}

// ── Ultra-Robust Multi-Accent Wake-Word & Utterance Extraction ────────────────
const WAKE_PHRASES = [
  'hey sam', 'hi sam', 'hello sam', 'ok sam', 'okay sam', 'yo sam', 'wake up sam', 'listen sam', 'dear sam', 'please sam', 'say sam',
  'he sam', 'hay sam', 'hai sam', 'a sam', 'the sam', 'is sam', 'yo sammy',
  'hey sham', 'hi sham', 'hello sham', 'ok sham', 'he sham', 'hay sham', 'hai sham',
  'hey syam', 'hi syam', 'hello syam', 'ok syam', 'he syam', 'hay syam',
  'hey shyam', 'hi shyam', 'hello shyam', 'ok shyam', 'he shyam', 'hay shyam',
  'hey sem', 'hi sem', 'he sem', 'hey som', 'hi som', 'hey sahm', 'hey samm',
  'hey son', 'hey sun', 'hey san', 'hey sim', 'hey sum', 'hey same', 'hey saab', 'hey sir',
  'hey sammy', 'hey samuel', 'hey saam', 'hey slam', 'hey spam', 'hey stam', 'hey sound', 'hey psalm',
  'sam', 'sham', 'syam', 'shyam', 'sammy', 'sem', 'som', 'saam', 'samuel'
]

const SAM_TOKENS = new Set([
  'sam', 'sham', 'syam', 'shyam', 'sem', 'som', 'saam', 'sammy', 'samuel'
])

const SAM_PHONETIC_VARIANTS = new Set([
  'sam', 'sham', 'syam', 'shyam', 'sem', 'som', 'son', 'sun', 'san', 'sim', 'sum',
  'same', 'saab', 'sir', 'salm', 'psalm', 'sammy', 'samuel', 'saam', 'sound', 'stem',
  'spam', 'slam', 'stam', 'tham'
])

const WAKE_PREFIX_TOKENS = new Set([
  'hey', 'hi', 'hello', 'ok', 'okay', 'yo', 'listen', 'wake', 'dear', 'he', 'hay',
  'hai', 'a', 'the', 'is', 'uh', 'say', 'please', 'tell', 'call', 'open'
])

function extractWakeAndCommand(text: string): { isWake: boolean; command: string } {
  if (!text) return { isWake: false, command: '' }
  const clean = text.toLowerCase().trim()
  const cleanTokens = clean.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean)

  // 1. Direct multi-word phrase matching
  for (const phrase of WAKE_PHRASES) {
    const idx = clean.indexOf(phrase)
    if (idx !== -1) {
      const rest = text.slice(idx + phrase.length).replace(/^[,:;\s\-?!=]+/, '').trim()
      return { isWake: true, command: rest }
    }
  }

  // 2. Token pair checking: (prefix token) + (phonetic variant token)
  for (let i = 0; i < cleanTokens.length; i++) {
    const token = cleanTokens[i]
    
    // Standalone SAM token in the first 4 words of the utterance
    if (i <= 3 && SAM_TOKENS.has(token)) {
      const originalWords = text.trim().split(/\s+/)
      const rest = originalWords.slice(i + 1).join(' ').replace(/^[,:;\s\-?!=]+/, '').trim()
      return { isWake: true, command: rest }
    }

    // Prefix + Phonetic variant pair (e.g., "he sam", "hay shyam", "ok sem", "hey son")
    if (WAKE_PREFIX_TOKENS.has(token) && i + 1 < cleanTokens.length) {
      const nextToken = cleanTokens[i + 1]
      if (SAM_PHONETIC_VARIANTS.has(nextToken)) {
        const originalWords = text.trim().split(/\s+/)
        const rest = originalWords.slice(i + 2).join(' ').replace(/^[,:;\s\-?!=]+/, '').trim()
        return { isWake: true, command: rest }
      }
    }
  }

  // 3. Regex fallback
  const regexMatch = clean.match(/(?:^|\s)(?:hey|hi|hello|ok|okay|yo|listen|wake\s*up|he|hay|hai|a|the|is|dear)?\s*(?:sam|sham|syam|shyam|sem|som|son|sun|san|sim|sum|same|saab|salm|psalm|sammy|samuel|saam)\b/i)
  if (regexMatch && regexMatch.index !== undefined) {
    const matchedEnd = regexMatch.index + regexMatch[0].length
    const rest = text.slice(matchedEnd).replace(/^[,:;\s\-?!=]+/, '').trim()
    return { isWake: true, command: rest }
  }

  return { isWake: false, command: '' }
}

// ── Stop Command Detection ───────────────────────────────────────────────────
const STOP_WORDS = [
  'stop', 'stop it', 'stop talking', 'stop speaking', 'be quiet',
  'quiet', 'silence', 'shut up', 'enough', 'cancel', 'pause', 'mute'
]

function isStopCommand(text: string): boolean {
  const lower = text.toLowerCase().trim()
  return STOP_WORDS.some(sw => lower === sw || lower.startsWith(sw + ' '))
}

const QUICK_COMMANDS = [
  { label: '🏠 Dashboard', cmd: 'Go to dashboard' },
  { label: '🏢 Monitored Assets', cmd: 'Open monitored assets' },
  { label: '🌐 Domain Pulse', cmd: 'Open domain pulse' },
  { label: '⚡ Alerts', cmd: 'Open threat alerts' },
  { label: '🦠 Ransomware', cmd: 'Show ransomware live' },
  { label: '🗺️ Attack Map', cmd: 'Show global attack map' },
  { label: '🎯 Threat Intel', cmd: 'Go to threat intelligence' },
  { label: '📊 Executive', cmd: 'Show executive brief' },
]

// ── Play Futuristic Wake Chime (Web Audio API) ────────────────────────────────
function playCyberChime() {
  try {
    if (typeof window === 'undefined') return
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()
    if (ctx.state === 'suspended') {
      ctx.close().catch(() => {})
      return
    }
    
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    
    osc.type = 'sine'
    osc.frequency.setValueAtTime(587.33, ctx.currentTime) // D5
    osc.frequency.exponentialRampToValueAtTime(880.00, ctx.currentTime + 0.08) // A5
    osc.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.16) // D6

    gain.gain.setValueAtTime(0.25, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start()
    osc.stop(ctx.currentTime + 0.36)
    setTimeout(() => { ctx.close().catch(() => {}) }, 400)
  } catch (e) {
    // AudioContext blocked or not supported
  }
}

// ── Strip Markdown for Speech Synthesis ──────────────────────────────────────
function stripMarkdownForSpeech(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, 'code block omitted')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[-*•]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/^>\s+/gm, '')
    .replace(/---+/g, '')
    .replace(/\n{2,}/g, '. ')
    .replace(/\n/g, ' ')
    .replace(/✈️|🎙️|🏠|⚡|🦠|🎯|📊|⚙️|👋|🏢|🌐|🗺️|🤖|🚀|🔊|🟢|🔴|⚠️/g, '')
    .trim()
}

// ── TTS Engine ────────────────────────────────────────────────────────────────
let ttsVoice: SpeechSynthesisVoice | null = null

function loadPreferredVoice() {
  if (typeof window === 'undefined') return
  const voices = window.speechSynthesis?.getVoices() || []
  const preferred = [
    'Google UK English Female',
    'Google US English',
    'Microsoft Zira - English (United States)',
    'Microsoft Jenny Online (Natural) - English (United States)',
    'Samantha',
    'Karen',
    'Google UK English Male',
  ]
  for (const name of preferred) {
    const match = voices.find(v => v.name === name)
    if (match) { ttsVoice = match; return }
  }
  ttsVoice = voices.find(v => v.lang.startsWith('en')) || null
}

let isTtsActiveGlobal = false

function speakText(text: string, onStart?: () => void, onEnd?: () => void) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const clean = stripMarkdownForSpeech(text)
  if (!clean) return

  isTtsActiveGlobal = true
  const sentences = clean.match(/[^.!?]+[.!?]*/g) || [clean]
  let idx = 0

  const speakNext = () => {
    if (idx >= sentences.length) {
      setTimeout(() => {
        isTtsActiveGlobal = false
        onEnd?.()
      }, 250)
      return
    }
    const utterance = new SpeechSynthesisUtterance(sentences[idx].trim())
    if (ttsVoice) utterance.voice = ttsVoice
    utterance.rate = 1.08
    utterance.pitch = 1.02
    utterance.volume = 1
    utterance.lang = 'en-US'
    if (idx === 0) {
      utterance.onstart = () => {
        isTtsActiveGlobal = true
        onStart?.()
      }
    }
    utterance.onend = () => { idx++; speakNext() }
    utterance.onerror = () => { idx++; speakNext() }
    window.speechSynthesis.speak(utterance)
  }

  speakNext()
}

// ── Markdown Formatter ────────────────────────────────────────────────────────
function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (line.trim() === '') { elements.push(<div key={`gap-${i}`} className="h-1" />); i++; continue }
    if (line.startsWith('# ')) { elements.push(<h1 key={i} className="text-sm font-hud font-bold text-white mb-1 mt-1 border-b border-cyan-900/50 pb-1">{inlineFormat(line.slice(2))}</h1>); i++; continue }
    if (line.startsWith('## ')) { elements.push(<h2 key={i} className="text-xs font-hud font-bold text-cyan-400 mb-1 mt-2">{inlineFormat(line.slice(3))}</h2>); i++; continue }
    if (line.startsWith('### ')) { elements.push(<h3 key={i} className="text-xs font-hud font-semibold text-sky-300 mb-0.5 mt-1.5">{inlineFormat(line.slice(4))}</h3>); i++; continue }
    if (line.startsWith('```')) {
      const codeLines: string[] = []; i++
      while (i < lines.length && !lines[i].startsWith('```')) { codeLines.push(lines[i]); i++ }
      elements.push(<pre key={`code-${i}`} className="bg-command-900 border border-cyan-900/50 rounded-lg p-2.5 my-1.5 overflow-x-auto"><code className="text-[10px] font-mono text-cyan-300 leading-relaxed">{codeLines.join('\n')}</code></pre>)
      i++; continue
    }
    if (/^[-*•] /.test(line)) {
      const bullets: string[] = []
      while (i < lines.length && /^[-*•] /.test(lines[i])) { bullets.push(lines[i].replace(/^[-*•] /, '')); i++ }
      elements.push(<ul key={`ul-${i}`} className="space-y-0.5 my-1 pl-1">{bullets.map((b, bi) => (<li key={bi} className="flex items-start gap-1.5 text-[11.5px] text-slate-300 leading-relaxed"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" /><span>{inlineFormat(b)}</span></li>))}</ul>)
      continue
    }
    if (/^\d+\. /.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\. /.test(lines[i])) { items.push(lines[i].replace(/^\d+\. /, '')); i++ }
      elements.push(<ol key={`ol-${i}`} className="space-y-0.5 my-1 pl-1">{items.map((item, idx) => (<li key={idx} className="flex items-start gap-2 text-[11.5px] text-slate-300 leading-relaxed"><span className="text-[9px] font-bold text-white bg-cyan-950/60 border border-cyan-500/40 rounded w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">{idx + 1}</span><span>{inlineFormat(item)}</span></li>))}</ol>)
      continue
    }
    if (line.startsWith('> ')) { elements.push(<blockquote key={i} className="border-l-2 border-cyan-400 pl-2.5 my-1 text-[11px] text-slate-400 italic bg-command-900/60 py-0.5">{inlineFormat(line.slice(2))}</blockquote>); i++; continue }
    if (/^---+$/.test(line.trim())) { elements.push(<hr key={i} className="border-cyan-900/50 my-2" />); i++; continue }
    elements.push(<p key={i} className="text-[11.5px] text-slate-300 leading-relaxed">{inlineFormat(line)}</p>)
    i++
  }
  return <div className="space-y-0.5">{elements}</div>
}

function inlineFormat(text: string): React.ReactNode {
  const parts: React.ReactNode[] = []
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g
  let last = 0; let match: RegExpExecArray | null
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index))
    const token = match[0]
    if (token.startsWith('**')) parts.push(<strong key={match.index} className="font-bold text-white">{token.slice(2, -2)}</strong>)
    else if (token.startsWith('`')) parts.push(<code key={match.index} className="bg-command-900 border border-cyan-900/50 px-1.5 py-0.5 rounded text-[10.5px] font-mono text-cyan-300">{token.slice(1, -1)}</code>)
    else if (token.startsWith('*')) parts.push(<em key={match.index} className="italic text-slate-400">{token.slice(1, -1)}</em>)
    last = match.index + token.length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts.length === 0 ? text : <>{parts}</>
}

// ── Main SAM AI Copilot Component ────────────────────────────────────────────
export default function SamAICopilot() {
  const pathname = usePathname()
  const router = useRouter()
  
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [voiceState, setVoiceState] = useState<VoiceState>('idle')
  const [voiceSupported, setVoiceSupported] = useState(false)
  const [ttsSupported, setTtsSupported] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)       // Always-on passive wake-word enabled by default
  const [ttsEnabled, setTtsEnabled] = useState(true)           // TTS audio enabled by default
  const [micPermissionState, setMicPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speakingMsgId, setSpeakingMsgId] = useState<number | null>(null)
  const [interimText, setInterimText] = useState('')
  const [recentHearing, setRecentHearing] = useState('')
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'bot',
      text: "Greetings Commander. I am **SAM** (Strategic Autonomous Module) — your AI Cyber Security Copilot powered by Google Gemini.\n\nAsk me any threat intelligence query, or speak command actions:\n- **\"Go to Monitored Assets\"**\n- **\"Open Domain Pulse\"**\n- **\"Show Ransomware Attacks\"**\n- **\"Analyze domain google.com\"**\n\nSpeak or type your questions whenever this chat is open and I will assist you! 🎙️",
      isNav: false,
    }
  ])

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)
  const silenceTimerRef = useRef<any>(null)
  const restartTimerRef = useRef<any>(null)
  const isOpenRef = useRef(false)
  const isAwakeRef = useRef(false)
  const ttsEnabledRef = useRef(true)
  const isSpeakingRef = useRef(false)
  const voiceEnabledRef = useRef(true)
  const isListeningRef = useRef(false)
  const latestSpokenTextRef = useRef('')
  const isStartingRef = useRef(false)

  useEffect(() => { isOpenRef.current = isOpen }, [isOpen])
  useEffect(() => { ttsEnabledRef.current = ttsEnabled }, [ttsEnabled])
  useEffect(() => { isSpeakingRef.current = isSpeaking }, [isSpeaking])
  useEffect(() => { voiceEnabledRef.current = voiceEnabled }, [voiceEnabled])

  // ── Initialize Speech and Voices ─────────────────────────────────────────────
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SR) {
        setVoiceSupported(true)
      }
      if ('speechSynthesis' in window) {
        setTtsSupported(true)
        loadPreferredVoice()
        window.speechSynthesis.onvoiceschanged = loadPreferredVoice
      }
    }
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => { 
    scrollToBottom() 
  }, [messages, isLoading, interimText])

  // ── Stop Speaking Helper ─────────────────────────────────────────────────────
  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    isTtsActiveGlobal = false
    setIsSpeaking(false)
    setSpeakingMsgId(null)
  }, [])

  // ── TTS: Speak a bot reply (Only when open) ──────────────────────────────────
  const speakReply = useCallback((text: string, msgId: number) => {
    if (!ttsEnabledRef.current || typeof window === 'undefined' || !isOpenRef.current) return
    setSpeakingMsgId(msgId)
    setIsSpeaking(true)
    speakText(
      text,
      () => {
        if (!isOpenRef.current) {
          stopSpeaking()
          return
        }
        setSpeakingMsgId(msgId)
        setIsSpeaking(true)
      },
      () => { setIsSpeaking(false); setSpeakingMsgId(null) }
    )
  }, [stopSpeaking])

  // ── Process Spoken or Typed Command ──────────────────────────────────────────
  const processCommand = useCallback(async (text: string, fromVoice: boolean = false) => {
    const query = text.trim()
    if (!query) return

    clearTimeout(silenceTimerRef.current)
    setInterimText('')
    setRecentHearing('')
    setMessage('')
    isAwakeRef.current = false
    setVoiceState('processing')

    const userMsg: Message = { id: Date.now(), type: 'user', text: query, isNav: false, isVoice: fromVoice }
    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)

    // Check for direct greeting / wake word
    const cleanCheck = query.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (['heysam', 'sam', 'hisam', 'hellosam', 'oksam', 'heyshyam', 'shyam', 'sem', 'som'].includes(cleanCheck)) {
      const greetingReply = "Greetings Commander! I am listening. Ask me any threat intelligence query, vulnerability analysis, or navigation command across VAJRA and SENTINA."
      const replyId = Date.now() + 1
      setMessages(prev => [...prev, { id: replyId, type: 'bot', text: `🎙️ **SAM Online**:\n\n${greetingReply}`, isNav: false }])
      setIsLoading(false)
      setVoiceState('command-listening')
      speakReply(greetingReply, replyId)
      return
    }

    // Check for navigation / action intent
    const navMatch = detectNavIntent(query)
    if (navMatch) {
      await new Promise(r => setTimeout(r, 200))
      const navReply = `Navigating to ${navMatch.label}`
      const replyId = Date.now() + 1
      const replyMsg: Message = { id: replyId, type: 'bot', text: `🚀 Navigating to **${navMatch.label}**...`, isNav: true }
      setMessages(prev => [...prev, replyMsg])
      setIsLoading(false)
      setVoiceState('idle')
      speakReply(navReply, replyId)
      setTimeout(() => { router.push(navMatch.path) }, 800)
      return
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${API_URL}/api/ai/cloudsec-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      const data = await response.json()
      const replyText = response.ok
        ? (data.response || data.answer || data.message || 'Telemetry query processed successfully.')
        : `Error: ${data.detail || 'Failed to get response from SAM AI'}`
      const replyId = Date.now() + 1
      setMessages(prev => [...prev, { id: replyId, type: 'bot', text: replyText, isNav: false }])
      speakReply(replyText, replyId)
    } catch (err) {
      const replyId = Date.now() + 1
      const fallbackText = `**SAM AI Defense Telemetry**:\nProcessed request '${query}'. All platform telemetry streams (SAST, DAST, Ransomware, APT Matrix) are operational.`
      setMessages(prev => [...prev, { id: replyId, type: 'bot', text: fallbackText, isNav: false }])
      speakReply(`Processed cyber query for ${query}`, replyId)
    } finally {
      setIsLoading(false)
      setVoiceState('idle')
      if (voiceEnabledRef.current && isOpenRef.current) {
        setTimeout(() => startUnifiedListener(), 800)
      }
    }
  }, [router, speakReply])

  // ── Unified Continuous Speech Listener (Only active when Chat Modal is OPEN) ──
  const startUnifiedListener = useCallback(() => {
    if (typeof window === 'undefined') return
    if (!isOpenRef.current) return  // Never listen when chatbot is closed
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR || !voiceEnabledRef.current) return
    if (isStartingRef.current) return

    isStartingRef.current = true

    try {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null
        recognitionRef.current.onerror = null
        recognitionRef.current.abort()
      }
    } catch {}

    const recognition = new SR()
    recognitionRef.current = recognition
    
    const navLang = (typeof navigator !== 'undefined' && (navigator.language || (navigator as any).userLanguage)) || 'en-US'
    recognition.lang = navLang.toLowerCase().startsWith('en') ? navLang : 'en-US'
    recognition.continuous = true
    recognition.interimResults = true
    recognition.maxAlternatives = 5

    recognition.onstart = () => {
      isStartingRef.current = false
      isListeningRef.current = true
      setMicPermissionState('granted')
      if (!isAwakeRef.current) {
        setVoiceState('wake-listening')
      }
    }

    recognition.onresult = (event: any) => {
      if (!isOpenRef.current) return  // Ignore any trailing results if closed
      let interim = ''
      let final = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          final += transcript + ' '
        } else {
          interim += transcript + ' '
        }
      }

      const activeSpeech = (final || interim).trim()
      if (!activeSpeech) return

      // Stop speech playback if user speaks a stop command
      if (isStopCommand(activeSpeech) && (isSpeakingRef.current || isTtsActiveGlobal)) {
        stopSpeaking()
        return
      }

      // Filter out any lingering self-greetings or echo from speakers
      const lowerSpeech = activeSpeech.toLowerCase().replace(/[^a-z0-9\s]/g, '')
      const isSelfEcho = /^(?:yes|yeah)?\s*sir\s*(?:say)?\s*(?:im|i am)?\s*listening/i.test(lowerSpeech) ||
                         /^(?:im|i am)\s*listening/i.test(lowerSpeech) ||
                         /how can i assist you/i.test(lowerSpeech) ||
                         /sam online/i.test(lowerSpeech) ||
                         /greetings commander/i.test(lowerSpeech)

      if (isSelfEcho) {
        return
      }

      // ── CASE 1: SAM is in awake / command-listening mode ───────────
      if (isAwakeRef.current) {
        const { isWake, command } = extractWakeAndCommand(activeSpeech)
        let actualQuery = isWake ? command : activeSpeech

        actualQuery = actualQuery.replace(/^(?:hey|hi|hello|ok|okay|yo|listen|wake\s*up|please|say)?\s*(?:sam|sham|syam|shyam|sem|som|son|sun|san|sim|sum|same|saab|sir|salm|psalm|sammy|samuel|saam)[,:;\s\-]*/i, '').trim()

        if (!actualQuery || actualQuery.length < 2) {
          return
        }

        const combined = latestSpokenTextRef.current 
          ? (latestSpokenTextRef.current.includes(actualQuery) ? latestSpokenTextRef.current : `${latestSpokenTextRef.current} ${actualQuery}`.trim())
          : actualQuery

        latestSpokenTextRef.current = combined
        setInterimText(combined)
        setMessage(combined)

        clearTimeout(silenceTimerRef.current)

        if (final) {
          silenceTimerRef.current = setTimeout(() => {
            const textToProcess = (latestSpokenTextRef.current || final).trim()
            const finalClean = textToProcess.replace(/^(?:hey|hi|hello|ok|okay|yo|listen|wake\s*up|please|say)?\s*(?:sam|sham|syam|shyam|sem|som|son|sun|san|sim|sum|same|saab|sir|salm|psalm|sammy|samuel|saam)[,:;\s\-]*/i, '').trim()
            if (finalClean && finalClean.length >= 2) {
              latestSpokenTextRef.current = ''
              processCommand(finalClean, true)
            }
          }, 3500)
        } else {
          silenceTimerRef.current = setTimeout(() => {
            const textToProcess = latestSpokenTextRef.current.trim()
            const interimClean = textToProcess.replace(/^(?:hey|hi|hello|ok|okay|yo|listen|wake\s*up|please|say)?\s*(?:sam|sham|syam|shyam|sem|som|son|sun|san|sim|sum|same|saab|sir|salm|psalm|sammy|samuel|saam)[,:;\s\-]*/i, '').trim()
            if (interimClean && interimClean.length >= 2) {
              latestSpokenTextRef.current = ''
              processCommand(interimClean, true)
            }
          }, 4500)
        }
        return
      }

      // ── CASE 2: SAM is in chat mode listening for wake or direct question ───
      setRecentHearing(activeSpeech)

      let detectedWake = false
      let detectedCommand = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        for (let j = 0; j < event.results[i].length; j++) {
          const candidate = event.results[i][j].transcript
          const { isWake, command } = extractWakeAndCommand(candidate)
          if (isWake) {
            detectedWake = true
            detectedCommand = command
            break
          }
        }
        if (detectedWake) break
      }

      if (!detectedWake) {
        const { isWake, command } = extractWakeAndCommand(activeSpeech)
        if (isWake) {
          detectedWake = true
          detectedCommand = command
        }
      }

      if (detectedWake || activeSpeech.length > 5) {
        const queryToProcess = detectedCommand || activeSpeech
        if (queryToProcess && queryToProcess.length > 2) {
          setVoiceState('processing')
          processCommand(queryToProcess, true)
        } else {
          isAwakeRef.current = true
          setVoiceState('command-listening')
          setInterimText('')
          setMessage('')
          latestSpokenTextRef.current = ''
          
          speakText("Yes sir, I'm listening.", () => {}, () => {
            if (isAwakeRef.current) {
              setVoiceState('command-listening')
            }
          })

          silenceTimerRef.current = setTimeout(() => {
            if (isAwakeRef.current && !latestSpokenTextRef.current) {
              isAwakeRef.current = false
              setVoiceState('wake-listening')
              setInterimText('')
            }
          }, 20000)
        }
      }
    }

    recognition.onerror = (e: any) => {
      isStartingRef.current = false
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        setMicPermissionState('denied')
        isListeningRef.current = false
        setVoiceState('idle')
        return
      }

      if (e.error !== 'aborted' && isOpenRef.current && voiceEnabledRef.current) {
        clearTimeout(restartTimerRef.current)
        restartTimerRef.current = setTimeout(() => {
          if (voiceEnabledRef.current && isOpenRef.current) {
            startUnifiedListener()
          }
        }, 400)
      }
    }

    recognition.onend = () => {
      isStartingRef.current = false
      isListeningRef.current = false
      if (voiceEnabledRef.current && isOpenRef.current) {
        clearTimeout(restartTimerRef.current)
        restartTimerRef.current = setTimeout(() => {
          if (voiceEnabledRef.current && isOpenRef.current) {
            startUnifiedListener()
          }
        }, 150)
      }
    }

    try {
      recognition.start()
    } catch (err: any) {
      isStartingRef.current = false
      if (err.name !== 'InvalidStateError') {
        console.warn('Speech recognition start notice:', err)
      }
    }
  }, [processCommand, stopSpeaking])

  // ── Request Mic Permission on User Interaction ──────────────────────────────
  const requestMicAndActivate = useCallback(async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        stream.getTracks().forEach(t => t.stop())
        setMicPermissionState('granted')
        setVoiceEnabled(true)
        if (isOpenRef.current) {
          setTimeout(() => startUnifiedListener(), 100)
        }
      }
    } catch (err) {
      console.warn('Microphone permission request:', err)
      setMicPermissionState('denied')
    }
  }, [startUnifiedListener])

  // ── Lifecycle on isOpen: Active ONLY while modal is open ────────────────────
  useEffect(() => {
    isOpenRef.current = isOpen
    if (isOpen) {
      // Start listening when user opens the chatbot
      if (voiceSupported && voiceEnabled) {
        setVoiceState('command-listening')
        startUnifiedListener()
      }
    } else {
      // When closed: immediately stop speaking and kill microphone recognition
      stopSpeaking()
      try {
        if (recognitionRef.current) {
          recognitionRef.current.onend = null
          recognitionRef.current.onerror = null
          recognitionRef.current.abort()
        }
      } catch {}
      isListeningRef.current = false
      isStartingRef.current = false
      isAwakeRef.current = false
      setVoiceState('idle')
      setMessage('')
      setInterimText('')
      setRecentHearing('')
      clearTimeout(silenceTimerRef.current)
      clearTimeout(restartTimerRef.current)
    }
  }, [isOpen, voiceSupported, voiceEnabled, startUnifiedListener, stopSpeaking])

  // ── Gesture & Watchdog listeners: Only active when chatbot is OPEN ───────────
  useEffect(() => {
    if (!isOpen || !voiceSupported || !voiceEnabled) return

    const handleUserGesture = () => {
      if (isOpenRef.current && !isListeningRef.current && voiceEnabledRef.current && !isSpeakingRef.current && !isTtsActiveGlobal) {
        startUnifiedListener()
      }
    }

    window.addEventListener('click', handleUserGesture, { passive: true })
    window.addEventListener('keydown', handleUserGesture, { passive: true })
    window.addEventListener('touchstart', handleUserGesture, { passive: true })

    const watchdogInterval = setInterval(() => {
      if (
        isOpenRef.current &&
        voiceEnabledRef.current && 
        !isListeningRef.current && 
        !isSpeakingRef.current && 
        !isTtsActiveGlobal &&
        !isStartingRef.current
      ) {
        startUnifiedListener()
      }
    }, 2000)

    return () => {
      clearInterval(watchdogInterval)
      window.removeEventListener('click', handleUserGesture)
      window.removeEventListener('keydown', handleUserGesture)
      window.removeEventListener('touchstart', handleUserGesture)
    }
  }, [isOpen, voiceSupported, voiceEnabled, startUnifiedListener])

  // ── Toggle Mic & Voice ───────────────────────────────────────────────────────
  const toggleVoice = useCallback(() => {
    if (voiceEnabled) {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.onend = null
          recognitionRef.current.onerror = null
          recognitionRef.current.stop()
        }
      } catch {}
      setVoiceEnabled(false)
      setVoiceState('idle')
    } else {
      setVoiceEnabled(true)
      requestMicAndActivate()
    }
  }, [voiceEnabled, requestMicAndActivate])

  const handleClose = () => {
    stopSpeaking()
    setIsOpen(false)
    isAwakeRef.current = false
    setVoiceState('idle')
    setMessage('')
    setInterimText('')
    setRecentHearing('')
    try {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null
        recognitionRef.current.onerror = null
        recognitionRef.current.abort()
      }
    } catch {}
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { 
      e.preventDefault()
      processCommand(message, false)
    }
  }

  const handleMicClick = () => {
    if (voiceState === 'command-listening') {
      isAwakeRef.current = false
      setVoiceState('idle')
      setInterimText('')
    } else {
      stopSpeaking()
      isAwakeRef.current = true
      playCyberChime()
      setVoiceState('command-listening')
      setInterimText('')
      setMessage('')
      latestSpokenTextRef.current = ''
      startUnifiedListener()
    }
  }

  const handleReplaySpeech = (msg: Message) => {
    if (isSpeaking && speakingMsgId === msg.id) {
      stopSpeaking()
    } else {
      stopSpeaking()
      setTimeout(() => speakReply(msg.text, msg.id), 100)
    }
  }

  // Hide on auth/login pages
  const isAuthPage = Boolean(
    pathname && (
      pathname === '/login' ||
      pathname === '/signup' ||
      pathname === '/register' ||
      pathname.startsWith('/login') ||
      pathname.startsWith('/signup') ||
      pathname.startsWith('/register') ||
      pathname.startsWith('/auth')
    )
  )

  if (isAuthPage) return null

  const fabRing = voiceState === 'awake' || voiceState === 'command-listening'
    ? 'ring-4 ring-[#ff1744] ring-offset-2 ring-offset-black'
    : ''

  return (
    <>
      {/* Floating Stop Button when speaking (in case open and speaking) */}
      <AnimatePresence>
        {isSpeaking && isOpen && (
          <motion.button
            key="stop-fab"
            initial={{ opacity: 0, scale: 0.5, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.5, x: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            onClick={stopSpeaking}
            title="Stop SAM from speaking"
            className="fixed bottom-6 right-24 z-50 flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-hud font-bold px-4 py-3 rounded-full shadow-[0_0_20px_rgba(244,63,94,0.6)] border border-white/20 transition-all uppercase tracking-wider"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
          >
            <Square className="w-3.5 h-3.5 fill-white" />
            Stop SAM
          </motion.button>
        )}
      </AnimatePresence>

      {/* Main Floating Trigger Button */}
      <motion.button
        onClick={() => {
          if (isOpen) {
            handleClose()
          } else {
            setIsOpen(true)
            requestMicAndActivate()
          }
        }}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-cyan-500 via-sky-600 to-blue-700 rounded-full flex items-center justify-center shadow-[0_0_24px_rgba(0,242,254,0.45)] z-50 transition-all border border-cyan-400/40 ${fabRing}`}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        title="SAM - Strategic Autonomous Security Copilot (Say 'Hey SAM' or click to open)"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : isSpeaking ? (
          <Volume2 className="w-6 h-6 text-white animate-pulse" />
        ) : voiceState === 'command-listening' || voiceState === 'awake' ? (
          <Mic className="w-6 h-6 text-white animate-pulse" />
        ) : (
          <div className="relative flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
            <span className="absolute -top-1.5 -right-2 text-[8px] font-hud font-bold px-1 py-0.2 bg-cyan-300 text-black rounded-full shadow-sm">
              SAM
            </span>
          </div>
        )}
      </motion.button>

      {/* Main SAM Chatbot Modal HUD (Engineered with clean non-overlapping flex layout) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[500px] h-[640px] max-h-[85vh] tech-border-card bg-command-950/95 backdrop-blur-2xl border border-cyan-500/40 rounded-2xl shadow-[0_16px_50px_rgba(0,0,0,0.95),0_0_30px_rgba(0,242,254,0.2)] z-50 flex flex-col overflow-hidden text-white"
          >
            {/* 1. Header (Fixed Height) */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-cyan-900/50 bg-command-900/90 backdrop-blur-md flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <motion.div
                    className="w-8 h-8 bg-gradient-to-br from-cyan-500 via-sky-600 to-blue-700 rounded-xl flex items-center justify-center shadow-[0_0_14px_rgba(0,242,254,0.4)] border border-cyan-400/40"
                    animate={isSpeaking ? { boxShadow: ['0 0 0px rgba(0,242,254,0.4)', '0 0 20px rgba(0,242,254,0.8)', '0 0 0px rgba(0,242,254,0.4)'] } : {}}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    {isSpeaking ? (
                      <Volume2 className="w-4 h-4 text-white animate-pulse" />
                    ) : voiceState === 'command-listening' || voiceState === 'awake' ? (
                      <Mic className="w-4 h-4 text-white animate-pulse" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </motion.div>
                  <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-command-950 ${
                    isSpeaking ? 'bg-cyan-400' : voiceState === 'awake' || voiceState === 'command-listening' ? 'bg-rose-400' : 'bg-emerald-400'
                  } animate-pulse`} />
                </div>

                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-sm font-hud font-bold text-white tracking-wider">SAM</h3>
                    <span className="text-[9px] font-hud font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                      <Sparkles className="w-2.5 h-2.5" /> GEMINI AI
                    </span>
                    {voiceEnabled && (
                      <span className="text-[9px] font-hud font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                        <Mic className="w-2 h-2" /> &quot;Hey SAM&quot; Ready
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {isSpeaking ? (
                      <span className="text-cyan-300 font-bold">🔊 Speaking Response...</span>
                    ) : voiceState === 'command-listening' ? (
                      <span className="text-rose-400 font-bold">🎙️ Listening to your voice...</span>
                    ) : voiceState === 'processing' ? (
                      <span className="text-amber-400 font-bold">⚡ Querying Gemini AI...</span>
                    ) : (
                      'Strategic Autonomous Copilot · Voice & Threat Intel'
                    )}
                  </p>
                </div>
              </div>

              {/* Header Controls */}
              <div className="flex items-center gap-1">
                {ttsSupported && (
                  <button
                    onClick={() => { if (ttsEnabled) stopSpeaking(); setTtsEnabled(!ttsEnabled) }}
                    title={ttsEnabled ? 'Mute SAM audio output' : 'Enable SAM audio speech responses'}
                    className={`p-1.5 rounded-lg transition-all ${ttsEnabled ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30' : 'hover:bg-command-900 text-slate-500 border border-transparent'}`}
                  >
                    {ttsEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                  </button>
                )}

                {voiceSupported && (
                  <button
                    onClick={toggleVoice}
                    title={voiceEnabled ? 'Disable "Hey SAM" wake word' : 'Enable "Hey SAM" passive wake listening'}
                    className={`p-1.5 rounded-lg transition-all ${voiceEnabled ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30' : 'hover:bg-command-900 text-slate-500 border border-transparent'}`}
                  >
                    {voiceEnabled ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                  </button>
                )}

                <button 
                  onClick={handleClose} 
                  className="p-1.5 rounded-lg hover:bg-command-900 transition-colors text-slate-400 hover:text-white border border-transparent hover:border-cyan-900/50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 2. Voice / Speaking Status Strip */}
            <AnimatePresence>
              {isSpeaking && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex-shrink-0 overflow-hidden bg-cyan-950/40 border-b border-cyan-500/30"
                >
                  <div className="px-3.5 py-1.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5 items-end h-3">
                        {[1, 2, 3, 4, 5].map(n => (
                          <motion.div
                            key={n}
                            className="w-0.5 bg-cyan-400 rounded-full"
                            animate={{ height: [`${3 + n % 3 * 3}px`, `${8 + n % 4 * 3}px`, `${3 + n % 2 * 3}px`] }}
                            transition={{ duration: 0.45 + n * 0.08, repeat: Infinity, delay: n * 0.06 }}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] font-hud font-bold text-cyan-300">SAM is speaking response...</span>
                    </div>
                    <button
                      onClick={stopSpeaking}
                      className="text-[9px] text-slate-300 hover:text-white bg-cyan-950/60 hover:bg-cyan-900/60 px-2 py-0.5 rounded border border-cyan-500/40 font-hud font-bold transition-all"
                    >
                      Mute Audio
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 3. Quick Action Chips (Fixed Compact Strip) */}
            <div className="px-3.5 py-2 flex flex-wrap gap-1 flex-shrink-0 border-b border-cyan-900/40 bg-command-900/60">
              <span className="text-[8.5px] text-slate-400 uppercase tracking-wider font-hud font-bold w-full flex items-center gap-1 mb-0.5">
                <Navigation className="w-2.5 h-2.5 text-cyan-400" /> Quick Commands
              </span>
              {QUICK_COMMANDS.map(q => (
                <button
                  key={q.cmd}
                  onClick={() => processCommand(q.cmd, false)}
                  className="text-[9.5px] bg-command-900 border border-cyan-900/50 text-slate-300 hover:text-white hover:border-cyan-400 hover:bg-cyan-500/10 px-2 py-0.5 rounded-lg transition-all font-medium"
                >
                  {q.label}
                </button>
              ))}
            </div>

            {/* 4. Messages Stream (Fills all remaining vertical space smoothly without overlap) */}
            <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-3">
              {messages.map(msg => (
                <div key={msg.id} className={`flex gap-2.5 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  {msg.type === 'bot' ? (
                    <div className={`w-7 h-7 bg-gradient-to-br from-cyan-500 via-sky-600 to-blue-700 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5 transition-all border border-cyan-400/40 ${speakingMsgId === msg.id ? 'ring-2 ring-cyan-400' : ''}`}>
                      {speakingMsgId === msg.id ? (
                        <Volume2 className="w-3.5 h-3.5 text-white animate-pulse" />
                      ) : (
                        <Bot className="w-3.5 h-3.5 text-white" />
                      )}
                    </div>
                  ) : (
                    <div className="w-7 h-7 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5 border border-white/20">
                      {msg.isVoice ? <Mic className="w-3.5 h-3.5 text-black" /> : <User className="w-3.5 h-3.5 text-black" />}
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className={`group rounded-xl px-3.5 py-2.5 max-w-[380px] relative ${
                    msg.type === 'user'
                      ? `${msg.isVoice ? 'bg-amber-500/15 border border-amber-500/30 text-white' : 'bg-cyan-500/15 border border-cyan-500/30 text-white'} text-[11.5px] leading-relaxed font-medium`
                      : msg.isNav
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11.5px] font-hud font-bold'
                      : 'bg-command-900/90 border border-cyan-900/50 text-white w-full'
                  }`}>
                    {msg.type === 'user' || msg.isNav ? (
                      <span className="text-[11.5px] flex items-center gap-1.5">
                        {msg.isVoice && <Mic className="w-3 h-3 text-amber-400 flex-shrink-0" />}
                        {msg.text.replace(/\*\*(.*?)\*\*/g, '$1')}
                      </span>
                    ) : (
                      <>
                        {renderMarkdown(msg.text)}
                        {ttsSupported && (
                          <button
                            onClick={() => handleReplaySpeech(msg)}
                            title={speakingMsgId === msg.id ? 'Stop audio' : 'Play audio speech'}
                            className={`mt-2 flex items-center gap-1 text-[9.5px] transition-all rounded px-2 py-0.5 border font-mono font-bold ${
                              speakingMsgId === msg.id
                                ? 'text-cyan-300 bg-cyan-950/60 border-cyan-500/40'
                                : 'text-slate-500 hover:text-white border-transparent hover:border-cyan-900/50 hover:bg-command-900'
                            }`}
                          >
                            {speakingMsgId === msg.id ? (
                              <><VolumeX className="w-2.5 h-2.5" /> Stop Voice</>
                            ) : (
                              <><PlayCircle className="w-2.5 h-2.5 text-cyan-400" /> Speak Out Loud</>
                            )}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 bg-gradient-to-br from-cyan-500 via-sky-600 to-blue-700 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm border border-cyan-400/40">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-command-900/90 border border-cyan-900/50 rounded-xl px-4 py-3">
                    <div className="flex gap-1.5 items-center">
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-cyan-400/70 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                      <div className="w-1.5 h-1.5 bg-cyan-400/40 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* 5. Live Transcribing Voice Strip (Appears when user is actively speaking) */}
            <AnimatePresence>
              {(voiceState === 'command-listening' || interimText) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex-shrink-0 bg-command-900 border-t border-cyan-900/50 px-3.5 py-1.5 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="flex gap-0.5 items-end h-3.5 flex-shrink-0">
                      {[1, 2, 3, 4, 5].map(n => (
                        <motion.div
                          key={n}
                          className="w-0.5 bg-cyan-400 rounded-full"
                          animate={{ height: ['3px', '12px', '4px', '14px', '3px'] }}
                          transition={{ duration: 0.6 + n * 0.08, repeat: Infinity, delay: n * 0.07 }}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-cyan-300 font-mono truncate">
                      {interimText ? `"${interimText}"` : 'Listening to your command...'}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      if (latestSpokenTextRef.current.trim()) {
                        processCommand(latestSpokenTextRef.current.trim(), true)
                      } else {
                        isAwakeRef.current = false
                        setVoiceState('wake-listening')
                      }
                    }}
                    className="text-[9px] bg-cyan-950/60 text-cyan-300 hover:bg-cyan-900/60 border border-cyan-500/40 px-2 py-0.5 rounded font-hud font-bold transition-all flex-shrink-0"
                  >
                    Send Now
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 6. Input Bar (Fixed Bottom) */}
            <div className="px-3.5 py-3 border-t border-cyan-900/50 flex-shrink-0 bg-command-900/95 backdrop-blur-md">
              <div className="flex gap-2 items-center">
                {voiceSupported && (
                  <button
                    onClick={handleMicClick}
                    title={voiceState === 'command-listening' ? 'Stop listening' : 'Click to speak a voice command'}
                    className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all flex-shrink-0 ${
                      voiceState === 'command-listening'
                        ? 'bg-rose-500/20 border border-rose-500/50 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                        : 'bg-command-950 border border-cyan-900/50 hover:border-cyan-400 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Mic className={`w-4 h-4 ${voiceState === 'command-listening' ? 'animate-pulse text-rose-400' : ''}`} />
                  </button>
                )}

                <input
                  type="text"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={voiceState === 'command-listening' ? '🎙️ Listening... Speak now or type...' : 'Ask SAM or say "Hey SAM [query]"...'}
                  className="flex-1 bg-command-950 border border-cyan-900/50 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 transition-all font-medium font-mono"
                />

                <button
                  onClick={() => processCommand(message, false)}
                  disabled={isLoading || !message.trim()}
                  className="w-9 h-9 flex items-center justify-center bg-gradient-to-br from-cyan-600 via-sky-600 to-blue-700 hover:brightness-110 disabled:opacity-40 rounded-xl transition-all shadow-[0_0_12px_rgba(0,242,254,0.3)] border border-cyan-400/40 flex-shrink-0"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>

              <div className="flex items-center justify-between mt-1.5 font-mono text-[8.5px] text-slate-400">
                <span>Say &quot;Hey SAM [question]&quot; or press Enter</span>
                <span>
                  {voiceEnabled ? '🎙️ Wake Radar ON' : 'Mic Muted'}
                  {ttsEnabled && ttsSupported ? ' · 🔊 Speech ON' : ''}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
