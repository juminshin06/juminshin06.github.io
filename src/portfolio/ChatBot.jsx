import { useEffect, useRef, useState } from 'react'
import { ArrowUp, RotateCcw, X } from 'lucide-react'
import { chatApiUrl, streamAnswer } from './chatClient'
import { suggestedQuestions } from './localBrain'
import { pickThought } from './designThoughts'
import { setGuide, syncGuide } from './guide'
import s from './Portfolio.module.css'

const AVATAR_SRC = '/assets/character/jumin-avatar.png'
const STORAGE_KEY = 'jumin-chat-v1'
const OPEN_EVENT = 'jumin-chat:ask'
const GREETING = 'Hi, I’m Jumin’s portfolio assistant. Ask about her projects, process, skills or background, or tell me the role you’re hiring for and I’ll point you to the most relevant work.'

// Anything on the page can hand the chat a question; the hero's prompt box does.
export function askJumin(question) {
  window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: { question } }))
}
// Open the panel where the visitor is, keeping the conversation and any unsent draft.
export const openJuminChat = () => askJumin('')

// After the panel closes, focus returns to whatever opened it if that is still on screen,
// otherwise to the guide entry point that is showing now (the hero NPC or the corner button).
function focusEntry(opener) {
  const visible = element => element?.isConnected && element !== document.body && element.getClientRects().length > 0 && getComputedStyle(element).visibility !== 'hidden'
  const target = [opener, ...document.querySelectorAll('[data-guide-entry]'), document.getElementById('agent-input')].find(visible)
  target?.focus({ preventScroll: true })
}

const pickSuggestions = (asked, count = 3) => {
  const pool = suggestedQuestions.filter(question => !asked.includes(question))
  const picked = []
  while (picked.length < count && pool.length) picked.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0])
  return picked
}

// While an answer is on its way, a short status names what the assistant is doing, then the
// text streams in. These are the real steps: the reply is drawn from Jumin's portfolio index.
const THINKING_STEPS = ['Reading Jumin’s portfolio', 'Finding the most relevant work', 'Writing an answer']
function ThinkingStatus() {
  const [step, setStep] = useState(0)
  useEffect(() => {
    const timer = window.setInterval(() => setStep(current => Math.min(current + 1, THINKING_STEPS.length - 1)), 1300)
    return () => window.clearInterval(timer)
  }, [])
  return <span className={s.chatThinking} role="status">
    <span className={s.chatThinkingDot} aria-hidden="true" />
    <span key={step} className={s.chatThinkingText}>{THINKING_STEPS[step]}…</span>
  </span>
}

// Mid-stream text can end inside **bold** or a [link](…); hide the unfinished markup until it closes.
const tidyPartial = text => {
  let clean = text.replace(/\[([^\]\n]*)\]\([^)\n]*$/, '$1').replace(/\[[^\]\n]*$/, '')
  if ((clean.match(/\*\*/g) || []).length % 2) clean = clean.replace(/\*\*(?!.*\*\*)/s, '')
  return clean
}

