import { useEffect, useRef, useState } from 'react'
import { ArrowUp, RotateCcw, X } from 'lucide-react'
import { chatApiUrl, streamAnswer } from './chatClient'
import { suggestedQuestions } from './agentIntents'
import s from './Portfolio.module.css'

const AVATAR_SRC = '/assets/3d/jumin-character-poster.webp'
const STORAGE_KEY = 'jumin-chat-v1'
const OPEN_EVENT = 'jumin-chat:ask'
const GREETING = 'Hi, I’m Jumin’s portfolio assistant. Ask about my projects, process or background and I’ll answer from the work itself.'

// Anything on the page can hand the chat a question; the hero's prompt box does.
export function askJumin(question) {
  window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: { question } }))
}

const pickSuggestions = (asked, count = 3) => {
  const pool = suggestedQuestions.filter(question => !asked.includes(question))
  const picked = []
  while (picked.length < count && pool.length) picked.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0])
  return picked
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
  const [suggestions, setSuggestions] = useState(() => suggestedQuestions.slice(0, 3))
  const launcherRef = useRef(null)
  const inputRef = useRef(null)
  const logRef = useRef(null)
  const abortRef = useRef(null)
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
      update({ content: 'Something interrupted that answer. Try again in a moment, or email me at juminshi@usc.edu.', source: 'local', pending: false })
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
    const onAsk = event => { setOpen(true); window.setTimeout(() => send(event.detail?.question || ''), 60) }
    window.addEventListener(OPEN_EVENT, onAsk)
    return () => window.removeEventListener(OPEN_EVENT, onAsk)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    try { window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.filter(message => !message.pending))) } catch { /* storage may be unavailable */ }
    const log = logRef.current
    if (log) log.scrollTop = log.scrollHeight
  }, [messages])

  useEffect(() => {
    if (!open) return
    // Keyboards pop up on touch devices, so only pointer devices get the field focused for them.
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) inputRef.current?.focus()
    const onKey = event => { if (event.key === 'Escape') { setOpen(false); launcherRef.current?.focus() } }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

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
      aria-haspopup="dialog"
      aria-expanded={open}
      onClick={() => setOpen(current => !current)}
    >
      <span className={s.chatAvatar} aria-hidden="true"><img src={AVATAR_SRC} alt="" width="36" height="45" decoding="async" /></span>
      <span className={s.chatLauncherLabel}>Ask Jumin</span>
    </button>

    {open && <section className={s.chatPanel} role="dialog" aria-label="Chat with Jumin" data-chat-panel="true">
      <header className={s.chatHead}>
        <span className={s.chatAvatar} aria-hidden="true"><img src={AVATAR_SRC} alt="" width="36" height="45" decoding="async" /></span>
        <div className={s.chatTitle}>
          <strong>Jumin</strong>
          <span className={s.chatStatus}><i aria-hidden="true" />{chatApiUrl ? 'Online · answers from my portfolio' : 'Always on · answers from my portfolio'}</span>
        </div>
        <button type="button" className={s.chatIconButton} onClick={reset} disabled={!messages.length} aria-label="Start over" title="Start over"><RotateCcw size={16} aria-hidden="true" /></button>
        <button type="button" className={s.chatIconButton} onClick={() => { setOpen(false); launcherRef.current?.focus() }} aria-label="Close chat" title="Close"><X size={18} aria-hidden="true" /></button>
      </header>

      <div ref={logRef} className={s.chatLog} aria-live="polite">
        <div className={`${s.chatMsg} ${s.chatMsgBot}`}><p>{GREETING}</p></div>
        {messages.map(message => <div key={message.id} className={`${s.chatMsg} ${message.role === 'user' ? s.chatMsgUser : s.chatMsgBot}`} data-source={message.source}>
          {message.pending && !message.content
            ? <span className={s.chatTyping} aria-label="Jumin is typing"><i /><i /><i /></span>
            : message.role === 'user' ? <p>{message.content}</p> : renderMarkdown(message.content)}
          {message.source === 'local' && !message.pending && chatApiUrl && <small className={s.chatNote}>Answered from the portfolio index</small>}
        </div>)}
      </div>

      {!busy && <div className={s.chatSuggest} aria-label="Suggested questions">
        {suggestions.map(question => <button key={question} type="button" onClick={() => send(question)}>{question}</button>)}
      </div>}

      <form className={s.chatCompose} onSubmit={event => { event.preventDefault(); send(draft) }}>
        <label className="sr-only" htmlFor="chat-input">Message Jumin</label>
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