// Markdown-lite for answers: paragraphs, "- " bullets, **bold** and [text](href).
function renderInline(text, keyBase) {
  const pattern = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g
  const nodes = []
  let last = 0
  let match
  while ((match = pattern.exec(text))) {
    if (match.index > last) nodes.push(text.slice(last, match.index))
    if (match[1]) nodes.push(<strong key={`${keyBase}-${match.index}`}>{match[1]}</strong>)
    else {
      const href = match[3]
      const external = /^https?:/.test(href) && !href.includes('juminshin06.github.io')
      nodes.push(<a key={`${keyBase}-${match.index}`} href={href} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>{match[2]}</a>)
    }
    last = match.index + match[0].length
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

function renderMarkdown(text) {
  return text.trim().split(/\n{2,}/).map((block, index) => {
    const lines = block.split('\n')
    if (lines.every(line => /^\s*[-•*]\s+/.test(line))) {
      return <ul key={index}>{lines.map((line, li) => <li key={li}>{renderInline(line.replace(/^\s*[-•*]\s+/, ''), `${index}-${li}`)}</li>)}</ul>
    }
    return <p key={index}>{lines.map((line, li) => <span key={li}>{li > 0 && <br />}{renderInline(line.replace(/^\s*[-•*]\s+/, '• '), `${index}-${li}`)}</span>)}</p>
  })
}

export default function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState('')
  const [suggestions, setSuggestions] = useState(() => suggestedQuestions.slice(0, 3))
  const launcherRef = useRef(null)
  const inputRef = useRef(null)
  const logRef = useRef(null)
  const suggestRef = useRef(null)
  const abortRef = useRef(null)
  const openerRef = useRef(null)
  const messagesRef = useRef(messages)
  messagesRef.current = messages

  const send = async text => {
    const question = text.trim()
    if (!question || busy) return
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    const history = messagesRef.current.filter(message => !message.pending).map(({ role, content }) => ({ role, content }))
    const userMessage = { id: `${Date.now()}-u`, role: 'user', content: question }
    const replyId = `${Date.now()}-a`
    setMessages(current => [...current, userMessage, { id: replyId, role: 'assistant', content: '', pending: true }])
    setDraft('')
    setBusy(true)
    const update = patch => setMessages(current => current.map(message => (message.id === replyId ? { ...message, ...patch } : message)))
    try {
      const { text: answer, source } = await streamAnswer([...history, userMessage], {
        signal: controller.signal,
        onDelta: partial => update({ content: partial }),
      })
      update({ content: answer, source, pending: false })
    } catch {
      update({ content: 'Something interrupted that answer. Try again in a moment, or email Jumin at juminshi@usc.edu.', source: 'local', pending: false })
    } finally {
      if (abortRef.current === controller) { abortRef.current = null; setBusy(false) }
      setSuggestions(pickSuggestions([...messagesRef.current.map(message => message.content), question]))
    }
  }

  useEffect(() => {
    try {
      const saved = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || '[]')
      if (Array.isArray(saved) && saved.length) setMessages(saved.filter(message => !message.pending))
    } catch { /* ignore a bad cache */ }
    const onAsk = event => {
      const question = event.detail?.question || ''
      if (!openerRef.current) openerRef.current = document.activeElement
      setOpen(true)
      if (question) window.setTimeout(() => send(question), 60)
    }
    window.addEventListener(OPEN_EVENT, onAsk)
    return () => window.removeEventListener(OPEN_EVENT, onAsk)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    try { window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.filter(message => !message.pending))) } catch { /* storage may be unavailable */ }
    const log = logRef.current
    if (log) log.scrollTop = log.scrollHeight
  }, [messages])

  useEffect(() => { syncGuide() }, [])
  useEffect(() => {
    setGuide({ chatOpen: open })
    if (!open) return
    setNote(current => pickThought(current))
    // Keyboards pop up on touch devices, so only pointer devices get the field focused for them.
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) inputRef.current?.focus({ preventScroll: true })
    const onKey = event => { if (event.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const close = () => {
    const opener = openerRef.current
    openerRef.current = null
    setOpen(false)
    // Wait a frame so the guide entry for this scroll position is back before focusing it.
    window.requestAnimationFrame(() => focusEntry(opener))
  }

  // A vertical mouse wheel over the suggestion row scrolls it sideways, so every question is reachable.
  useEffect(() => {
    const row = suggestRef.current
    if (!row) return
    const onWheel = event => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX) || row.scrollWidth <= row.clientWidth) return
      event.preventDefault()
      row.scrollLeft += event.deltaY
    }
    row.addEventListener('wheel', onWheel, { passive: false })
    return () => row.removeEventListener('wheel', onWheel)
  }, [open, busy])

  const grow = element => {
    element.style.height = 'auto'
    element.style.height = `${Math.min(element.scrollHeight, 132)}px`
  }
  const reset = () => { abortRef.current?.abort(); setMessages([]); setBusy(false); setSuggestions(pickSuggestions([])); inputRef.current?.focus() }

  return <>
    <button
      ref={launcherRef}
      type="button"
      className={s.chatLauncher}
      data-chat-launcher="true"
      data-guide-entry="dock"
      aria-haspopup="dialog"
      aria-expanded={open}
      onClick={() => { openerRef.current = launcherRef.current; setOpen(true) }}
    >
      <span className={s.chatAvatar} aria-hidden="true"><img src={AVATAR_SRC} alt="" width="36" height="36" decoding="async" /></span>
      <span className={s.chatLauncherLabel}>Ask about Jumin</span>
    </button>

    {open && <section className={s.chatPanel} role="dialog" aria-label="Jumin’s portfolio assistant" data-chat-panel="true">
      <header className={s.chatHead}>
        <span className={s.chatAvatar} aria-hidden="true"><img src={AVATAR_SRC} alt="" width="36" height="36" decoding="async" /></span>
        <div className={s.chatTitle}>
          <strong>Jumin’s portfolio assistant</strong>
          <span className={s.chatStatus}><i aria-hidden="true" />{chatApiUrl ? 'Online · answers from her portfolio' : 'Always on · answers from her portfolio'}</span>
        </div>
        <button type="button" className={s.chatIconButton} onClick={reset} disabled={!messages.length} aria-label="Start over" title="Start over"><RotateCcw size={16} aria-hidden="true" /></button>
        <button type="button" className={s.chatIconButton} onClick={close} aria-label="Close chat" title="Close"><X size={18} aria-hidden="true" /></button>
      </header>

      <div ref={logRef} className={s.chatLog} aria-live="polite">
        <div className={`${s.chatMsg} ${s.chatMsgBot}`}><p>{GREETING}</p>{note && <p className={s.chatValue}><span>Design note</span>{note}</p>}</div>
        {messages.map(message => <div key={message.id} className={`${s.chatMsg} ${message.role === 'user' ? s.chatMsgUser : s.chatMsgBot}`} data-source={message.source} data-streaming={message.pending && message.content ? 'true' : undefined}>
          {message.pending && !message.content
            ? <ThinkingStatus />
            : message.role === 'user' ? <p>{message.content}</p> : renderMarkdown(message.pending ? tidyPartial(message.content) : message.content)}
          {message.source === 'local' && !message.pending && chatApiUrl && <small className={s.chatNote}>Answered from the portfolio index</small>}
        </div>)}
      </div>

      {!busy && <div ref={suggestRef} className={s.chatSuggest} aria-label="Suggested questions">
        {suggestions.map(question => <button key={question} type="button" onClick={() => send(question)}>{question}</button>)}
      </div>}

      <form className={s.chatCompose} onSubmit={event => { event.preventDefault(); send(draft) }}>
        <label className="sr-only" htmlFor="chat-input">Message the portfolio assistant</label>
        <textarea
          id="chat-input"
          ref={inputRef}
          rows={1}
          value={draft}
          placeholder="Message"
          enterKeyHint="send"
          onChange={event => { setDraft(event.target.value); grow(event.target) }}
          onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); send(draft) } }}
        />
        <button type="submit" className={s.chatSend} aria-label="Send" disabled={!draft.trim() || busy}><ArrowUp size={18} aria-hidden="true" /></button>
      </form>
    </section>}
  </>
}
